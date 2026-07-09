import React, { useEffect, useState } from "react";
import { CONCEPT_DEVELOPMENT_API_ENDPOINTS } from "../../config/apiConfig";

const SPEC_DOCUMENT_TITLE = "Payment Integrity Query Specification Form - V1.1";

const SPEC_DOCUMENT_SECTIONS = [
  {
    title: "Section A: General Information",
    fields: [
      { id: "queryId", label: "A1. Query ID" },
      { id: "queryTitle", label: "A2. Query Title" },
      { id: "queryDescription", label: "A3. Query Description" },
      { id: "conceptType", label: "A4. Concept Type" },
      { id: "queryComplexity", label: "A6. Query Complexity" },
      { id: "estimatedResultVolume", label: "A6. Estimated Result Volume" },
      { id: "relatedQueries", label: "A7. Related Queries" },
    ],
  },
  {
    title: "Section B: Concept Logic",
    fields: [
      { id: "referenceTables", label: "B1. Reference Tables" },
      { id: "anchorGoodClaimsHeading", label: "B2. Anchor/Good Claims", type: "heading" },
      { id: "goodClaimCriteria", label: "B2a. Good Claim Criteria" },
      { id: "goodClaimExclusions", label: "B2b. Good Claim Exclusions" },
      {
        id: "potentialFindingsHeading",
        label: "B3. Potential Findings/Bad Claims",
        type: "heading",
      },
      { id: "matchCompareWithGoodClaim", label: "B3a. Match/Compare With Good Claim On" },
      { id: "badClaimCriteria", label: "B3b. Bad Claim Criteria" },
      { id: "badClaimExclusions", label: "B3c. Bad Claim Exclusions" },
    ],
  },
  {
    title: "Section C: Results",
    description: "Considerations for how the Review File is generated.",
    fields: [
      { id: "referenceClaims", label: "C1. Reference Claims" },
      { id: "outputLevelGoodClaims", label: "C2. Output Level - Good claims" },
      { id: "outputLevelBadClaims", label: "C2. Output Level - Bad claims" },
      { id: "outputAllAsBad", label: "C3. Output All as Bad" },
      { id: "caseStructure", label: "C4. Case Structure" },
      { id: "subsets", label: "C5. Subsets" },
      { id: "ecode", label: "C6. ECode" },
      { id: "estimatedSavings", label: "C7. Estimated Savings (Complex only)" },
      { id: "savings", label: "C8. Savings" },
      { id: "evalText", label: "C9. Eval_text" },
      { id: "denialText", label: "C10. Denial_text" },
      { id: "reviewerComments", label: "C11. Reviewer_Comments" },
      { id: "comments", label: "C12. Comments" },
    ],
  },
  {
    title: "Section D: Additional References",
    description:
      "Additional information supporting the premise of the query. This can include client policy, CMS policy, payment rules, or bulletins.",
    fields: [
      { id: "pilotCode", label: "F1. Pilot Code" },
      { id: "clientReferences", label: "F2. Client References" },
      { id: "queryReferences", label: "F3. Query References" },
    ],
  },
];

const createEmptySpecValues = () =>
  SPEC_DOCUMENT_SECTIONS.reduce((values, section) => {
    section.fields.forEach((field) => {
      if (field.type === "heading") return;
      values[field.id] = "";
    });
    return values;
  }, {});

const parseApiError = async (response, fallbackMessage = "Request failed.") => {
  try {
    const errorPayload = await response.json();
    if (Array.isArray(errorPayload?.detail)) {
      const validationMessage = errorPayload.detail
        .map((item) => {
          const location = Array.isArray(item?.loc) ? item.loc.join(".") : "";
          const message = item?.msg || item?.type || "";
          return [location, message].filter(Boolean).join(": ");
        })
        .filter(Boolean)
        .join(", ");
      return validationMessage || fallbackMessage;
    }
    return errorPayload?.detail || errorPayload?.message || JSON.stringify(errorPayload);
  } catch (parseErr) {
    return response.statusText || fallbackMessage;
  }
};

