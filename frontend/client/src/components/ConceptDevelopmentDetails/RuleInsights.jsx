
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useClient } from "../../context/ClientContext";
import { useAuth } from "../../auth/AuthProvider";
import {
  CONCEPT_DEVELOPMENT_API_ENDPOINTS,
  getConceptDevelopmentRuleInsightsUrl,
  normalizeClientId,
  resolveUserId,
} from "../../config/apiConfig";

const formatValue = (value) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") return value.toLocaleString("en-US");
  if (typeof value === "string" && value.trim() === "") return "-";
  return value;
};

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const ensureAbsoluteUrl = (value) => {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const pickPrompt = (query) =>
  query?.prompt ||
  query?.natural_language_prompt ||
  query?.natural_lang_prompt ||
  query?.nl_prompt ||
  query?.query_prompt ||
  "-";

const pickSql = (query) => query?.sql_query || query?.sql || query?.query || "-";

const pickOpportunity = (query) =>
  query?.opportunity_size ??
  query?.opportunity_amount ??
  query?.opportunity ??
  null;

const pickDocUrl = (query) =>
  query?.review_document_url || query?.review_document || "";

const pickApprovalStatus = (query) =>
  String(query?.approval_status ?? query?.approvalStatus ?? "")
    .trim()
    .toLowerCase();

const normalizeForMatch = (value) => String(value || "").replace(/\s+/g, " ").trim();

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getMatchingResolutionSteps = (prompt, steps) => {
  const normalizedPrompt = normalizeForMatch(prompt).toLowerCase();
  if (!normalizedPrompt) return [];

  return (steps || []).filter((step) => {
    const statement = normalizeForMatch(step?.statement).toLowerCase();
    return statement && normalizedPrompt.includes(statement);
  });
};

const renderPromptWithResolutionHighlights = (prompt, matchingSteps) => {
  const text = String(prompt || "-");
  const matches = (matchingSteps || [])
    .map((step) => {
      const statement = String(step?.statement || "").trim();
      if (!statement) return null;
      const pattern = statement.split(/\s+/).map(escapeRegExp).join("\\s+");
      const match = text.match(new RegExp(pattern, "i"));
      if (!match || match.index === undefined) return null;
      return { start: match.index, end: match.index + match[0].length };
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start);

  if (!matches.length) return text;

  const parts = [];
  let cursor = 0;
  matches.forEach((match, index) => {
    if (match.start < cursor) return;
    if (match.start > cursor) {
      parts.push(text.slice(cursor, match.start));
    }
    parts.push(
      <mark className="resolution-highlight" key={`resolution-highlight-${index}`}>
        {text.slice(match.start, match.end)}
      </mark>
    );
    cursor = match.end;
  });
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
};

const resolveCurrentUserEmail = (account) =>
  String(
    account?.idTokenClaims?.email ||
      account?.idTokenClaims?.preferred_username ||
      account?.idTokenClaims?.upn ||
      account?.email ||
      account?.username ||
      resolveUserId(account) ||
      ""
  )
    .trim()
    .toLowerCase();

const RETURN_TO_REVIEW_ALLOWED_USERS = new Set([
  "chris.hall@gainwelltechnologies.com",
  "matthew.giering@gainwelltechnologies.com",
  // "local.dev@gainwelltechnologies.com",
]);

export const RuleInsights = ({ selectedRuleContext, setToast }) => {
  const { client } = useClient();
  const { account } = useAuth();
  const policy = selectedRuleContext?.policy;
  const rule = selectedRuleContext?.rule;
  const policyId = policy?.policy_id;
  const ruleId = rule?.rule_id;
  const feedbackProvidedBy =
    selectedRuleContext?.feedbackProvidedBy ??
    "";

  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [isCombinedOpen, setIsCombinedOpen] = useState(false);
  const [combinedPrompt, setCombinedPrompt] = useState("");
  const [combinedSql, setCombinedSql] = useState("");
  const [combinedOpportunity, setCombinedOpportunity] = useState("");
  const [combinedDocUrl, setCombinedDocUrl] = useState("");
  const [combinedQueryId, setCombinedQueryId] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [shouldScrollToCombined, setShouldScrollToCombined] = useState(false);
  const [isReturningToReview, setIsReturningToReview] = useState(false);
  const pendingCombinedPrefillRef = useRef(null);
  const combinedSectionRef = useRef(null);

  const handleCopy = async (value) => {
    const text = value ? String(value) : "";
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setCopyStatus("Copied !!");
        setTimeout(() => setCopyStatus(""), 2000);
        return;
      } catch (err) {
        // fall back to execCommand
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      setCopyStatus("Copied !!");
      setTimeout(() => setCopyStatus(""), 2000);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const ruleInsightQueries = useMemo(() => {
    const items = insights?.rule_insight_queries;
    return Array.isArray(items) ? items : [];
  }, [insights]);

  const nonSqlConvertibleSteps = useMemo(() => {
    const items = insights?.non_sql_convertible_steps;
    return Array.isArray(items) ? items : [];
  }, [insights]);

  const decomposedQueries = useMemo(
    () => ruleInsightQueries.filter((query) => query?.decomp_ind),
    [ruleInsightQueries]
  );

  const isFinalizedOnly = useMemo(() => {
    if (ruleInsightQueries.length !== 1) return false;
    const status = pickApprovalStatus(ruleInsightQueries[0]);
    return status === "ready to review" || status === "accept" || status === "reject";
  }, [ruleInsightQueries]);

  const reviewQueries =
    decomposedQueries.length > 0 ? decomposedQueries : ruleInsightQueries;

  const resetCombinedInputs = () => {
    setCombinedPrompt("");
    setCombinedSql("");
    setCombinedOpportunity("");
    setCombinedDocUrl("");
    setCombinedQueryId("");
  };

  const handleCreateFinalQuery = () => {
    resetCombinedInputs();
    setShouldScrollToCombined(false);
    setIsCombinedOpen(true);
  };

  const handleUseContent = (query) => {
    setCombinedPrompt(pickPrompt(query));
    setCombinedSql(pickSql(query));
    const opportunityValue = pickOpportunity(query);
    setCombinedOpportunity(
      opportunityValue === null || opportunityValue === undefined
        ? ""
        : String(opportunityValue)
    );
    setCombinedDocUrl("");
    setCombinedQueryId(query?.query_id ?? query?.id ?? "");
    setShouldScrollToCombined(true);
    setIsCombinedOpen(true);
  };

  const handleReturnToReview = async (query) => {
    if (!canReturnToReview) return;
    if (!client || !policyId || !ruleId) return;

    const prefetchedOpportunity = pickOpportunity(query);
    pendingCombinedPrefillRef.current = {
      prompt: pickPrompt(query),
      sql: pickSql(query),
      opportunity:
        prefetchedOpportunity === null || prefetchedOpportunity === undefined
          ? ""
          : String(prefetchedOpportunity),
      docUrl: pickDocUrl(query) || "",
      queryId: query?.query_id ?? query?.id ?? "",
    };
    setIsReturningToReview(true);
    try {
      const userId = resolveUserId(account);
      const payload = {
        client_id: normalizeClientId(client),
        user_id: userId,
        policy_id: String(policyId),
        rule_id: String(ruleId),
      };

      const response = await fetch(CONCEPT_DEVELOPMENT_API_ENDPOINTS.RETURN_TO_REVIEW, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let detail = "";
        try {
          const errorPayload = await response.json();
          detail = errorPayload?.detail || JSON.stringify(errorPayload);
        } catch (parseErr) {
          detail = response.statusText || "Request failed.";
        }
        throw new Error(detail || "Failed to return rule to review.");
      }

      setRefreshTick((prev) => prev + 1);
    } catch (err) {
      pendingCombinedPrefillRef.current = null;
      if (setToast) {
        setToast({
          open: true,
          message: JSON.parse(err?.message)?.message || "Failed to return rule to review.",
          severity: "error",
        });
      }
    } finally {
      setIsReturningToReview(false);
    }
  };

  const handleEditFinalized = (query) => {
    setCombinedPrompt(pickPrompt(query));
    setCombinedSql(pickSql(query));
    const opportunityValue = pickOpportunity(query);
    setCombinedOpportunity(
      opportunityValue === null || opportunityValue === undefined
        ? ""
        : String(opportunityValue)
    );
    setCombinedDocUrl(pickDocUrl(query) || "");
    setCombinedQueryId(query?.query_id ?? query?.id ?? "");
    setIsCombinedOpen(true);
  };

  const handleCancelCombined = () => {
    setIsCombinedOpen(false);
    resetCombinedInputs();
  };

  const handleFinalizeCombined = async () => {
    if (!client || !policyId || !ruleId) return;
    const analystQuery = combinedPrompt.trim();
    const sqlQuery = combinedSql.trim();
    const opportunityText = combinedOpportunity.trim();
    const opportunityValue = Number(opportunityText);
    const documentUrl = combinedDocUrl.trim();
    const showErrorToast = (message) => {
      if (setToast) {
        setToast({
          open: true,
          message,
          severity: "error",
        });
      }
    };
    if (!analystQuery || !sqlQuery) {
      const message = "Please enter both prompt and SQL query.";
      showErrorToast(message);
      return;
    }
    if (!opportunityText) {
      const message = "Please enter the opportunity size.";
      showErrorToast(message);
      return;
    }
    if (!Number.isFinite(opportunityValue)) {
      const message = "Please enter a valid opportunity size.";
      showErrorToast(message);
      return;
    }
    if (!documentUrl) {
      const message = "Please enter the claims document URL.";
      showErrorToast(message);
      return;
    }

    setIsFinalizing(true);
    try {
      const userId = resolveUserId(account);
      const payload = {
        client_id: normalizeClientId(client),
        user_id: userId,
        policy_id: String(policyId),
        rule_id: String(ruleId),
        feedback_provided_by: String(feedbackProvidedBy),
        final_query: [
          {
            query_id: combinedQueryId || String(ruleId),
            final_analyst_query: analystQuery,
            final_sql_query: sqlQuery,
            final_opportunity_size: Number.isFinite(opportunityValue)
              ? opportunityValue
              : 0,
            review_document: documentUrl,
          },
        ],
      };

      const response = await fetch(CONCEPT_DEVELOPMENT_API_ENDPOINTS.UPDATE_RULE_INSIGHT_QUERY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let detail = "";
        try {
          const errorPayload = await response.json();
          detail = errorPayload?.message || JSON.stringify(errorPayload);
        } catch (parseErr) {
          detail = response.message || "Request failed.";
        }
        const message = `Error: ${detail}`;
        showErrorToast(message);
        return;
      }

      setIsCombinedOpen(false);
      resetCombinedInputs();
      setRefreshTick((prev) => prev + 1);
    } catch (err) {
      const message = JSON.parse(err?.message)?.message || "Failed to finalize query.";
      showErrorToast(message);
    } finally {
      setIsFinalizing(false);
    }
  };

  useEffect(() => {
    if (!client || !policyId || !ruleId) {
      setInsights(null);
      return;
    }

    let isMounted = true;
    const fetchInsights = async () => {
      setIsLoading(true);
      setErrorDetail("");
      try {
        const userId = resolveUserId(account);
        const url = getConceptDevelopmentRuleInsightsUrl(client, policyId, ruleId, userId);
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          let detail = "";
          try {
            const errorPayload = await response.json();
            detail = errorPayload?.detail || JSON.stringify(errorPayload);
          } catch (parseErr) {
            detail = response.statusText || "Request failed.";
          }
          if (isMounted) {
            setErrorDetail(detail);
            setInsights(null);
          }
          return;
        }

        const payload = await response.json();
        if (isMounted) {
          setInsights(payload);
          if (pendingCombinedPrefillRef.current) {
            setCombinedPrompt(pendingCombinedPrefillRef.current.prompt || "");
            setCombinedSql(pendingCombinedPrefillRef.current.sql || "");
            setCombinedOpportunity(pendingCombinedPrefillRef.current.opportunity || "");
            setCombinedDocUrl(pendingCombinedPrefillRef.current.docUrl || "");
            setCombinedQueryId(pendingCombinedPrefillRef.current.queryId || "");
            setIsCombinedOpen(true);
            setShouldScrollToCombined(true);
            pendingCombinedPrefillRef.current = null;
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorDetail(err?.message || "Failed to load rule insights.");
          setInsights(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInsights();
    return () => {
      isMounted = false;
    };
  }, [client, account, policyId, ruleId, refreshTick]);

  useEffect(() => {
    setIsCombinedOpen(false);
    pendingCombinedPrefillRef.current = null;
    setCombinedPrompt("");
    setCombinedSql("");
    setCombinedOpportunity("");
    setCombinedDocUrl("");
    setCombinedQueryId("");
  }, [client, policyId, ruleId]);

  useEffect(() => {
    if (!isCombinedOpen || !shouldScrollToCombined) return;
    const section = combinedSectionRef.current;
    if (section && section.scrollIntoView) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setShouldScrollToCombined(false);
  }, [isCombinedOpen, shouldScrollToCombined]);

  if (!selectedRuleContext) {
    return (
      <div className="rule-details-card">
        <div className="empty-state">
          <svg
            className="empty-state-icon"
            viewBox="0 0 24 24"
            width="32"
            height="32"
            fill="none"
          >
            <path
              d="M12 3v18M3 12h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            ></path>
          </svg>
          <h3>Select a rule to view insights</h3>
          <p>Choose a rule from the policy overview table to see its insights.</p>
        </div>
      </div>
    );
  }

  if (isLoading || isReturningToReview) {
    return (
      <div className="loading-indicator" role="status" aria-live="polite">
        {isReturningToReview ? "Returning to review..." : "Loading rule insights..."}
      </div>
    );
  }

  if (errorDetail) {
    return (
      <div className="error-detail" role="alert">
        {"Error : " + errorDetail}
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="rule-details-card">
        <div className="empty-state">
          <h3>No rule insights available</h3>
          <p>We could not find insights for this rule yet.</p>
        </div>
      </div>
    );
  }

  const finalizedQuery = isFinalizedOnly ? ruleInsightQueries[0] : null;
  const finalizedStatus = pickApprovalStatus(finalizedQuery);
  const isRestrictedFinalizedStatus =
    finalizedStatus === "accept" || finalizedStatus === "reject";
  const currentUserEmail = resolveCurrentUserEmail(account);
  const canReturnToReview =
    !isRestrictedFinalizedStatus ||
    RETURN_TO_REVIEW_ALLOWED_USERS.has(currentUserEmail);
  const isReturnToReviewDisabled = isReturningToReview || !canReturnToReview;
  const finalizedDocUrl = finalizedQuery ? ensureAbsoluteUrl(pickDocUrl(finalizedQuery)) : "";
  const finalizedCodesRaw =
    insights?.applicable_codes ||
    insights?.applicable_cpt_codes ||
    insights?.procedure_codes ||
    "";
  const finalizedCodes =
    Array.isArray(finalizedCodesRaw) && finalizedCodesRaw.length > 0
      ? finalizedCodesRaw
      : typeof finalizedCodesRaw === "string" && finalizedCodesRaw.trim()
      ? finalizedCodesRaw.split(/[,;]\s*/).filter(Boolean)
      : [];

  return (
    
    <div className="rule-details-card">
      <div className="query-card" id="query-content" style={{ display: "block" }}>
        <div className="review-mode-header">
          <div className="review-mode-title">
            <h3>Rule Insights Review for Rule {ruleId || "-"}</h3>
            <div className="review-mode-indicator">
              <span
                className="review-status"
                id="review-status"
                style={
                  isFinalizedOnly
                    ? {
                        background: "rgb(212, 237, 218)",
                        color: "rgb(21, 87, 36)",
                        border: "1px solid rgb(195, 230, 203)",
                      }
                    : undefined
                }
              >
                {isFinalizedOnly ? "Finalized" : "Review Mode"}
              </span>
            </div>
          </div>
          <div
            className="review-mode-actions"
            id="review-mode-actions"
            style={{ display: isFinalizedOnly ? "none" : "flex" }}
          >
            <button
              className="btn-create-combined"
              id="btn-create-combined"
              title="Create new combined query"
              type="button"
              onClick={handleCreateFinalQuery}
              disabled={isFinalizing}
              aria-disabled={isFinalizing}
            >
              Create Final Query
            </button>
          </div>
        </div>

        <div
          className="decomposed-queries-container"
          id="decomposed-queries-container"
          style={{ display: isFinalizedOnly ? (isCombinedOpen ? "block" : "none") : "block" }}
        >
          <div
            className="combined-query-section"
            id="combined-query-section"
            style={{ display: isCombinedOpen ? "block" : "none" }}
            ref={combinedSectionRef}
          >
            <div className="combined-query-header">
              <h4>Create Final Combined Query</h4>
              <p>
                Use content from the decomposed queries below to create your final query, and
                provide opportunity sizing details.
              </p>
            </div>

            <div className="combined-query-content">
              <div className="query-input-section">
                <div className="input-group">
                  <label htmlFor="combined-prompt">Natural Language Prompt:</label>
                  <textarea
                    id="combined-prompt"
                    rows="3"
                    placeholder="Enter the final natural language prompt for your query..."
                    value={combinedPrompt}
                    onChange={(event) => setCombinedPrompt(event.target.value)}
                  ></textarea>
                </div>

                <div className="input-group">
                  <label htmlFor="combined-sql">SQL Query:</label>
                  <textarea
                    id="combined-sql"
                    rows="8"
                    placeholder="Enter the final SQL query..."
                    value={combinedSql}
                    onChange={(event) => setCombinedSql(event.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="finalization-details">
                <h5>Finalization Details</h5>
                <div className="details-grid">
                  <div className="input-group">
                    <label htmlFor="opportunity-size-input">Opportunity Size ($):</label>
                    <input
                      type="text"
                      id="opportunity-size-input"
                      placeholder="Enter opportunity size (e.g., 125000)"
                      value={combinedOpportunity}
                      onChange={(event) => setCombinedOpportunity(event.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="claims-document-url">
                      Claims Analysis Document URL:
                    </label>
                    <input
                      type="url"
                      id="claims-document-url"
                      placeholder="Enter URL to the claims sheet/document used for analysis..."
                      value={combinedDocUrl}
                      onChange={(event) => setCombinedDocUrl(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="combined-query-actions">
                <button
                  className="btn-cancel-combined"
                  id="btn-cancel-combined"
                  type="button"
                  onClick={handleCancelCombined}
                >
                  Cancel
                </button>
                <button
                  className="btn-finalize-combined"
                  id="btn-finalize-combined"
                  type="button"
                  onClick={handleFinalizeCombined}
                  disabled={isFinalizing}
                >
                  {isFinalizing ? "Finalizing..." : "Finalize Query"}
                </button>
              </div>
            </div>
          </div>

          <div className="decomposed-queries-list">
            {reviewQueries.map((query, index) => {
              const queryId = query?.query_id ?? query?.id ?? index;
              const opportunity = pickOpportunity(query);
              const prompt = pickPrompt(query);
              const sql = pickSql(query);
              const matchingResolutionSteps = getMatchingResolutionSteps(
                prompt,
                nonSqlConvertibleSteps
              );
              return (
                <div className="decomposed-query-card" data-query-id={queryId} key={queryId}>
                  <div className="query-card-header">
                    <div className="query-info">
                      <span className="query-title">Query {query.rule_id_seq_no}:</span>
                    </div>
                    <div className="query-actions">
                      <button
                        className="btn-use-content"
                        data-query-id={queryId}
                        title="Use content from this query"
                        type="button"
                        onClick={() => handleUseContent(query)}
                      >
                        Use Content
                      </button>
                    </div>
                  </div>
                  <div className="query-content-preview">
                    <div className="query-opportunity-section">
                      <div className="opportunity-display-group">
                        <label>Opportunity Size:</label>
                        <span className="opportunity-value">
                          {formatMoney(opportunity)}
                        </span>
                      </div>
                    </div>
                    <div className="prompt-preview">
                      <h5>Natural Language Prompt:</h5>
                      <p style={{ whiteSpace: "pre-line" }}>
                        {renderPromptWithResolutionHighlights(prompt, matchingResolutionSteps)}
                      </p>
                    </div>
                    <div className="resolution-notes">
                      <h5>Reviewer Guidance</h5>
                      {matchingResolutionSteps.length > 0 ? (
                        <div className="resolution-notes-list">
                          {matchingResolutionSteps.map((step, stepIndex) => (
                            <div
                              className="resolution-note"
                              key={`${queryId}-resolution-${stepIndex}`}
                            >
                              <p className="resolution-note-statement">{step.statement}</p>
                              <p className="resolution-note-reason">{step.reason}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="resolution-notes-empty">-</p>
                      )}
                    </div>
                    <div className="sql-preview">
                      <h5>SQL Query:</h5>
                      <pre className="sql-preview-content">{sql}</pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="finalized-query-container"
          id="finalized-query-container"
          style={{ display: isFinalizedOnly && !isCombinedOpen ? "block" : "none" }}
        >
          <div className="finalized-header">
            <div className="finalized-title">
              <h3>Finalized Rule Insight for Rule {ruleId || "-"}</h3>
              <span className="finalized-status">
                <svg className="icon-sm" viewBox="0 0 24 24" style={{ color: "#28a745" }}>
                  <polyline
                    points="20 6 9 17 4 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  ></polyline>
                </svg>
                Finalized
              </span>
            </div>
            <div className="finalized-actions">
              {/* <button
                className="btn-edit-finalized"
                id="btn-edit-finalized"
                type="button"
                onClick={() => finalizedQuery && handleEditFinalized(finalizedQuery)}
              >
                Edit
              </button> */}
              <button
                className="btn-return-review"
                type="button"
                onClick={() => handleReturnToReview(finalizedQuery) }
                disabled={isReturnToReviewDisabled}
                aria-disabled={isReturnToReviewDisabled}
                title={
                  isReturnToReviewDisabled && isRestrictedFinalizedStatus
                    ? "Only authorized users can return Accept/Reject items to review."
                    : undefined
                }
              >
                  <svg className="icon-sm" viewBox="0 0 24 24">
                      <polyline points="11 17 6 12 11 7"></polyline>
                      <polyline points="18 17 13 12 18 7"></polyline>
                  </svg>
                  {isReturningToReview ? "Returning..." : "Return to Review"}
              </button>
            </div>
          </div>

          <div className="finalized-query-content">
            <div className="query-section">
              <div className="query-section-header">
                <h4>Rule Details</h4>
              </div>
              <div className="rule-details-content" id="finalized-rule-details">
                <div className="rule-meta-info">
                  <div className="rule-meta-item">
                    <span className="meta-label">Rule ID:</span>
                    <span className="meta-value">{ruleId || "-"}</span>
                  </div>
                  <div className="rule-meta-item">
                    <span className="meta-label">Policy:</span>
                    <span className="meta-value">{policy?.policy_name || policyId || "-"}</span>
                  </div>
                  <div className="rule-meta-item">
                    <span className="meta-label">Category:</span>
                    <span className="meta-value">
                      {finalizedQuery?.rule_category || "-"}
                    </span>
                  </div>
                  <div className="rule-meta-item">
                    <span className="meta-label">Status:</span>
                    <span className="meta-value">{finalizedQuery?.approval_status || "Active"}</span>
                  </div>
                  <div className="rule-meta-item">
                    <span className="meta-label">Opportunity Size:</span>
                    <span className="meta-value opportunity-size-display" id="finalized-opportunity-size">
                      {finalizedQuery?.opportunity_size ? formatMoney(finalizedQuery.opportunity_size) : "-"}
                    </span>
                  </div>
                  <div className="rule-meta-item">
                    <span className="meta-label">Document URL:</span>
                    <span className="meta-value document-url-display" id="finalized-document-url">
                      {finalizedDocUrl ? (
                        <a href={finalizedDocUrl} target="_blank" rel="noreferrer">
                          {finalizedDocUrl}
                        </a>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                </div>
                <div className="rule-description-text">
                  <h5>Description:</h5>
                  <p>{rule?.rule_description || insights?.rule_description || "-"}</p>
                </div>
                {finalizedCodes.length > 0 ? (
                  <div className="applicable-codes">
                    <h5>Applicable CPT Codes:</h5>
                    <div className="code-list">
                      {finalizedCodes.map((code) => (
                        <span className="code-item" key={code}>
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="query-section">
              <div className="query-section-header">
                <h4>SQL Query</h4>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    className="btn-copy-query"
                    id="btn-copy-finalized"
                    type="button"
                    onClick={() => handleCopy(finalizedQuery ? finalizedQuery.sql_query : "")}
                  >
                    Copy
                  </button>
                  {copyStatus ? <span className="copy-status">{copyStatus}</span> : null}
                </div>
              </div>
              <div className="sql-query-content" id="finalized-sql-content">
                <pre>{finalizedQuery ? finalizedQuery.sql_query : "-"}</pre>
              </div>
            </div>
          </div>
        </div>

        <div className="edit-query-modal" id="edit-query-modal" style={{ display: "none" }}>
          <div className="edit-modal-content">
            <div className="edit-modal-header">
              <h4>
                Edit Query <span id="editing-query-id"></span>
              </h4>
              <button className="btn-close-modal" id="btn-close-edit-modal">
                ×
              </button>
            </div>
            <div className="edit-modal-body">
              <div className="edit-section">
                <label htmlFor="edit-prompt">Natural Language Prompt:</label>
                <textarea id="edit-prompt" rows="4"></textarea>
              </div>
              <div className="edit-section">
                <label htmlFor="edit-sql">SQL Query:</label>
                <textarea id="edit-sql" rows="12"></textarea>
              </div>
            </div>
            <div className="edit-modal-footer">
              <button className="btn-save-edit" id="btn-save-edit">
                Save Changes
              </button>
              <button className="btn-cancel-edit" id="btn-cancel-edit">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
