import React, { useEffect, useState } from "react";
import { useClient } from "../../context/ClientContext";
import { useAuth } from "../../auth/AuthProvider";
import {
  CONCEPT_DEVELOPMENT_API_ENDPOINTS,
  getConceptDevelopmentRuleDataProfileUrl,
  getConceptDevelopmentRuleDetailsUrl,
  normalizeClientId,
  resolveUserId,
} from "../../config/apiConfig";
import { RuleSpecDocumentModal } from "./RuleSpecDocumentModal";

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatInteger = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
};

const hasDisplayValue = (value) =>
  value !== null && value !== undefined && String(value).trim() !== "";

const ensureAbsoluteUrl = (value) => {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const formatDateWithTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatDateOnly = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const formatPolicyDate = (value) => {
  const formattedDate = formatDateOnly(value);
  return formattedDate || String(value || "").trim();
};

const formatProfileDateRange = (startDate, endDate) => {
  const formattedStartDate = formatDateOnly(startDate);
  const formattedEndDate = formatDateOnly(endDate);

  if (formattedStartDate && formattedEndDate) {
    return `Date range : ${formattedStartDate} to ${formattedEndDate}`;
  }
  if (formattedStartDate) {
    return `Date range : ${formattedStartDate}`;
  }
  if (formattedEndDate) {
    return `Date range : through ${formattedEndDate}`;
  }
  return "";
};

const RULE_PROFILE_PREVIEW_LIMIT = 5;
const CLAIM_TYPE_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "I", label: "I - Institutional" },
  { value: "O", label: "O - Outpatient" },
  { value: "P", label: "P - Professional" },
];

const formatPercent = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const normalizeProfileValue = (item, index) => ({
  rank: Number.isFinite(Number(item?.rank_in_dim)) ? Number(item.rank_in_dim) : index + 1,
  value: String(item?.dimension_value ?? "").trim() || "-",
  description: String(item?.code_description ?? "").trim(),
  totalPaid: item?.net_paid_amount,
  claims: item?.total_claims,
  percentClient: formatPercent(item?.pct_client),
  inRule: Boolean(item?.in_rule),
  inClaims: Boolean(item?.in_claims),
});

const normalizeDimensionIdentity = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const isClaimTypeDimension = (dimension) =>
  normalizeDimensionIdentity(dimension?.key) === "claimtype" ||
  normalizeDimensionIdentity(dimension?.label) === "claimtype";

const prioritizeClaimTypeDimension = (dimensions = []) => {
  const claimTypeDimensions = [];
  const otherDimensions = [];

  dimensions.forEach((dimension) => {
    if (isClaimTypeDimension(dimension)) {
      claimTypeDimensions.push(dimension);
    } else {
      otherDimensions.push(dimension);
    }
  });

  return [...claimTypeDimensions, ...otherDimensions];
};

const normalizeRuleProfileResponse = (payload) => {
  const dimensions = Array.isArray(payload?.dimensions) ? payload.dimensions : [];
  return {
    source: "HMS claims aggregation profile",
    dateRangeLabel: formatProfileDateRange(
      payload?.dimension_start_date,
      payload?.dimension_end_date
    ),
    dimensions: prioritizeClaimTypeDimension(dimensions.map((dimension) => {
      const targetedValues = Array.isArray(dimension?.targeted_values)
        ? dimension.targeted_values
        : [];
      const observedValues = Array.isArray(dimension?.observed_values)
        ? dimension.observed_values
        : [];
      const targetedCount = Number(dimension?.targeted_count);
      const observedCount = Number(dimension?.observed_count);

      return {
        key: String(dimension?.dimension_name || dimension?.display_name || "").trim(),
        label: String(dimension?.display_name || dimension?.dimension_name || "Dimension").trim(),
        targetedCount: Number.isFinite(targetedCount) ? targetedCount : targetedValues.length,
        observedCount: Number.isFinite(observedCount) ? observedCount : observedValues.length,
        inRule: targetedValues.map(normalizeProfileValue),
        inClaims: observedValues.map(normalizeProfileValue),
      };
    })),
  };
};