const mapSpecPayloadToValues = (payload) => {
  const emptyValues = createEmptySpecValues();
  if (!payload || typeof payload !== "object") return emptyValues;

  return {
    ...emptyValues,
    queryId: payload.general_information?.query_id ?? "",
    queryTitle: payload.general_information?.query_title ?? "",
    queryDescription: payload.general_information?.query_description ?? "",
    conceptType: payload.general_information?.concept_type ?? "",
    queryComplexity: payload.general_information?.query_complexity ?? "",
    estimatedResultVolume: payload.general_information?.estimated_result_volume ?? "",
    relatedQueries: payload.general_information?.related_queries ?? "",
    referenceTables: payload.concept_logic?.reference_tables ?? "",
    goodClaimCriteria:
      payload.concept_logic?.anchor_good_claims?.good_claim_criteria ?? "",
    goodClaimExclusions:
      payload.concept_logic?.anchor_good_claims?.good_claim_exclusions ?? "",
    matchCompareWithGoodClaim:
      payload.concept_logic?.potential_findings_bad_claims
        ?.match_compare_with_good_claim_on ?? "",
    badClaimCriteria:
      payload.concept_logic?.potential_findings_bad_claims?.bad_claim_criteria ?? "",
    badClaimExclusions:
      payload.concept_logic?.potential_findings_bad_claims?.bad_claim_exclusions ?? "",
    referenceClaims: payload.results?.reference_claims ?? "",
    outputLevelGoodClaims: payload.results?.output_level_good_claims ?? "",
    outputLevelBadClaims: payload.results?.output_level_bad_claims ?? "",
    outputAllAsBad: payload.results?.output_all_as_bad ?? "",
    caseStructure: payload.results?.case_structure ?? "",
    subsets: payload.results?.subsets ?? "",
    ecode: payload.results?.ecode ?? "",
    estimatedSavings: payload.results?.estimated_savings ?? "",
    savings: payload.results?.savings ?? "",
    evalText: payload.results?.eval_text ?? "",
    denialText: payload.results?.denial_text ?? "",
    reviewerComments: payload.results?.reviewer_comments ?? "",
    comments: payload.results?.comments ?? "",
    pilotCode: payload.additional_references?.pilot_code ?? "",
    clientReferences: payload.additional_references?.client_references ?? "",
    queryReferences: payload.additional_references?.query_references ?? "",
  };
};

const hasSpecDocumentPayload = (payload) =>
  Boolean(
    payload &&
      typeof payload === "object" &&
      (payload.general_information ||
        payload.concept_logic ||
        payload.results ||
        payload.additional_references)
  );

const buildSpecPayload = (values) => ({
  general_information: {
    query_id: values.queryId || "",
    query_title: values.queryTitle || "",
    query_description: values.queryDescription || "",
    concept_type: values.conceptType || "",
    query_complexity: values.queryComplexity || "",
    estimated_result_volume: values.estimatedResultVolume || "",
    related_queries: values.relatedQueries || "",
  },
  concept_logic: {
    reference_tables: values.referenceTables || "",
    anchor_good_claims: {
      good_claim_criteria: values.goodClaimCriteria || "",
      good_claim_exclusions: values.goodClaimExclusions || "",
    },
    potential_findings_bad_claims: {
      match_compare_with_good_claim_on: values.matchCompareWithGoodClaim || "",
      bad_claim_criteria: values.badClaimCriteria || "",
      bad_claim_exclusions: values.badClaimExclusions || "",
    },
  },
  results: {
    reference_claims: values.referenceClaims || "",
    output_level_good_claims: values.outputLevelGoodClaims || "",
    output_level_bad_claims: values.outputLevelBadClaims || "",
    output_all_as_bad: values.outputAllAsBad || "",
    case_structure: values.caseStructure || "",
    subsets: values.subsets || "",
    ecode: values.ecode || "",
    estimated_savings: values.estimatedSavings || "",
    savings: values.savings || "",
    eval_text: values.evalText || "",
    denial_text: values.denialText || "",
    reviewer_comments: values.reviewerComments || "",
    comments: values.comments || "",
  },
  additional_references: {
    pilot_code: values.pilotCode || "",
    client_references: values.clientReferences || "",
    query_references: values.queryReferences || "",
  },
});

const getQtsRuleUrl = (ruleId) =>
  `${CONCEPT_DEVELOPMENT_API_ENDPOINTS.QTS_RULES}/${encodeURIComponent(ruleId ?? "")}`;