const profileRows = (rows = []) =>
  rows.map((row, index) => ({
    ...row,
    rank: row.rank ?? index + 1,
  }));

const RuleProfileRows = ({ rows, rowGroupClass = "in-rule" }) => (
  <tbody className={rowGroupClass}>
    {profileRows(rows).map((row) => (
      <tr key={`${rowGroupClass}-${row.rank}-${row.value}`}>
        <td className="col-rank">{row.rank}</td>
        <td className="col-value">{row.value}</td>
        <td className="col-desc">{row.description || "-"}</td>
        <td className="num">{formatMoney(row.totalPaid)}</td>
        <td className="num">{formatInteger(row.claims)}</td>
        <td className="num">{row.percentClient || "-"}</td>
      </tr>
    ))}
  </tbody>
);

const RuleProfileEmptyRows = ({ message = "No records available." }) => (
  <tbody>
    <tr>
      <td className="rule-profile-empty-row" colSpan="6">
        {message}
      </td>
    </tr>
  </tbody>
);

const RuleProfileGroupHeading = ({ label, note, variant = "targeted" }) => (
  <tbody>
    <tr className={`profile-group-heading ${variant}`}>
      <td colSpan="6">
        <span className="profile-group-title">{label}</span>
        {note ? <span className="profile-group-note">{note}</span> : null}
      </td>
    </tr>
  </tbody>
);

const RuleProfileTableColumns = () => (
  <>
    <colgroup>
      <col className="c-rank" />
      <col className="c-value" />
      <col className="c-desc" />
      <col className="c-paid" />
      <col className="c-claims" />
      <col className="c-pct" />
    </colgroup>
    <thead>
      <tr>
        <th className="col-rank">#</th>
        <th className="col-value">Value</th>
        <th className="col-desc">Description</th>
        <th className="num">Total Paid</th>
        <th className="num">Claims</th>
        <th className="num">% client</th>
      </tr>
    </thead>
  </>
);

const RuleProfileSingleTable = ({ rows, rowGroupClass }) => (
  <table className="dimension-table">
    <RuleProfileTableColumns />
    {rows?.length ? (
      <RuleProfileRows rows={rows} rowGroupClass={rowGroupClass} />
    ) : (
      <RuleProfileEmptyRows />
    )}
  </table>
);