export const RuleSpecDocumentModal = ({ isOpen, ruleId, onClose, setToast }) => {
  const [specValues, setSpecValues] = useState(createEmptySpecValues);
  const [isSpecLoading, setIsSpecLoading] = useState(false);
  const [isSpecSaving, setIsSpecSaving] = useState(false);
  const [specError, setSpecError] = useState("");
  const [specStatus, setSpecStatus] = useState("");

  const showToast = (message, severity) => {
    if (setToast) {
      setToast({ open: true, message, severity });
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    let isMounted = true;
    const fetchSpecDocument = async () => {
      setSpecValues(createEmptySpecValues());
      setSpecStatus("");
      setSpecError("");

      if (!ruleId) {
        const message = "Rule ID is required to load the spec document.";
        setSpecError(message);
        showToast(message, "error");
        return;
      }

      setIsSpecLoading(true);
      try {
        const response = await fetch(getQtsRuleUrl(ruleId), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const detail = await parseApiError(response, "Failed to load spec document.");
          if (isMounted) {
            setSpecError(detail);
            setSpecValues(createEmptySpecValues());
            showToast(detail, "error");
          }
          return;
        }

        const payload = await response.json();
        if (isMounted) {
          setSpecValues(mapSpecPayloadToValues(payload));
        }
      } catch (err) {
        const message = err?.message || "Failed to load spec document.";
        if (isMounted) {
          setSpecError(message);
          setSpecValues(createEmptySpecValues());
          showToast(message, "error");
        }
      } finally {
        if (isMounted) {
          setIsSpecLoading(false);
        }
      }
    };

    fetchSpecDocument();
    return () => {
      isMounted = false;
    };
  }, [isOpen, ruleId]);

  const handleSpecFieldChange = (fieldId, value) => {
    setSpecValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    setSpecStatus("");
    setSpecError("");
  };

  const handleSaveSpecDocument = async () => {
    if (!ruleId) {
      const message = "Rule ID is required to save the spec document.";
      setSpecError(message);
      showToast(message, "error");
      return;
    }

    setIsSpecSaving(true);
    setSpecStatus("");
    setSpecError("");
    try {
      const response = await fetch(getQtsRuleUrl(ruleId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(buildSpecPayload(specValues)),
      });

      if (!response.ok) {
        const detail = await parseApiError(response, "Failed to save spec document.");
        setSpecError(detail);
        showToast(detail, "error");
        return;
      }

      let payload = null;
      try {
        payload = await response.json();
      } catch (parseErr) {
        payload = null;
      }
      if (hasSpecDocumentPayload(payload)) {
        setSpecValues(mapSpecPayloadToValues(payload));
      }

      const message = "Spec document saved.";
      setSpecStatus(message);
      showToast(message, "success");
    } catch (err) {
      const message = err?.message || "Failed to save spec document.";
      setSpecError(message);
      showToast(message, "error");
    } finally {
      setIsSpecSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pdf-modal-overlay" id="spec-modal-overlay" onClick={onClose}>
      <div
        className="pdf-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spec-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pdf-modal-header">
          <h3 id="spec-modal-title">{SPEC_DOCUMENT_TITLE}</h3>
          <div className="spec-modal-actions">
            <button
              type="button"
              className="btn-spec-save"
              onClick={handleSaveSpecDocument}
              disabled={isSpecLoading || isSpecSaving}
            >
              {isSpecSaving ? "Saving..." : "Save"}
            </button>
            <button
              className="btn-close-modal"
              type="button"
              onClick={onClose}
              aria-label="Close spec document"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>
        <div className="pdf-modal-content spec-modal-content">
          <div className="spec-editor">
            {isSpecLoading ? (
              <div className="loading-indicator" role="status" aria-live="polite">
                Loading spec document...
              </div>
            ) : null}
            {specError ? (
              <div className="error-detail" role="alert">
                {"Error : " + specError}
              </div>
            ) : null}
            {specStatus ? (
              <div className="spec-save-status" role="status" aria-live="polite">
                {specStatus}
              </div>
            ) : null}
            {!isSpecLoading
              ? SPEC_DOCUMENT_SECTIONS.map((section) => (
                  <section className="spec-section" key={section.title}>
                    <div className="spec-section-header">
                      <h4>{section.title}</h4>
                      {section.description ? <p>{section.description}</p> : null}
                    </div>
                    <div className="spec-fields">
                      {section.fields.map((field) =>
                        field.type === "heading" ? (
                          <div className="spec-field-heading" key={field.id}>
                            {field.label}
                          </div>
                        ) : (
                          <label className="spec-field" key={field.id} htmlFor={`spec-${field.id}`}>
                            <span>{field.label}</span>
                            <textarea
                              id={`spec-${field.id}`}
                              value={specValues[field.id] || ""}
                              onChange={(event) =>
                                handleSpecFieldChange(field.id, event.target.value)
                              }
                              rows={3}
                            ></textarea>
                          </label>
                        )
                      )}
                    </div>
                  </section>
                ))
              : null}
          </div>
        </div>
      </div>
    </div>
  );
};