const stripQuotes = (value) => {
  if (!value) return value;
  const text = String(value).trim();
  if (!text) return text;

  // Remove any quote characters (straight + curly)
  return text.replace(/[“”"‘’]/g, "");
};

const sanitizeObjectKey = (value) => String(value || "").replace(/\//g, "");

const statusClass = (status) => {
  if (!status) return "";
  const s = String(status).toLowerCase();
  if (s.includes("ready to review") || s.includes("ready review")) return "status-ready-review";
  if (s.includes("progress")) return "status-in-progress";
  if (s.includes("on hold")) return "status-on-hold";
  if (s.includes("not feasible")) return "status-not-feasible";
  if (s.includes("reject")) return "status-rejected";
  if (s.includes("approved") || s.includes("accept")) return "status-accept";
  if (s.includes("completed")) return "status-completed";
  if (s.includes("not")) return "status-not-started";
  return "";
};

export const RuleDetails = ({ selectedRuleContext, setToast }) => {
  const { client } = useClient();
  const { account } = useAuth();
  const policy = selectedRuleContext?.policy;
  const rule = selectedRuleContext?.rule;
  const policyId = policy?.policy_id;
  const ruleId = rule?.rule_id;
  const feedbackProvidedBy =
    selectedRuleContext?.feedbackProvidedBy ??
    "";

  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [comment, setComment] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [qid, setQid] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isSpecOpen, setIsSpecOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [ruleProfile, setRuleProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileModalSection, setProfileModalSection] = useState(null);
  const [claimTypeFilter, setClaimTypeFilter] = useState("ALL");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!client || !policyId || !ruleId) {
      setDetails(null);
      setPdfUrl("");
      setPdfError("");
      setIsPdfLoading(false);
      return;
    }

    let isMounted = true;
    const fetchDetails = async () => {
      setIsLoading(true);
      setErrorDetail("");
      try {
        const userId = resolveUserId(account);
        const url = getConceptDevelopmentRuleDetailsUrl(client, policyId, ruleId, userId);
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
            setDetails(null);
          }
          return;
        }

        const payload = await response.json();
        if (isMounted) {
          setDetails(payload);
        }
      } catch (err) {
        if (isMounted) {
          setErrorDetail(err?.message || "Failed to load rule details.");
          setDetails(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [client, account, policyId, ruleId, refreshTick]);

  useEffect(() => {
    if (!client || !ruleId) {
      setRuleProfile(null);
      setProfileError("");
      setIsProfileLoading(false);
      setProfileModalSection(null);
      return;
    }

    let isMounted = true;
    const fetchRuleProfile = async () => {
      setIsProfileLoading(true);
      setProfileError("");
      setProfileModalSection(null);
      try {
        const url = getConceptDevelopmentRuleDataProfileUrl(
          client,
          ruleId,
          claimTypeFilter,
          "__DEFAULT__"
        );
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
            setProfileError(detail);
            setRuleProfile(null);
          }
          return;
        }

        const payload = await response.json();
        if (isMounted) {
          setRuleProfile(normalizeRuleProfileResponse(payload));
        }
      } catch (err) {
        if (isMounted) {
          setProfileError(err?.message || "Failed to load rule profiling.");
          setRuleProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    fetchRuleProfile();
    return () => {
      isMounted = false;
    };
  }, [client, ruleId, claimTypeFilter]);

  useEffect(() => {
    setFeedback("");
    setComment("");
    setDocUrl("");
    setQid("");
    setFeedbackStatus("");
    setIsFeedbackOpen(false);
    setIsSpecOpen(false);
    setClaimTypeFilter("ALL");
  }, [ruleId]);

  const description = details?.rule_definition || rule?.rule_description || "-";
  const rule_evidence = stripQuotes(details?.rule_evidence) || "-";
  const clinicalRationale = details?.clinical_rationale;
  const statusLabel = details?.rule_status || details?.status || "In progress";
  const normalizedStatus = String(statusLabel).trim().toLowerCase();
  const isInProgress = normalizedStatus.includes("progress");
  const isNotStarted =
    normalizedStatus.includes("not started") ||
    normalizedStatus.includes("not-started") ||
    normalizedStatus.includes("not_started");
  const isAcceptOrRejectStatus =
    normalizedStatus.includes("accept") ||
    normalizedStatus.includes("approved") ||
    normalizedStatus.includes("reject");
  const canViewSpecDocument = normalizedStatus === "accept";
  const showAcceptRejectActions = !(isInProgress || isNotStarted);
  const hasPdf = Boolean(details?.file_name);
  const claimsInScope = details?.claims_in_scope;
  const paidAmountInScope = details?.paid_amount_in_scope;
  const ruleExecutionTime =
    details?.rule_execution_time === null ||
    details?.rule_execution_time === undefined ||
    String(details?.rule_execution_time).trim() === ""
      ? "-"
      : formatDateWithTime(details?.rule_execution_time);
  const policyExpiryDate = details?.policy_expiry_date ?? policy?.policy_expiry_date;
  const policyEffectiveDate = details?.policy_effective_date ?? policy?.policy_effective_date;
  const policyDateLabel = hasDisplayValue(policyExpiryDate)
    ? "Policy Expiry Date"
    : hasDisplayValue(policyEffectiveDate)
      ? "Policy Effective Date"
      : "";
  const policyDateValue = hasDisplayValue(policyExpiryDate)
    ? formatPolicyDate(policyExpiryDate)
    : hasDisplayValue(policyEffectiveDate)
      ? formatPolicyDate(policyEffectiveDate)
      : "";
  const policySourceUrl = String(
    details?.policy_source_url ?? policy?.policy_source_url ?? ""
  ).trim();
  const policySourceHref = ensureAbsoluteUrl(policySourceUrl);
  const displayRuleProfile = ruleProfile || {
    source: "HMS claims aggregation profile",
    dateRangeLabel: "",
    dimensions: [],
  };
  const profileModalDimension = profileModalSection?.dimension;
  const profileModalType = profileModalSection?.type || "targeted";
  const profileModalIsObserved = profileModalType === "observed";
  const profileModalRows = profileModalIsObserved
    ? profileModalDimension?.inClaims || []
    : profileModalDimension?.inRule || [];
  const profileModalRowClass = profileModalIsObserved ? "out-of-rule" : "in-rule";
  const profileModalLabel = profileModalIsObserved ? "observed" : "targeted";

  const handleOpenPdf = async () => {
    setPdfUrl("");
    const objectKey = sanitizeObjectKey(`${details?.policy_file_id || ""}.pdf`);
    if (!objectKey) {
      setPdfError("No policy document available.");
      setIsPdfOpen(true);
      return;
    }

    setIsPdfOpen(true);
    

    setIsPdfLoading(true);
    setPdfError("");
    try {
      const userId = resolveUserId(account);
      const response = await fetch(
        CONCEPT_DEVELOPMENT_API_ENDPOINTS.POLICY_FILE_PRESIGNED_URL,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            object_key: objectKey,
            user_id: userId,
          }),
        }
      );

      if (!response.ok) {
        let detail = "";
        try {
          const errorPayload = await response.json();
          detail = errorPayload?.detail || JSON.stringify(errorPayload);
        } catch (parseErr) {
          detail = response.statusText || "Request failed.";
        }
        setPdfError(detail);
        setPdfUrl("");
        return;
      }

      const payload = await response.json();
      const errorMessage = payload?.error || "";
      if (errorMessage) {
        setPdfError(errorMessage);
        setPdfUrl("");
        return;
      }

      const presignedUrl = String(payload?.presigned_url || "").trim();
      if (!presignedUrl) {
        setPdfError("No PDF URL available.");
        setPdfUrl("");
        return;
      }

      setPdfUrl(presignedUrl);
    } catch (err) {
      setPdfError(err?.message || "Failed to load PDF.");
      setPdfUrl("");
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleOpenFeedback = (value) => {
    setFeedback(value);
    setComment("");
    setDocUrl("");
    setQid("");
    setFeedbackStatus("");
    setIsFeedbackOpen(true);
  };

  const handleSaveFeedback = async () => {
    if (!client || !policyId || !ruleId) return;
    if (!feedback) {
      setFeedbackStatus("Please select Accept or Reject.");
      return;
    }

    const queryId =
      details?.query_id ??
      details?.id ??
      rule?.query_id ??
      rule?.id ??
      ruleId ??
      "";

    const userId = resolveUserId(account);

    const payload = {
      client_id: normalizeClientId(client),
      user_id: userId,
      policy_id: String(policyId),
      rule_id: String(ruleId),
      feedback_provided_by: String(feedbackProvidedBy),
      feedback: [
        {
          query_id: String(queryId),
          nlp_feedback_button:
            feedback === "positive" ? true : feedback === "negative" ? false : null,
          nlp_feedback_text: comment.trim(),
          doc_url: docUrl.trim(),
          sql_feedback_button:
          feedback === "positive" ? true : feedback === "negative" ? false : null,
          sql_feedback_text: "",
          qid: qid,
        },
      ],
    };

    setIsSubmittingFeedback(true);
    setFeedbackStatus("");
    try {
      const response = await fetch(
        CONCEPT_DEVELOPMENT_API_ENDPOINTS.SUBMIT_RULE_FEEDBACK,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        let detail = "";
        try {
          const errorPayload = await response.json();
          if (Array.isArray(errorPayload?.detail)) {
            detail = errorPayload.detail
              .map((item) => item?.msg)
              .filter(Boolean)
              .join(", ");
          } else {
            detail = errorPayload?.detail || JSON.stringify(errorPayload);
          }
        } catch (parseErr) {
          detail = response.statusText || "Request failed.";
        }
        setFeedbackStatus(`Error: ${detail}`);
        return;
      }

      const successPayload = await response.json();
      const successMessage = successPayload?.message || "Feedback submitted.";
      if (setToast) {
        setToast({
          open: true,
          message: successMessage,
          severity: "success",
        });
      }
      setFeedbackStatus("");
      setIsFeedbackOpen(false);
      setFeedback("");
      setComment("");
      setDocUrl("");
      setQid("");
      setRefreshTick((prev) => prev + 1);
    } catch (err) {
      setFeedbackStatus(err?.message || "Failed to submit feedback.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

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
          <h3>Select a rule to view details</h3>
          <p>Choose a rule from the policy overview table to see its details.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-indicator" role="status" aria-live="polite">
        Loading rule details...
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

  return (
    <div className="rule-details-card" id="rule-details-content" style={{ display: "block" }}>
      <div className="rule-header">
        <div className="rule-header-left">
          <h3 className="rule-title">{ruleId}</h3>
          {hasPdf ? (
            <button
              type="button"
              className="btn-rule-pdf"
              title="View Policy Document (PDF)"
              onClick={handleOpenPdf}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <path d="M14 2v6h6"></path>
                <rect x="8" y="12" width="8" height="1" rx="0.5" fill="#dc3545"></rect>
                <rect x="8" y="14" width="6" height="1" rx="0.5" fill="#dc3545"></rect>
                <rect x="8" y="16" width="8" height="1" rx="0.5" fill="#dc3545"></rect>
                <text
                  x="12"
                  y="10"
                  textAnchor="middle"
                  fontSize="2.5"
                  fontFamily="Arial, sans-serif"
                  fontWeight="bold"
                  fill="#dc3545"
                >
                  PDF
                </text>
              </svg>
              <span>View Policy PDF</span>
            </button>
          ) : null}
          {/*
          {canViewSpecDocument ? (
            <button
              type="button"
              className="btn-rule-pdf"
              title="View Spec Document"
              onClick={() => setIsSpecOpen(true)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <path d="M14 2v6h6"></path>
                <rect x="8" y="12" width="8" height="1" rx="0.5" fill="#007cad"></rect>
                <rect x="8" y="14" width="6" height="1" rx="0.5" fill="#007cad"></rect>
                <rect x="8" y="16" width="8" height="1" rx="0.5" fill="#007cad"></rect>
                <text
                  x="12"
                  y="10"
                  textAnchor="middle"
                  fontSize="2.5"
                  fontFamily="Arial, sans-serif"
                  fontWeight="bold"
                  fill="#007cad"
                >
                  DOC
                </text>
              </svg>
              <span>View Spec Document</span>
            </button>
          ) : null}
          */}
        </div>
        <span className={`rule-status ${statusClass(statusLabel)}`}>{statusLabel}</span>
      </div>
      <div className="rule-meta">
        <span>
          <strong>Policy:</strong> {policy?.policy_name || policyId || "-"}
        </span>
        <span>
          <strong>Page Number:</strong> {details?.page_number || "-"}
        </span>
        <span>
          <strong>Rule Execution Time:</strong> {ruleExecutionTime}
        </span>
        {policyDateLabel && policyDateValue ? (
          <span>
            <strong>{policyDateLabel}:</strong> {policyDateValue}
          </span>
        ) : null}
        {policySourceHref ? (
          <span>
            <strong>Source URL:</strong>{" "}
            <a
              className="rule-meta-link"
              href={policySourceHref}
              target="_blank"
              rel="noreferrer"
            >
              View source
            </a>
          </span>
        ) : null}
        <div className="feedback-buttons" style={{ display: showAcceptRejectActions ? "" : "none" }}>
          <button
            type="button"
            className={`btn-feedback verified${feedback === "positive" ? " active" : ""}`}
            onClick={() => handleOpenFeedback("positive")}
            title="Accept"
            aria-haspopup="dialog"
            disabled={isAcceptOrRejectStatus}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <polyline
                points="20 6 9 17 4 12"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></polyline>
            </svg>
            <span>Accept</span>
          </button>
          <button
            type="button"
            className={`btn-feedback closed${feedback === "negative" ? " active" : ""}`}
            onClick={() => handleOpenFeedback("negative")}
            title="Reject"
            aria-haspopup="dialog"
            disabled={isAcceptOrRejectStatus}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              ></line>
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              ></line>
            </svg>
            <span>Reject</span>
          </button>
        </div>
      </div>
      <div className="rule-description">
        <div className="description-header">
          <h4>Description</h4>
        </div>
        <p>{description}</p>
        <h4>Rule Evidence</h4>
        <p>{rule_evidence}</p>
        {clinicalRationale ? <p>{clinicalRationale}</p> : null}
      </div>
      <div className="rule-criteria">
        <section className="rule-dimensions-card" aria-labelledby="rule-profiling-title">
          <div className="rule-header">
            <div className="rule-header-top">
              <div>
                <div className="profile-title-row">
                  <h3 id="rule-profiling-title">Rule Based Claims Profiling</h3>
                  {displayRuleProfile.dateRangeLabel ? (
                    <div className="profile-date-range">{displayRuleProfile.dateRangeLabel}</div>
                  ) : null}
                </div>
                <div className="header-subtitle">{displayRuleProfile.source}</div>
              </div>
            </div>
            <div className="dimension-legend">
              <div className="legend-card" data-key="in-rule">
                <span className="count-pill">Targeted by Rule</span>
                <span className="legend-text">
                  Billing codes and claim attributes that this rule specifically targets based on
                  policy language.
                </span>
              </div>
              <div className="legend-card" data-key="in-claims">
                <span className="count-pill muted">Observed in Claims</span>
                <span className="legend-text">
                  Additional billing codes observed in the client&apos;s paid claims that fall
                  within this rule&apos;s coverage area.
                </span>
              </div>
            </div>
            <details className="data-provenance">
              <summary>
                <span className="chevron">&#9656;</span>
                <span className="label">Where does this data originate?</span>
              </summary>
              <div className="provenance-body">
                <p className="provenance-paragraph">
                  <strong>Spend totals</strong>, <strong>claim counts</strong>, and{" "}
                  <strong>percentages</strong> shown here come directly from this client&apos;s
                  claims warehouse (<strong>HMS</strong>). Each row represents a real{" "}
                  <strong>billing code</strong> or <strong>claim field value</strong> observed in
                  paid claims during the rule&apos;s active date range. Each claim field section
                  shows you the billing codes ranked by <strong>total spend</strong>. The{" "}
                  <strong>&quot;% Client&quot;</strong> column tells you what share of all client
                  payments that code represents. Codes <strong>targeted by the rule</strong> are
                  highlighted; codes merely <strong>observed in claims</strong> are shown in a
                  lighter style.
                </p>
              </div>
            </details>
          </div>
          <div className="claim-type-filter" aria-label="Filter rule profiling by claim type">
            <span className="filter-label">Filter by Claim Type</span>
            <div className="filter-pills">
              {CLAIM_TYPE_FILTERS.map((option) => (
                <button
                  className={`filter-pill ${claimTypeFilter === option.value ? "active" : ""}`}
                  disabled={isProfileLoading}
                  key={option.value}
                  onClick={() => {
                    if (claimTypeFilter !== option.value) {
                      setClaimTypeFilter(option.value);
                    }
                  }}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="dimensions-body">
            {isProfileLoading ? (
              <div className="rule-profile-state" role="status" aria-live="polite">
                Loading rule profiling...
              </div>
            ) : profileError ? (
              <div className="rule-profile-state error" role="alert">
                {"Error : " + profileError}
              </div>
            ) : displayRuleProfile.dimensions.length === 0 ? (
              <div className="rule-profile-state">No rule profiling data available.</div>
            ) : (
              displayRuleProfile.dimensions.map((dimension) => {
                const targetedRows = dimension.inRule || [];
                const observedRows = dimension.inClaims || [];
                const targetedPreviewRows = targetedRows.slice(0, RULE_PROFILE_PREVIEW_LIMIT);
                const observedPreviewRows = observedRows.slice(0, RULE_PROFILE_PREVIEW_LIMIT);
                const hiddenTargetedCount = Math.max(
                  targetedRows.length - RULE_PROFILE_PREVIEW_LIMIT,
                  0
                );
                const hiddenObservedCount = Math.max(
                  observedRows.length - RULE_PROFILE_PREVIEW_LIMIT,
                  0
                );
                const hasRows = targetedRows.length > 0 || observedRows.length > 0;

                return (
                  <section
                    className="dimension-section"
                    data-dim={dimension.key}
                    key={dimension.key}
                  >
                    <div className="dimension-section-header">
                      <h4>{dimension.label}</h4>
                      <div className="dimension-counts" aria-label={`${dimension.label} claims`}>
                        <span className="count-pill-label">Claims:</span>
                        <span className="count-pill">{dimension.targetedCount} targeted</span>
                        <span className="count-pill muted">{dimension.observedCount} observed</span>
                      </div>
                    </div>
                    <table className="dimension-table">
                      <RuleProfileTableColumns />
                      {targetedPreviewRows.length ? (
                        <>
                          <RuleProfileGroupHeading
                            label="Targeted"
                            note={
                              hiddenTargetedCount > 0
                                ? "Showing top 5 records. Use show more to see all values."
                                : ""
                            }
                            variant="targeted"
                          />
                          <RuleProfileRows rows={targetedPreviewRows} rowGroupClass="in-rule" />
                        </>
                      ) : null}
                      {hiddenTargetedCount > 0 ? (
                        <tbody>
                          <tr className="section-divider">
                            <td colSpan="6">
                              <button
                                type="button"
                                className="more-toggle in-rule-expand"
                                onClick={() =>
                                  setProfileModalSection({ dimension, type: "targeted" })
                                }
                              >
                                <span className="chevron">&rsaquo;</span>
                                <span>Show {hiddenTargetedCount} more targeted values</span>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      ) : null}
                      {observedPreviewRows.length ? (
                        <>
                          <RuleProfileGroupHeading
                            label="Observed"
                            note={
                              hiddenObservedCount > 0
                                ? "Showing top 5 records. Use show more to see all values."
                                : ""
                            }
                            variant="observed"
                          />
                          <RuleProfileRows
                            rows={observedPreviewRows}
                            rowGroupClass="out-of-rule"
                          />
                        </>
                      ) : null}
                      {hiddenObservedCount > 0 ? (
                        <tbody>
                          <tr className="section-divider">
                            <td colSpan="6">
                              <button
                                type="button"
                                className="more-toggle outside-toggle"
                                onClick={() =>
                                  setProfileModalSection({ dimension, type: "observed" })
                                }
                              >
                                <span className="chevron">&rsaquo;</span>
                                <span>Show {hiddenObservedCount} more observed values</span>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      ) : null}
                      {!hasRows ? <RuleProfileEmptyRows /> : null}
                    </table>
                  </section>
                );
              })
            )}
          </div>
        </section>
      </div>
      <div className="rule-impact">
        <h4>Financial Impact</h4>
        <div className="impact-metrics">
          <div className="impact-item impact-opportunity">
            <span className="impact-value">
              {formatMoney(details?.opportunity_size ?? rule?.rule_opportunity_size)}
            </span>
            <span className="impact-label">Opportunity Sizing</span>
          </div>
          {hasDisplayValue(claimsInScope) ? (
            <div className="impact-item impact-opportunity">
              <span className="impact-value">{claimsInScope}</span>
              <span className="impact-label">Claims in Scope</span>
            </div>
          ) : null}
          {hasDisplayValue(paidAmountInScope) ? (
            <div className="impact-item impact-opportunity">
              <span className="impact-value">{formatMoney(paidAmountInScope)}</span>
              <span className="impact-label">Paid Amount in Scope</span>
            </div>
          ) : null}
        </div>
      </div>
      {isPdfOpen ? (
        <div
          className="pdf-modal-overlay"
          id="pdf-modal-overlay"
          onClick={() => setIsPdfOpen(false)}
        >
          <div className="pdf-modal" onClick={(event) => event.stopPropagation()}>
            <div className="pdf-modal-header">
              <h3>📄 {policy?.policy_name || "Policy Document"}</h3>
              <button
                className="btn-close-modal"
                id="btn-close-modal"
                type="button"
                onClick={() => setIsPdfOpen(false)}
                aria-label="Close policy document"
              >
                ×
              </button>
            </div>
            <div className="pdf-modal-content">
              {isPdfLoading ? (
                <div className="loading-indicator" role="status" aria-live="polite">
                  Loading policy document...
                </div>
              ) : pdfError ? (
                <div className="error-detail" role="alert">
                  {"Error : " + pdfError}
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: "none", borderRadius: "6px" }}
                  title="Policy PDF"
                >
                  <p>
                    Your browser does not support PDFs.{" "}
                    <a href={pdfUrl} target="_blank" rel="noreferrer">
                      Download the PDF
                    </a>
                    .
                  </p>
                </iframe>
              ) : (
                <div className="error-detail" role="alert">
                  No policy document available.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
      <RuleSpecDocumentModal
        isOpen={isSpecOpen}
        ruleId={ruleId}
        onClose={() => setIsSpecOpen(false)}
        setToast={setToast}
      />
      {profileModalSection ? (
        <div
          className="rule-profile-modal-overlay visible"
          onClick={() => setProfileModalSection(null)}
        >
          <div
            className="rule-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rule-profile-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="rule-profile-modal-header">
              <h3 id="rule-profile-modal-title">
                All {profileModalLabel} values - {profileModalDimension?.label}
              </h3>
              <button
                className="rule-profile-modal-close"
                type="button"
                onClick={() => setProfileModalSection(null)}
                aria-label="Close rule profiling values"
              >
                &times;
              </button>
            </div>
            <div className="rule-profile-modal-body">
              <RuleProfileSingleTable
                rows={profileModalRows}
                rowGroupClass={profileModalRowClass}
              />
            </div>
          </div>
        </div>
      ) : null}
      {isFeedbackOpen ? (
        <div
          className="feedback-modal-overlay"
          id="feedback-modal-overlay"
          onClick={() => setIsFeedbackOpen(false)}
        >
          <div
            className="feedback-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="feedback-modal-header">
              <h3 id="feedback-modal-title">
                {feedback === "positive" ? "Accept Rule" : "Reject Rule"}
              </h3>
              <button
                className="btn-close-modal"
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                aria-label="Close feedback dialog"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="feedback-modal-body">
              <div className="comment-box">
                <label htmlFor="feedback-comment">Enter the feedback Notes</label>
                <textarea
                  id="feedback-comment"
                  placeholder="Feedback notes"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                ></textarea>
              </div>
              <div className="comment-box">
                <label htmlFor="feedback-doc-url">Document URL(optional)</label>
                <input
                  id="feedback-doc-url"
                  type="url"
                  placeholder="Enter the document URL"
                  value={docUrl}
                  onChange={(event) => setDocUrl(event.target.value)}
                />
              </div>
              {feedback === "positive" ? (
                <div className="comment-box">
                  <label htmlFor="feedback-qid">QID(optional)</label>
                  <input
                    id="feedback-qid"
                    type="text"
                    placeholder="Enter QID"
                    value={qid}
                    onChange={(event) => setQid(event.target.value)}
                  />
                </div>
              ) : null}
              {feedbackStatus ? (
                <div className="feedback-status" role="status" aria-live="polite">
                  {feedbackStatus}
                </div>
              ) : null}
            </div>
            <div className="feedback-modal-footer">
              <button
                type="button"
                className="btn-cancel-feedback"
                onClick={() => {
                  setIsFeedbackOpen(false);
                  setFeedback("");
                  setComment("");
                  setDocUrl("");
                  setQid("");
                  setFeedbackStatus("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-save-feedback"
                onClick={handleSaveFeedback}
                disabled={isSubmittingFeedback}
              >
                {isSubmittingFeedback ? "Saving..." : "Save Feedback"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
