import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Alert, Autocomplete, Snackbar, TextField } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import "./../css/ConceptDevelopment.css";
import { useClient } from "../context/ClientContext";
import { useAuth } from "../auth/AuthProvider";
import ConceptDevelopmentDetails from "../components/ConceptDevelopmentDetails/ConceptDevelopmentDetails";
import {
  CONCEPT_DEVELOPMENT_API_ENDPOINTS,
  getConceptDevelopmentInsightsUrl,
  resolveUserId,
} from "../config/apiConfig";

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (v) => {
  const n = toNum(v);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
};

const dashIfEmpty = (v) =>
  v === null || v === undefined || String(v).trim() === "" ? "-" : v;

const ensureAbsoluteUrl = (value) => {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const statusClass = (status) => {
  if (!status) return "";
  const s = status.toLowerCase();
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

const getPolicyClaimsInScope = (policy) => {
  if (policy?.claims_in_scope !== null && policy?.claims_in_scope !== undefined) {
    return policy.claims_in_scope;
  }
  return (policy?.rules || []).reduce((sum, rule) => sum + toNum(rule?.claims_in_scope), 0);
};
const getPolicyPaidAmountInScope = (policy) => {
  if (policy?.paid_amount_in_scope !== null && policy?.paid_amount_in_scope !== undefined) {
    return policy.paid_amount_in_scope;
  }
  const rules = policy?.rules || [];
  const hasAnyValue = rules.some(
    (rule) => rule?.paid_amount_in_scope !== null && rule?.paid_amount_in_scope !== undefined
  );
  if (!hasAnyValue) return null;
  return rules.reduce((sum, rule) => sum + toNum(rule?.paid_amount_in_scope), 0);
};

const STATUS_OPTIONS = [
  "Not started",
  "In progress",
  "Ready to review",
  "Accept",
  "Reject",
  "On hold",
  "Not feasible",
];
const BLOCKED_STATUS_OPTION = "Ready to review";
const ON_HOLD_STATUS = "On hold";
const ACCEPT_STATUS_OPTION = "Accept";
const REJECT_STATUS_OPTION = "Reject";
const STATUS_RESTRICTION_MESSAGES = {
  [BLOCKED_STATUS_OPTION]:
    "The status will automatically change to Ready to Review once all the assigned rules have moved to Ready to Review in Rule Details.",
  [ACCEPT_STATUS_OPTION]:
    "Accept/Reject status will apply only to ready to review rules and is accessible on the Rule details page.",
  [REJECT_STATUS_OPTION]:
    "Accept/Reject status will apply only to ready to review rules and is accessible on the Rule details page.",
};
const ON_HOLD_REASON_OPTIONS = [
  "Awaiting additional data/response from third party",
  "Potential duplicate case",
  "External dependency pending",
  "Requires additional research/analysis",
  "Deferred to next fiscal year",
  "Under investigation",
  "Waiting for approval/authorization",
  "Requires further validation",
];
const EMPTY_FILTERS = {
  state: "",
  policyId: "",
  ruleCategory: "",
  description: "",
  assignedTo: "",
  status: "",
  statusReason: "",
};

const STATUS_NORMALIZATION_MAP = {
  "not started": "Not started",
  "not-started": "Not started",
  "not_started": "Not started",
  "in progress": "In progress",
  "in-progress": "In progress",
  in_progress: "In progress",
  "ready to review": "Ready to review",
  "ready-to-review": "Ready to review",
  ready_to_review: "Ready to review",
  accepted: "Accept",
  accept: "Accept",
  approved: "Accept",
  rejected: "Reject",
  reject: "Reject",
  "on hold": "On hold",
  "on-hold": "On hold",
  on_hold: "On hold",
  "not feasible": "Not feasible",
  "not-feasible": "Not feasible",
  not_feasible: "Not feasible",
};

const toTitleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const normalizeStatusLabel = (value) => {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  const compact = raw.toLowerCase().replace(/[\s_-]+/g, " ").trim();
  return STATUS_NORMALIZATION_MAP[compact] || toTitleCase(raw.replace(/_/g, " "));
};
const toStatusDisplayLabel = (value) => toTitleCase(String(value || "").trim());

const getRuleKey = (policyId, ruleId) => `${policyId}::${ruleId}`;
const getRuleAssignedTo = (rule) => String(rule?.assigned_to_email ?? "").trim();
const getRuleStatusValue = (rule) => normalizeStatusLabel(rule?.rule_status);
const getRuleStatusReason = (rule) => String(rule?.status_reason ?? "").trim();
const getRuleAssigneeLabel = (rule) =>
  String(rule?.assigned_to_name ?? rule?.rule_assigned_to ?? rule?.assigned_to_email ?? "").trim();
const getRuleConceptMatches = (rule) => {
  const conceptMatches = Array.isArray(rule?.concept_match) ? rule.concept_match : [];
  const normalizedMatches = conceptMatches
    .map((concept) => ({
      qid: String(concept?.qid ?? "").trim(),
      metadata: concept?.metadata ?? null,
    }))
    .filter((concept) => concept.qid);

  if (normalizedMatches.length) return normalizedMatches;

  const legacyQid = String(rule?.qid ?? "").trim();
  return legacyQid
    ? [{
        qid: legacyQid,
        metadata: rule?.qid_metadata ?? null,
      }]
    : [];
};
const getRuleConceptMatchText = (rule) =>
  getRuleConceptMatches(rule).map((concept) => concept.qid).join(", ");
const getPolicyRuleState = (policy, rule) => String(rule?.state ?? policy?.state ?? "").trim();
const getPolicyId = (policy) => String(policy?.policy_id ?? "").trim();
const getPolicyName = (policy) => String(policy?.policy_name ?? policy?.policy_id ?? "").trim();
const getPolicyStatus = (policy) => {
  const expiryDate = String(policy?.policy_expiry_date ?? "").trim();
  if (expiryDate) return "Inactive";

  const effectiveDate = String(policy?.policy_effective_date ?? "").trim();
  if (effectiveDate) return "Active";

  return "";
};
const getPolicyRuleRows = (policies) =>
  (policies || []).flatMap((policy) =>
    (policy?.rules || []).map((rule) => ({
      policy,
      rule,
    }))
  );
const getRuleCategoryLabel = (rule) => {
  const category = String(rule?.rule_category ?? "").trim();
  return category || "Uncategorized";
};
const getVisibleTableColumnCount = (visibleColumns, showActionsColumn) =>
  1 +
  COLUMN_OPTIONS.filter((column) => Boolean(visibleColumns[column.key])).length +
  (showActionsColumn ? 1 : 0);
const doesPolicyRuleMatchFilters = (
  policy,
  rule,
  filters,
  ignoredKeys = [],
  { includeDescription = false } = {}
) => {
  const ignored = ignoredKeys instanceof Set ? ignoredKeys : new Set(ignoredKeys);
  const descriptionSearch = String(filters.description || "").trim().toLowerCase();

  if (!ignored.has("state") && filters.state) {
    if (getPolicyRuleState(policy, rule) !== String(filters.state)) return false;
  }
  if (!ignored.has("policyId") && filters.policyId) {
    if (getPolicyId(policy) !== String(filters.policyId)) return false;
  }
  if (!ignored.has("ruleCategory") && filters.ruleCategory) {
    if (String(rule?.rule_category ?? "") !== String(filters.ruleCategory)) return false;
  }
  if (includeDescription && !ignored.has("description") && descriptionSearch) {
    const policyDescription = String(policy?.policy_description ?? "").toLowerCase();
    const ruleDescription = String(rule?.rule_description ?? "").toLowerCase();
    if (
      !policyDescription.includes(descriptionSearch) &&
      !ruleDescription.includes(descriptionSearch)
    ) {
      return false;
    }
  }
  if (!ignored.has("assignedTo") && filters.assignedTo) {
    if (getRuleAssignedTo(rule) !== String(filters.assignedTo)) return false;
  }
  if (!ignored.has("status") && filters.status) {
    if (getRuleStatusValue(rule) !== String(filters.status)) return false;
  }
  if (!ignored.has("statusReason") && filters.statusReason) {
    if (getRuleStatusReason(rule) !== String(filters.statusReason)) return false;
  }

  return true;
};
const getFilteredPolicyRuleRows = (rows, filters, ignoredKeys = [], options = {}) =>
  (rows || []).filter(({ policy, rule }) =>
    doesPolicyRuleMatchFilters(policy, rule, filters, ignoredKeys, options)
  );
const buildUniqueOptions = (items, getValue, getLabel = getValue) => {
  const seen = new Set();
  return (items || [])
    .map((item) => {
      const value = String(getValue(item) ?? "").trim();
      return {
        value,
        label: String(getLabel(item) ?? value).trim() || value,
      };
    })
    .filter((option) => {
      if (!option.value || seen.has(option.value)) return false;
      seen.add(option.value);
      return true;
    })
    .map((option) => ({
      key: option.value,
      value: option.value,
      label: option.label,
    }));
};
const EDIT_ALLOWED_USERS_FOR_ACCEPT_REJECT = new Set([
  "chris.hall@gainwelltechnologies.com",
  "matthew.giering@gainwelltechnologies.com",
  // "local.dev@gainwelltechnologies.com",
]);
const isAcceptOrRejectStatus = (status) => {
  const normalized = normalizeStatusLabel(status);
  return normalized === "Accept" || normalized === "Reject";
};
const resolveCurrentUserEmail = (account) =>
  String(
    account?.idTokenClaims?.email ||
      account?.idTokenClaims?.preferred_username ||
      account?.idTokenClaims?.upn ||
      account?.email ||
      account?.preferred_username ||
      account?.username ||
      resolveUserId(account) ||
      ""
  )
    .trim()
    .toLowerCase();

const filterAssigneeOptions = (options, { inputValue }) => {
  const search = String(inputValue || "").trim().toLowerCase();
  const filteredOptions = !search
    ? options
    : options.filter(
        (option) =>
          option.name.toLowerCase().includes(search) || option.email.toLowerCase().includes(search)
      );
  return dedupeAssigneeOptions(filteredOptions);
};

const renderHighlightedDescription = (text, searchTerm) => {
  const displayText = dashIfEmpty(text);
  const normalizedSearch = String(searchTerm || "").trim().toLowerCase();
  if (!normalizedSearch || displayText === "-") {
    return displayText;
  }

  const rawText = String(displayText);
  const lowered = rawText.toLowerCase();
  const highlighted = [];
  let cursor = 0;
  let matchStart = lowered.indexOf(normalizedSearch, cursor);
  let partIndex = 0;

  while (matchStart !== -1) {
    if (matchStart > cursor) {
      highlighted.push(
        <React.Fragment key={`txt-${partIndex++}`}>
          {rawText.slice(cursor, matchStart)}
        </React.Fragment>
      );
    }
    highlighted.push(
      <mark key={`hl-${partIndex++}`} className="description-highlight">
        {rawText.slice(matchStart, matchStart + normalizedSearch.length)}
      </mark>
    );
    cursor = matchStart + normalizedSearch.length;
    matchStart = lowered.indexOf(normalizedSearch, cursor);
  }

  if (cursor < rawText.length) {
    highlighted.push(<React.Fragment key={`txt-${partIndex++}`}>{rawText.slice(cursor)}</React.Fragment>);
  }

  return highlighted.length ? highlighted : rawText;
};

const compareAssigneeOptions = (a, b) => {
  const nameCompare = String(a?.name || "").localeCompare(String(b?.name || ""), undefined, {
    sensitivity: "base",
  });
  if (nameCompare !== 0) return nameCompare;
  return String(a?.email || "").localeCompare(String(b?.email || ""), undefined, {
    sensitivity: "base",
  });
};

const getAssigneeOptionKey = (option) =>
  String(option?.email || option?.name || "").trim().toLowerCase();

const dedupeAssigneeOptions = (options) => {
  const seen = new Set();
  return (options || []).filter((option) => {
    const key = getAssigneeOptionKey(option);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const COLUMN_OPTIONS = [
  { key: "state", label: "State_LOB", defaultVisible: true },
  { key: "policy_status", label: "Policy Status", defaultVisible: false },
  { key: "policy_rule", label: "Policy/Rule", defaultVisible: true },
  { key: "rule_category", label: "Rule Category", defaultVisible: true },
  { key: "description", label: "Description", defaultVisible: true },
  { key: "claim_type", label: "Claim Type", defaultVisible: false },
  { key: "claims_in_scope", label: "Claims in Scope", defaultVisible: true },
  { key: "paid_amount_in_scope", label: "Paid Amount in Scope", defaultVisible: true },
  { key: "matching_concepts", label: "Matching Concepts", defaultVisible: true },
  { key: "assigned_to", label: "Assigned To", defaultVisible: true },
  { key: "status", label: "Status", defaultVisible: true },
  { key: "status_reason", label: "Status Reason", defaultVisible: false },
  { key: "review_document", label: "Review Document", defaultVisible: false },
];

const DEFAULT_VISIBLE_COLUMNS = COLUMN_OPTIONS.reduce((acc, option) => {
  acc[option.key] = option.defaultVisible;
  return acc;
}, {});

const COLUMN_SELECTION_CACHE_KEY = "conceptDevelopment.visibleColumns.session";

const sanitizeVisibleColumns = (value) => {
  if (!value || typeof value !== "object") {
    return DEFAULT_VISIBLE_COLUMNS;
  }

  const normalized = { ...DEFAULT_VISIBLE_COLUMNS };
  Object.keys(DEFAULT_VISIBLE_COLUMNS).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      normalized[key] = Boolean(value[key]);
    }
  });
  return normalized;
};

const getInitialVisibleColumns = () => {
  try {
    if (typeof window === "undefined") {
      return DEFAULT_VISIBLE_COLUMNS;
    }
    const cachedValue = window.sessionStorage.getItem(COLUMN_SELECTION_CACHE_KEY);
    if (!cachedValue) {
      return DEFAULT_VISIBLE_COLUMNS;
    }
    const parsed = JSON.parse(cachedValue);
    return sanitizeVisibleColumns(parsed);
  } catch (err) {
    console.warn("[ConceptDevelopment] Failed to restore column selection cache", err);
    return DEFAULT_VISIBLE_COLUMNS;
  }
};

const emptyData = {
  no_of_policies: 0,
  no_of_rules: 0,
  total_paid: 0,
  policy_rules: [],
  states: [],
};

const normalizeInsights = (payload) => {
  if (!payload) return emptyData;

  const root =
    payload?.data ??
    payload?.summaryinsights ??
    payload?.summary_insights ??
    payload?.state_wise ??
    payload?.statewise ??
    payload?.stateWise ??
    payload;

  const stateItems = Array.isArray(root)
    ? root
    : Array.isArray(root?.states)
      ? root.states
      : [root];

  const normalizedItems = stateItems.flatMap((item) => {
    const isWrappedByState =
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      Object.keys(item).length === 1 &&
      typeof Object.values(item)[0] === "object";

    const rawStateItems = isWrappedByState
      ? Object.entries(item).map(([stateKey, value]) => ({
          ...value,
          state: value?.state ?? value?.state_name ?? value?.state_code ?? stateKey,
        }))
      : [item];

    return rawStateItems.map((raw) => {
      const stateName = raw?.state ?? raw?.state_name ?? raw?.state_code ?? "";
      const policies = (raw?.policy_rules ?? []).map((policy) => {
        const policyState = policy?.state ?? stateName;
        return {
          ...policy,
          state: policyState,
          rules: (policy?.rules || []).map((rule) => ({
            ...rule,
            state: rule?.state ?? policyState,
          })),
        };
      });

      return {
        no_of_policies: raw?.no_of_policies ?? policies.length,
        no_of_rules:
          raw?.no_of_rules ??
          policies.reduce((sum, policy) => sum + (policy.rules || []).length, 0),
        total_paid: raw?.total_paid ?? 0,
        policy_rules: policies,
        state: stateName,
      };
    });
  });

  const policy_rules = normalizedItems.flatMap((item) => item.policy_rules || []);
  const no_of_policies = normalizedItems.reduce(
    (sum, item) => sum + toNum(item?.no_of_policies),
    0
  );
  const no_of_rules = normalizedItems.reduce(
    (sum, item) => sum + toNum(item?.no_of_rules),
    0
  );
  const total_paid = normalizedItems.reduce(
    (sum, item) => sum + toNum(item?.total_paid),
    0
  );
  const states = normalizedItems
    .map((item) => item.state)
    .filter((state) => state);

  return {
    no_of_policies,
    no_of_rules,
    total_paid,
    policy_rules,
    states,
  };
};

const RuleRow = React.memo(({
  rule,
  policyStatus,
  docUrl,
  controlledRegionId,
  visibleColumns,
  availableAssignees,
  currentStatus,
  currentStatusReason,
  isEditing,
  isSaving,
  editStatus,
  editAssignee,
  onStatusDraftChange,
  onAssigneeDraftChange,
  onStartEdit,
  onCancelEdit,
  onRuleClick,
  onQidMetadataClick,
  disableEdit,
  descriptionSearchTerm,
}) => {
  const displayRuleId = rule?.updated_rule_id ?? rule?.rule_id;
  const conceptMatches = getRuleConceptMatches(rule);
  const assigneeDisplay = String(getRuleAssigneeLabel(rule) || "").trim();
  const statusDisplay = String(currentStatus || "").trim();
  const selectedAssigneeOption = availableAssignees.find(
    (user) => user.email === editAssignee || user.name === editAssignee
  ) || null;
  const selectedAssigneeValue =
    selectedAssigneeOption ||
    (editAssignee
      ? {
          email: editAssignee,
          name: getRuleAssigneeLabel(rule) || editAssignee,
        }
      : null);
  const hasCustomStatus =
    Boolean(editStatus) && !STATUS_OPTIONS.some((statusOption) => statusOption === editStatus);
  const assignedFullName = String(rule?.assigned_to_name ?? selectedAssigneeOption?.name ?? "").trim();
  const assignedToHoverTitle = assignedFullName || undefined;
  const showActionsColumn = visibleColumns.assigned_to || visibleColumns.status;

  return (
    <tr
      id={`${controlledRegionId}-${rule.rule_id}`}
      className={`rule-row${isEditing ? " row-editing" : ""}`}
      data-rule={rule.rule_id}
      onClick={(e) => {
        e.stopPropagation();
        onRuleClick();
      }} // avoid toggling expand
    >
      <td></td>
      {visibleColumns.policy_rule ? (
        <td style={{ paddingLeft: "20px" }}>{dashIfEmpty(displayRuleId)}</td>
      ) : null}
      {visibleColumns.rule_category ? <td>{dashIfEmpty(rule.rule_category)}</td> : null}
      {visibleColumns.description ? (
        <td className="description-cell" title={dashIfEmpty(rule.rule_description)}>
          <span className="description-text">
            {renderHighlightedDescription(rule.rule_description, descriptionSearchTerm)}
          </span>
        </td>
      ) : null}
      {visibleColumns.state ? <td>{dashIfEmpty(rule.state)}</td> : null}
      {visibleColumns.policy_status ? <td>{policyStatus}</td> : null}
      {visibleColumns.claim_type ? <td>{dashIfEmpty(rule.claim_type)}</td> : null}
      {visibleColumns.claims_in_scope ? (
        <td>{dashIfEmpty(rule?.claims_in_scope)}</td>
      ) : null}
      {visibleColumns.paid_amount_in_scope ? (
        <td className="opportunity-amount">
          {rule?.paid_amount_in_scope !== null && rule?.paid_amount_in_scope !== undefined
            ? formatMoney(rule?.paid_amount_in_scope)
            : "-"}
        </td>
      ) : null}
      {visibleColumns.matching_concepts ? (
        <td>
          <span className="matching-concept-cell">
            {conceptMatches.length ? (
              conceptMatches.map((concept, index) => (
                <span className="matching-concept-item" key={`${concept.qid}-${index}`}>
                  <span>{dashIfEmpty(concept.qid)}</span>
                  {concept.metadata ? (
                    <button
                      type="button"
                      className="qid-info-button"
                      aria-label={`View metadata for QID ${concept.qid}`}
                      title="View QID details"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQidMetadataClick(concept);
                      }}
                    >
                      <InfoOutlinedIcon fontSize="inherit" />
                    </button>
                  ) : null}
                </span>
              ))
            ) : (
              <span>-</span>
            )}
          </span>
        </td>
      ) : null}
      {visibleColumns.assigned_to ? (
        <td onClick={(e) => e.stopPropagation()} title={isEditing ? undefined : assignedToHoverTitle}>
          <span className="assigned-to-display">{dashIfEmpty(assigneeDisplay)}</span>
          <div className="assigned-to-wrapper">
            <Autocomplete
              className="assignee-autocomplete"
              options={availableAssignees}
              filterOptions={filterAssigneeOptions}
              value={selectedAssigneeValue}
              openOnFocus
              disablePortal
              disabled={isSaving}
              getOptionLabel={(option) => option?.name || ""}
              isOptionEqualToValue={(option, value) =>
                option.email
                  ? option.email === value.email
                  : option.name === value.name
              }
              onChange={(_, newValue) => {
                onAssigneeDraftChange(newValue?.email || "");
              }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps} title={option.name || ""}>
                    <span className="assignee-option-name">{option.name}</span>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Select.."
                  inputProps={{
                    ...params.inputProps,
                    title: assignedToHoverTitle || "",
                  }}
                />
              )}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </td>
      ) : null}
      {visibleColumns.status ? (
        <td onClick={(e) => e.stopPropagation()}>
          <span className={`status-display ${statusClass(statusDisplay)}`}>
            {dashIfEmpty(toStatusDisplayLabel(statusDisplay))}
          </span>
          <div className="status-editor-cell">
            <select
              className={`status-select ${statusClass(editStatus)}`}
              value={editStatus || ""}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                onStatusDraftChange(e.target.value);
              }}
              disabled={isSaving}
            >
              <option value="">Select Status</option>
              {hasCustomStatus ? <option value={editStatus}>{editStatus}</option> : null}
              {STATUS_OPTIONS.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
          </div>
        </td>
      ) : null}
      {visibleColumns.status_reason ? (
        <td className="status-reason-cell" title={dashIfEmpty(currentStatusReason)}>
          {dashIfEmpty(currentStatusReason)}
        </td>
      ) : null}
      {visibleColumns.review_document ? (
        <td>
          {docUrl ? (
            <div className="review-doc-cell" onClick={(e) => e.stopPropagation()}>
              <a
                className="review-doc-url"
                href={ensureAbsoluteUrl(docUrl)}
                target="_blank"
                rel="noopener noreferrer"
                title={ensureAbsoluteUrl(docUrl)}
              >
                View Document
              </a>
            </div>
          ) : (
            "-"
          )}
        </td>
      ) : null}
      {showActionsColumn ? (
        <td className="col-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className={`row-edit-btn${isEditing ? " cancel-mode" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isEditing) {
                onCancelEdit();
                return;
              }
              onStartEdit();
            }}
            title={
              disableEdit
                ? "Edit is restricted for Accept/Reject status."
                : isEditing
                ? "Cancel"
                : "Edit"
            }
            disabled={isSaving || disableEdit}
          >
            {isEditing ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            )}
          </button>
        </td>
      ) : null}
    </tr>
  );
});

const ConceptDevelopment = ({ isActive = true }) => {
  const { client } = useClient();
  const { account, users } = useAuth();
  const currentUserEmail = useMemo(() => resolveCurrentUserEmail(account), [account]);
  const requestSeqRef = useRef(0);
  const columnSelectorRef = useRef(null);
  const wasActiveRef = useRef(isActive);
  const skipNextActiveClientFetchRef = useRef(false);
  const skipNextActiveClientResetRef = useRef(false);

  const [data, setData] = useState(emptyData);
  const [expanded, setExpanded] = useState(() => new Set());
  const [showRuleDetails, setShowRuleDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [selectedRuleContext, setSelectedRuleContext] = useState(null);
  const [lastSelectedRule, setLastSelectedRule] = useState(null);
  const [pendingOverviewRestore, setPendingOverviewRestore] = useState(null);
  const [loadedClientKey, setLoadedClientKey] = useState("");
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() => getInitialVisibleColumns());
  const [rowEditDrafts, setRowEditDrafts] = useState({});
  const [modalState, setModalState] = useState(null);
  const [isSavingBulk, setIsSavingBulk] = useState(false);
  const wasDescriptionSearchActiveRef = useRef(false);

  const assigneeOptions = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return dedupeAssigneeOptions(list.filter((user) => user?.email && user?.name)).sort(
      compareAssigneeOptions
    );
  }, [users]);

  useEffect(() => {
    try {
      sessionStorage.setItem(COLUMN_SELECTION_CACHE_KEY, JSON.stringify(visibleColumns));
    } catch (err) {
      console.warn("[ConceptDevelopment] Failed to persist column selection cache", err);
    }
  }, [visibleColumns]);

  const resetView = useCallback(() => {
    setShowRuleDetails(false);
    setSelectedRuleContext(null);
  }, []);

  const getInsightsData = useCallback(async (abortSignal) => {
    if (!client) {
      console.warn("[ConceptDevelopment] Missing client id; skipping insights fetch.");
      return;
    }

    const seq = ++requestSeqRef.current;
    const userId = resolveUserId(account);
    const url = getConceptDevelopmentInsightsUrl(client, userId);
    setIsLoading(true);
    setErrorDetail("");
    setExpanded(new Set());
    setRowEditDrafts({});
    setModalState(null);
    resetView();

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: abortSignal,
      });

      if (!response.ok) {
        if (seq !== requestSeqRef.current) return;
        let detail = "";
        try {
          const errorPayload = await response.json();
          detail = errorPayload?.message || JSON.stringify(errorPayload);
        } catch (parseErr) {
          detail = response.statusText || "Request failed.";
        }
        console.warn("[ConceptDevelopment] Insights fetch failed", {
          status: response.status,
          statusText: response.statusText,
        });
        setErrorDetail(detail);
        setData(emptyData);
        return;
      }

      const payload = await response.json();
      if (seq !== requestSeqRef.current) return;
      setData(normalizeInsights(payload));
      setLoadedClientKey(String(client || ""));
    } catch (err) {
      if (abortSignal?.aborted) return;
      if (seq !== requestSeqRef.current) return;
      console.error("[ConceptDevelopment] Failed to load insights data", err);
      setErrorDetail(err?.message || "Failed to load insights data.");
      setData(emptyData);
    } finally {
      if (seq === requestSeqRef.current) {
        setIsLoading(false);
      }
    }
  }, [client, account, resetView]);

  useEffect(() => {
    if (isActive && !wasActiveRef.current) {
      skipNextActiveClientFetchRef.current = true;
      skipNextActiveClientResetRef.current = true;
    }
    wasActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return undefined;
    if (skipNextActiveClientFetchRef.current) {
      skipNextActiveClientFetchRef.current = false;
      return undefined;
    }
    if (client && loadedClientKey === String(client || "")) {
      return undefined;
    }
    const controller = new AbortController();
    getInsightsData(controller.signal);
    return () => controller.abort();
  }, [client, isActive, loadedClientKey, getInsightsData]);

  const onRuleBackClick = useCallback(() => {
    setPendingOverviewRestore(lastSelectedRule);
    resetView();
    const controller = new AbortController();
    getInsightsData(controller.signal);
  }, [getInsightsData, lastSelectedRule, resetView]);

  const toggleExpand = (policyId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(policyId) ? next.delete(policyId) : next.add(policyId);
      return next;
    });
  };

  const handleRowKeyDown = (e, policyId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleExpand(policyId);
    }
  };

  const allPolicies = useMemo(() => data.policy_rules || [], [data.policy_rules]);
  const allPolicyRuleRows = useMemo(() => getPolicyRuleRows(allPolicies), [allPolicies]);

  const stateOptions = useMemo(() => {
    const rows = getFilteredPolicyRuleRows(allPolicyRuleRows, draftFilters, ["state"]);
    return buildUniqueOptions(rows, ({ policy, rule }) => getPolicyRuleState(policy, rule));
  }, [allPolicyRuleRows, draftFilters]);

  const policyOptions = useMemo(() => {
    const rows = getFilteredPolicyRuleRows(allPolicyRuleRows, draftFilters, ["policyId"]);
    return buildUniqueOptions(
      rows,
      ({ policy }) => getPolicyId(policy),
      ({ policy }) => getPolicyName(policy)
    );
  }, [allPolicyRuleRows, draftFilters]);

  const ruleCategoryOptions = useMemo(() => {
    const rows = getFilteredPolicyRuleRows(allPolicyRuleRows, draftFilters, ["ruleCategory"]);
    return buildUniqueOptions(rows, ({ rule }) => rule?.rule_category);
  }, [allPolicyRuleRows, draftFilters]);

  const assignedToFilterOptions = useMemo(() => {
    const rows = getFilteredPolicyRuleRows(allPolicyRuleRows, draftFilters, ["assignedTo"]);
    return buildUniqueOptions(
      rows.filter(
        ({ rule }) =>
          getRuleAssignedTo(rule).toLowerCase() !== "not.assigned@gainwelltechnologies.com"
      ),
      ({ rule }) => getRuleAssignedTo(rule)
    );
  }, [allPolicyRuleRows, draftFilters]);

  const statusFilterOptions = useMemo(() => {
    const rows = getFilteredPolicyRuleRows(allPolicyRuleRows, draftFilters, ["status"]);
    return buildUniqueOptions(rows, ({ rule }) => getRuleStatusValue(rule));
  }, [allPolicyRuleRows, draftFilters]);

  const statusReasonFilterOptions = useMemo(() => {
    const rows = getFilteredPolicyRuleRows(allPolicyRuleRows, draftFilters, ["statusReason"]);
    return buildUniqueOptions(rows, ({ rule }) => getRuleStatusReason(rule));
  }, [allPolicyRuleRows, draftFilters]);

  const getFilterValueSets = useCallback(
    (filters) => ({
      state: new Set(
        buildUniqueOptions(
          getFilteredPolicyRuleRows(allPolicyRuleRows, filters, ["state"]),
          ({ policy, rule }) => getPolicyRuleState(policy, rule)
        ).map((option) => String(option.value))
      ),
      policyId: new Set(
        buildUniqueOptions(
          getFilteredPolicyRuleRows(allPolicyRuleRows, filters, ["policyId"]),
          ({ policy }) => getPolicyId(policy)
        ).map((option) => String(option.value))
      ),
      ruleCategory: new Set(
        buildUniqueOptions(
          getFilteredPolicyRuleRows(allPolicyRuleRows, filters, ["ruleCategory"]),
          ({ rule }) => rule?.rule_category
        ).map((option) => String(option.value))
      ),
      assignedTo: new Set(
        buildUniqueOptions(
          getFilteredPolicyRuleRows(allPolicyRuleRows, filters, ["assignedTo"]),
          ({ rule }) => getRuleAssignedTo(rule)
        ).map((option) => String(option.value))
      ),
      status: new Set(
        buildUniqueOptions(
          getFilteredPolicyRuleRows(allPolicyRuleRows, filters, ["status"]),
          ({ rule }) => getRuleStatusValue(rule)
        ).map((option) => String(option.value))
      ),
      statusReason: new Set(
        buildUniqueOptions(
          getFilteredPolicyRuleRows(allPolicyRuleRows, filters, ["statusReason"]),
          ({ rule }) => getRuleStatusReason(rule)
        ).map((option) => String(option.value))
      ),
    }),
    [allPolicyRuleRows]
  );

  const filteredPolicies = useMemo(() => {
    const hasActiveFilters = Object.values(appliedFilters).some((value) => String(value).trim());

    return allPolicies
      .map((policy) => ({
        ...policy,
        rules: (policy.rules || []).filter((rule) => {
          if (!hasActiveFilters) return true;
          return doesPolicyRuleMatchFilters(policy, rule, appliedFilters, [], {
            includeDescription: true,
          });
        }),
      }))
      .filter((policy) => (policy.rules || []).length > 0);
  }, [allPolicies, appliedFilters]);
  const descriptionSearchTerm = String(appliedFilters.description || "").trim();

  const policiesWithGroupedRules = useMemo(() => {
    return (filteredPolicies || []).map((policy) => {
      const categoryRules = new Map();
      (policy.rules || []).forEach((rule) => {
        const category = getRuleCategoryLabel(rule);
        if (!categoryRules.has(category)) {
          categoryRules.set(category, []);
        }
        categoryRules.get(category).push(rule);
      });

      return {
        ...policy,
        ruleCategoryGroups: Array.from(categoryRules.entries()).map(([category, rules]) => ({
          key: `${policy.policy_id}::${category}`,
          label: category,
          rules,
        })),
      };
    });
  }, [filteredPolicies]);

  useEffect(() => {
    if (isLoading) return;

    const sanitize = (filters, valid) => {
      let changed = false;
      const next = { ...filters };
      Object.keys(valid).forEach((key) => {
        const value = String(filters[key] || "");
        if (value && !valid[key].has(value)) {
          next[key] = "";
          changed = true;
        }
      });
      return changed ? next : filters;
    };

    setDraftFilters((prev) => sanitize(prev, getFilterValueSets(prev)));
    setAppliedFilters((prev) => sanitize(prev, getFilterValueSets(prev)));
  }, [isLoading, draftFilters, getFilterValueSets]);

  const summaryMetrics = useMemo(() => {
    const policies = filteredPolicies || [];
    const no_of_policies = policies.length;
    const no_of_rules = policies.reduce((sum, p) => sum + (p.rules || []).length, 0);
    return { no_of_policies, no_of_rules };
  }, [filteredPolicies]);
  const activeFilterSummary = useMemo(() => {
    const labels = [];
    if (appliedFilters.state) labels.push(`State_LOB: ${appliedFilters.state}`);
    if (appliedFilters.policyId) labels.push(`Policy: ${appliedFilters.policyId}`);
    if (appliedFilters.ruleCategory) labels.push(`Rule Category: ${appliedFilters.ruleCategory}`);
    if (appliedFilters.assignedTo) labels.push(`Assigned To: ${appliedFilters.assignedTo}`);
    if (appliedFilters.status) labels.push(`Status: ${appliedFilters.status}`);
    return labels.join(", ");
  }, [appliedFilters]);

  const onRuleClick = (policy, rule) => {
    setLastSelectedRule({
      client_key: String(client || ""),
      policy_id: policy?.policy_id,
      rule_id: rule?.rule_id,
    });
    setPendingOverviewRestore(null);
    setSelectedRuleContext({
      policy,
      rule,
      feedbackProvidedBy: rule?.rule_assigned_to ?? "",
    });
    setShowRuleDetails(true);
  };

  const openQidMetadataModal = (concept) => {
    const qid = String(concept?.qid || "").trim();
    if (!qid || !concept?.metadata) return;
    setModalState({
      type: "qid_metadata",
      qid,
      metadata: concept.metadata,
    });
  };

  useEffect(() => {
    if (!isActive) return;
    if (skipNextActiveClientResetRef.current) {
      skipNextActiveClientResetRef.current = false;
      return;
    }
    setLastSelectedRule(null);
    setPendingOverviewRestore(null);
    setShowRuleDetails(false);
    setSelectedRuleContext(null);
  }, [client, isActive]);

  useEffect(() => {
    if (showRuleDetails) return;
    if (!pendingOverviewRestore?.policy_id || !pendingOverviewRestore?.rule_id) return;
    if (String(pendingOverviewRestore.client_key || "") !== String(client || "")) return;
    if (!data.policy_rules?.length) return;

    const policyId = pendingOverviewRestore.policy_id;
    const ruleId = pendingOverviewRestore.rule_id;
    setExpanded((prev) => {
      if (prev.has(policyId)) return prev;
      const next = new Set(prev);
      next.add(policyId);
      return next;
    });

    const rowId = `${policyId}-rules-region-${ruleId}`;
    requestAnimationFrame(() => {
      const el = document.getElementById(rowId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setPendingOverviewRestore(null);
      }
    });
  }, [client, data.policy_rules, pendingOverviewRestore, showRuleDetails]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!columnSelectorRef.current) return;
      if (!columnSelectorRef.current.contains(event.target)) {
        setIsColumnSelectorOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsColumnSelectorOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleToastClose = (_, reason) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const toggleColumnVisibility = (columnKey, checked) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: checked,
    }));
  };

  const getCurrentStatus = (_, rule) => getRuleStatusValue(rule);

  const getCurrentStatusReason = (_, rule) => String(rule?.status_reason ?? "");

  const getCurrentAssignee = (_, rule) => getRuleAssignedTo(rule);

  const getRuleEditDraft = (policyId, ruleId) => rowEditDrafts[getRuleKey(policyId, ruleId)] || null;

  const findRuleContext = useCallback(
    (policyId, ruleId) => {
      const policy = (allPolicies || []).find(
        (item) => String(item?.policy_id) === String(policyId)
      );
      if (!policy) return null;
      const rule = (policy.rules || []).find((item) => String(item?.rule_id) === String(ruleId));
      if (!rule) return null;
      return { policy, rule };
    },
    [allPolicies]
  );

  const startRuleEdit = (policyId, rule) => {
    const ruleKey = getRuleKey(policyId, rule.rule_id);
    setRowEditDrafts((prev) => ({
      ...prev,
      [ruleKey]: {
        policyId: String(policyId),
        ruleId: String(rule.rule_id),
        isEditing: true,
        status: getRuleStatusValue(rule),
        assignee: getRuleAssignedTo(rule),
        statusReason: getRuleStatusReason(rule),
      },
    }));
  };

  const setRuleEditDraftField = (policyId, ruleId, field, value) => {
    const ruleKey = getRuleKey(policyId, ruleId);
    setRowEditDrafts((prev) => {
      const current = prev[ruleKey];
      if (!current) return prev;
      return {
        ...prev,
        [ruleKey]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const handleStatusDraftChange = (policyId, ruleId, nextStatus) => {
    const normalized = normalizeStatusLabel(nextStatus || "");
    const restrictionMessage = STATUS_RESTRICTION_MESSAGES[normalized];
    if (restrictionMessage) {
      setModalState({
        type: "blocked_notice",
        blocked_status: normalized,
        blocked_message: restrictionMessage,
      });
      return;
    }

    if (normalized === ON_HOLD_STATUS) {
      const context = findRuleContext(policyId, ruleId);
      const currentReason = getRuleStatusReason(context?.rule || {});
      const draftReason = getRuleEditDraft(policyId, ruleId)?.statusReason;
      setModalState({
        type: "on_hold_reason",
        policy_id: String(policyId),
        rule_id: String(ruleId),
        status_reason: String(draftReason ?? currentReason ?? ""),
      });
      return;
    }

    setRowEditDrafts((prev) => {
      const ruleKey = getRuleKey(policyId, ruleId);
      const current = prev[ruleKey];
      if (!current) return prev;
      return {
        ...prev,
        [ruleKey]: {
          ...current,
          status: normalized,
          statusReason: "",
        },
      };
    });
  };

  const closeRuleEdit = (policyId, ruleId) => {
    const ruleKey = getRuleKey(policyId, ruleId);
    setRowEditDrafts((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, ruleKey)) return prev;
      const next = { ...prev };
      delete next[ruleKey];
      return next;
    });
  };

  const closeRuleEdits = (ruleKeys) => {
    if (!Array.isArray(ruleKeys) || !ruleKeys.length) return;
    setRowEditDrafts((prev) => {
      const next = { ...prev };
      let changed = false;
      ruleKeys.forEach((ruleKey) => {
        if (Object.prototype.hasOwnProperty.call(next, ruleKey)) {
          delete next[ruleKey];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  };

  const getAssignedBy = () => {
    const email =
      account?.email ||
      account?.user?.email ||
      account?.preferred_username ||
      account?.username ||
      "";
    const name =
      account?.name ||
      account?.displayName ||
      account?.user?.name ||
      [account?.firstName, account?.lastName].filter(Boolean).join(" ") ||
      "";
    return { email: String(email || ""), name: String(name || "") };
  };

  const applyBulkRuleUpdatesInData = (changesByRuleKey) => {
    if (!changesByRuleKey?.size) return;
    setData((prev) => ({
      ...prev,
      policy_rules: (prev.policy_rules || []).map((policy) => {
        let policyUpdated = false;
        const nextRules = (policy.rules || []).map((rule) => {
          const ruleKey = getRuleKey(policy.policy_id, rule.rule_id);
          const change = changesByRuleKey.get(ruleKey);
          if (!change) return rule;
          policyUpdated = true;
          return {
            ...rule,
            rule_status: change.next_status || null,
            status_reason: change.status_reason || null,
            rule_assigned_to: change.assigned_to_name ?? rule.rule_assigned_to,
            assigned_to_name: change.assigned_to_name,
            assigned_to_email: change.assigned_to_email || null,
          };
        });
        if (!policyUpdated) return policy;
        return {
          ...policy,
          rules: nextRules,
        };
      }),
    }));
  };

  const pendingRuleChanges = useMemo(() => {
    const pending = [];
    Object.entries(rowEditDrafts).forEach(([ruleKey, draft]) => {
      if (!draft?.isEditing) return;
      const policyId = draft.policyId;
      const ruleId = draft.ruleId;
      if (!policyId || !ruleId) return;

      const context = findRuleContext(policyId, ruleId);
      if (!context?.rule || !context?.policy) return;

      const { policy, rule } = context;
      const currentStatus = getRuleStatusValue(rule);
      const nextStatus = normalizeStatusLabel(draft.status || "");
      const currentStatusReason = String(getRuleStatusReason(rule) || "").trim();
      const nextStatusReason =
        nextStatus === ON_HOLD_STATUS ? String(draft.statusReason || "").trim() : "";
      const statusChanged =
        nextStatus !== currentStatus ||
        (nextStatus === ON_HOLD_STATUS && nextStatusReason !== currentStatusReason);

      const currentAssigneeEmail = String(getRuleAssignedTo(rule) || "").trim();
      const nextAssigneeEmail = String(draft.assignee || "").trim();
      const assigneeChanged = nextAssigneeEmail !== currentAssigneeEmail;

      if (!statusChanged && !assigneeChanged) return;

      const nextAssigneeOption = assigneeOptions.find(
        (option) => option.email === nextAssigneeEmail
      );
      const currentAssigneeName = String(getRuleAssigneeLabel(rule) || "").trim();
      const nextAssigneeName =
        nextAssigneeOption?.name ||
        (nextAssigneeEmail === currentAssigneeEmail ? currentAssigneeName : nextAssigneeEmail) ||
        null;

      pending.push({
        rule_key: ruleKey,
        policy_id: String(policyId),
        rule_id: String(ruleId),
        policy_name: policy.policy_name || String(policy.policy_id || ""),
        display_rule_id: rule?.updated_rule_id ?? rule?.rule_id,
        status_changed: statusChanged,
        assignee_changed: assigneeChanged,
        current_status: currentStatus,
        next_status: nextStatus || null,
        status_reason: nextStatus === ON_HOLD_STATUS ? nextStatusReason : null,
        current_assignee: currentAssigneeName || currentAssigneeEmail || "Unassigned",
        next_assignee: nextAssigneeName || "Unassigned",
        assigned_to_email: nextAssigneeEmail || null,
        assigned_to_name: nextAssigneeName,
      });
    });
    return pending;
  }, [assigneeOptions, findRuleContext, rowEditDrafts]);

  const openBulkSaveConfirm = () => {
    if (!pendingRuleChanges.length) return;
    const missingOnHoldReason = pendingRuleChanges.find(
      (change) =>
        change.status_changed &&
        change.next_status === ON_HOLD_STATUS &&
        !String(change.status_reason || "").trim()
    );

    if (missingOnHoldReason) {
      setToast({
        open: true,
        message: `Reason is mandatory when status is On hold. Rule ${missingOnHoldReason.display_rule_id}.`,
        severity: "warning",
      });
      return;
    }

    setModalState({
      type: "bulk_confirm",
      changes: pendingRuleChanges,
    });
  };

  const saveBulkEdits = async () => {
    if (!modalState || modalState.type !== "bulk_confirm") return;
    if (isSavingBulk) return;
    const pendingChanges = Array.isArray(modalState.changes) ? modalState.changes : [];
    if (!pendingChanges.length) {
      setModalState(null);
      return;
    }

    const userId = resolveUserId(account);
    const { email: assigned_by_email, name: assigned_by_name } = getAssignedBy();
    const payload = {
      updates: pendingChanges.map((change) => ({
        policy_id: change.policy_id,
        rule_id: change.rule_id,
        rule_status: change.next_status || null,
        status_reason: change.status_reason || null,
        assigned_to_email: change.assigned_to_email || null,
        assigned_to_name: change.assigned_to_name || null,
      })),
      assigned_by_email,
      assigned_by_name,
    };

    setIsSavingBulk(true);
    try {
      const response = await fetch(CONCEPT_DEVELOPMENT_API_ENDPOINTS.BULK_UPDATE_ASSIGNMENT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "user-id": userId || "",
        },
        body: JSON.stringify(payload),
      });

      let responseBody = null;
      try {
        responseBody = await response.json();
      } catch (_) {
        responseBody = null;
      }

      if (!response.ok) {
        const detail =
          responseBody?.message ||
          responseBody?.detail?.[0]?.msg ||
          response.statusText ||
          "Failed to save changes.";
        throw new Error(detail);
      }

      const results = Array.isArray(responseBody?.results) ? responseBody.results : [];
      const successRuleKeys = new Set();
      const failedRuleKeys = new Set();

      if (results.length) {
        results.forEach((result) => {
          const key = getRuleKey(result?.policy_id, result?.rule_id);
          if (result?.success) {
            successRuleKeys.add(key);
            return;
          }
          failedRuleKeys.add(key);
        });
      } else {
        pendingChanges.forEach((change) => {
          successRuleKeys.add(change.rule_key);
        });
      }

      const successfulChanges = pendingChanges.filter((change) => successRuleKeys.has(change.rule_key));
      const failedChanges = pendingChanges.filter((change) => failedRuleKeys.has(change.rule_key));
      const changesByRuleKey = new Map(
        successfulChanges.map((change) => [change.rule_key, change])
      );

      if (changesByRuleKey.size) {
        applyBulkRuleUpdatesInData(changesByRuleKey);
        closeRuleEdits([...changesByRuleKey.keys()]);
      }

      setModalState(null);
      if (failedChanges.length && successfulChanges.length) {
        setToast({
          open: true,
          message: `${successfulChanges.length} change(s) saved, ${failedChanges.length} failed.`,
          severity: "warning",
        });
      } else if (failedChanges.length) {
        setToast({
          open: true,
          message: `${failedChanges.length} change(s) failed to save.`,
          severity: "error",
        });
      } else {
        setToast({
          open: true,
          message: `${successfulChanges.length} change(s) saved.`,
          severity: "success",
        });
      }
    } catch (err) {
      console.error("[ConceptDevelopment] Bulk save failed", err);
      setToast({
        open: true,
        message: err?.message || "Failed to save changes.",
        severity: "error",
      });
    } finally {
      setIsSavingBulk(false);
    }
  };

  const applyOnHoldReason = () => {
    if (!modalState || modalState.type !== "on_hold_reason") return;
    const statusReason = String(modalState.status_reason || "").trim();
    if (!statusReason) {
      setToast({
        open: true,
        message: "Reason is mandatory when status is On hold.",
        severity: "warning",
      });
      return;
    }
    setRowEditDrafts((prev) => {
      const ruleKey = getRuleKey(modalState.policy_id, modalState.rule_id);
      const current = prev[ruleKey];
      if (!current) return prev;
      return {
        ...prev,
        [ruleKey]: {
          ...current,
          status: ON_HOLD_STATUS,
          statusReason,
        },
      };
    });
    setModalState(null);
  };

  const handleModalClose = () => {
    if (isSavingBulk) return;
    setModalState(null);
  };

  const hasPolicies = policiesWithGroupedRules.length > 0;
  const showActionsColumn = visibleColumns.assigned_to || visibleColumns.status;
  const tableColumnCount = getVisibleTableColumnCount(visibleColumns, showActionsColumn);
  const bulkConfirmChanges =
    modalState?.type === "bulk_confirm" ? modalState.changes || [] : [];
  const bulkStatusChangeCount = bulkConfirmChanges.filter((change) => change.status_changed).length;
  const bulkAssigneeChangeCount = bulkConfirmChanges.filter((change) => change.assignee_changed).length;
  const bulkOnHoldCount = bulkConfirmChanges.filter(
    (change) => change.next_status === ON_HOLD_STATUS
  ).length;
  const currentClientKey = String(client || "");
  const isDataForAnotherClient = Boolean(loadedClientKey) && loadedClientKey !== currentClientKey;
  const shouldHideTopSummary =
    isLoading && ((data.policy_rules || []).length === 0 || isDataForAnotherClient);
  const clearPolicyTableFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setExpanded(new Set());
  };
  const applyPolicyTableFilters = () => {
    setAppliedFilters({
      ...draftFilters,
      description: String(draftFilters.description || "").trim(),
    });
    setExpanded(new Set());
  };

  useEffect(() => {
    const trimmedDescription = String(draftFilters.description || "").trim();
    if (trimmedDescription === String(appliedFilters.description || "")) {
      return;
    }
    const debounceId = window.setTimeout(() => {
      if (!trimmedDescription) {
        setExpanded(new Set());
      }
      setAppliedFilters((prev) => ({ ...prev, description: trimmedDescription }));
    }, 350);
    return () => window.clearTimeout(debounceId);
  }, [draftFilters.description, appliedFilters.description]);

  useEffect(() => {
    if (descriptionSearchTerm) {
      wasDescriptionSearchActiveRef.current = true;
      setExpanded(
        new Set(
          policiesWithGroupedRules.map((policy) => policy.policy_id)
        )
      );
      return;
    }

    if (wasDescriptionSearchActiveRef.current) {
      setExpanded(new Set());
      wasDescriptionSearchActiveRef.current = false;
    }
  }, [descriptionSearchTerm, policiesWithGroupedRules]);

  return (
    <div className="main-tab-content page-padding active">
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleToastClose} severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
      <h1>Client Policy Insights</h1>
      <p>Analyze policies and rules to identify payment opportunities and compliance gaps.</p>

      {!shouldHideTopSummary ? (
        <>
          <div className="policy-filters-container">
            <div className="policy-filters-row">
          <div className="filter-group">
            <label htmlFor="state-filter">State_LOB:</label>
            <select
              id="state-filter"
              value={draftFilters.state}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, state: e.target.value }))}
              title={draftFilters.state || "All States"}
            >
              <option value="">All States</option>
              {stateOptions.map((option) => (
                <option key={option.key} value={option.value} title={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="policy-filter">Policy:</label>
            <select
              id="policy-filter"
              value={draftFilters.policyId}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, policyId: e.target.value }))}
              title={draftFilters.policyId || "Select Policy"}
            >
              <option value="">Select Policy</option>
              {policyOptions.map((option) => (
                <option key={option.key} value={option.value} title={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="rule-filter">Rule Category:</label>
            <select
              id="rule-filter"
              value={draftFilters.ruleCategory}
              onChange={(e) =>
                setDraftFilters((prev) => ({ ...prev, ruleCategory: e.target.value }))
              }
              title={draftFilters.ruleCategory || "All Rule Categories"}
            >
              <option value="">All Rule Categories</option>
              {ruleCategoryOptions.map((option) => (
                <option key={option.key} value={option.value} title={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="policy-filters-row">
          <div className="filter-group">
            <label htmlFor="assignedto-filter">Assigned To:</label>
            <select
              id="assignedto-filter"
              value={draftFilters.assignedTo}
              onChange={(e) =>
                setDraftFilters((prev) => ({ ...prev, assignedTo: e.target.value }))
              }
              title={draftFilters.assignedTo || "All"}
            >
              <option value="">All</option>
              {assignedToFilterOptions.map((option) => (
                <option key={option.key} value={option.value} title={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="status-table-filter">Status:</label>
            <select
              id="status-table-filter"
              value={draftFilters.status}
              onChange={(e) => setDraftFilters((prev) => ({ ...prev, status: e.target.value }))}
              title={draftFilters.status || "All"}
            >
              <option value="">All</option>
              {statusFilterOptions.map((option) => (
                <option key={option.key} value={option.value} title={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-actions">
            <button type="button" className="btn-filter-clear" onClick={clearPolicyTableFilters}>
              Clear
            </button>
            <button type="button" className="btn-filter-apply" onClick={applyPolicyTableFilters}>
              Apply
            </button>
          </div>
        </div>
          </div>
          <div className="kpi-cards">
            <div className="kpi-card">
              <div className="kpi-content">
                <span className="kpi-value">{summaryMetrics.no_of_policies}</span>
                <span className="kpi-label">Number of Policies</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-content">
                <span className="kpi-value">{summaryMetrics.no_of_rules}</span>
                <span className="kpi-label">Number of Rules</span>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {isLoading ? (
        <div className="loading-indicator" role="status" aria-live="polite">
          Loading policy insights...
        </div>
      ) : errorDetail ? (
        <div className="error-detail" role="alert">
          {"Error : " + errorDetail}
        </div>
      ) : showRuleDetails ? (
        <ConceptDevelopmentDetails
          onRuleBackClick={onRuleBackClick}
          selectedRuleContext={selectedRuleContext}
          setToast={setToast}
        />
      ) : hasPolicies || descriptionSearchTerm ? (
        <div
          className="policy-overview-section"
          id="policy-overview-section"
          style={{ display: "block" }}
        >
          <div className="overview-header">
            <div className="overview-header-text">
              <h2>Policy Rules Overview</h2>
              <p>
                Click on any rule to view detailed information including exceptions, limitations,
                and validation reports.
              </p>
            </div>
            <div className="overview-header-actions">
              <div className="description-search-inline">
                <input
                  id="description-filter"
                  type="text"
                  aria-label="Search description"
                  value={draftFilters.description}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Search description"
                />
                {draftFilters.description ? (
                  <button
                    type="button"
                    className="description-search-clear"
                    onClick={() => {
                      setExpanded(new Set());
                      setDraftFilters((prev) => ({ ...prev, description: "" }));
                      setAppliedFilters((prev) => ({ ...prev, description: "" }));
                    }}
                    aria-label="Clear description search"
                    title="Clear search"
                  >
                    ×
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                className="btn-save-status"
                onClick={openBulkSaveConfirm}
                disabled={!pendingRuleChanges.length || isSavingBulk}
              >
                Save Changes ({pendingRuleChanges.length})
              </button>
              <div className="column-selector-wrapper" ref={columnSelectorRef}>
                <button
                  type="button"
                  className="btn-column-selector"
                  onClick={() => setIsColumnSelectorOpen((prev) => !prev)}
                  aria-expanded={isColumnSelectorOpen}
                  aria-controls="column-selector-dropdown"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                  </svg>
                  Columns
                </button>
                <div
                  className={`column-selector-dropdown${isColumnSelectorOpen ? " open" : ""}`}
                  id="column-selector-dropdown"
                >
                  <div className="col-select-header">Toggle Columns</div>
                  {COLUMN_OPTIONS.map((column, index) => (
                    <label key={column.key}>
                      <input
                        type="checkbox"
                        checked={Boolean(visibleColumns[column.key])}
                        data-col-index={index + 1}
                        onChange={(e) => toggleColumnVisibility(column.key, e.target.checked)}
                      />
                      {column.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {hasPolicies ? (
            <div className="policy-rules-table">
              <table className="rules-overview-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}></th>

                    {visibleColumns.policy_rule ? (
                      <th>Policy/Rule</th>
                    ) : null}

                  {visibleColumns.rule_category ? (
                    <th>Rule Category</th>
                  ) : null}

                  {visibleColumns.description ? (
                    <th>Description</th>
                  ) : null}

                  {visibleColumns.state ? (
                    <th>State_LOB</th>
                  ) : null}

                  {visibleColumns.policy_status ? (
                    <th>Policy Status</th>
                  ) : null}

                  {visibleColumns.claim_type ? (
                    <th>Claim Type</th>
                  ) : null}

                  {visibleColumns.claims_in_scope ? <th>Claims in Scope</th> : null}

                  {visibleColumns.paid_amount_in_scope ? <th>Paid Amount in Scope</th> : null}

                  {visibleColumns.matching_concepts ? (
                    <th>Matching Concepts</th>
                  ) : null}

                  {visibleColumns.assigned_to ? (
                    <th>Assigned To</th>
                  ) : null}

                  {visibleColumns.status ? (
                    <th>Status</th>
                  ) : null}
                  {visibleColumns.status_reason ? (
                    <th>Status Reason</th>
                  ) : null}

                  {visibleColumns.review_document ? <th>Review Document</th> : null}
                  {showActionsColumn ? <th className="col-actions"></th> : null}
                  </tr>
                </thead>

                <tbody>
                  {policiesWithGroupedRules.map((p) => {
                  const isOpen = expanded.has(p.policy_id);
                  const controlledRegionId = `${p.policy_id}-rules-region`;
                  const rules = p.rules || [];
                  const policyClaimsInScope = getPolicyClaimsInScope(p);
                  const policyPaidAmountInScope = getPolicyPaidAmountInScope(p);
                  const policyStatus = getPolicyStatus(p);

                  return (
                    <React.Fragment key={p.policy_id}>
                      <tr
                        className="policy-header"
                        data-policy-name={p.policy_id}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isOpen}
                        aria-controls={controlledRegionId}
                        onClick={() => toggleExpand(p.policy_id)}
                        onKeyDown={(e) => handleRowKeyDown(e, p.policy_id)}
                        style={{ cursor: "pointer" }}
                        title={isOpen ? "Collapse" : "Expand"}
                      >
                        <td className="expand-btn">
                          <span className={`expand-icon ${isOpen ? "expanded" : ""}`}>
                            {isOpen ? "−" : "+"}
                          </span>
                        </td>
                        {visibleColumns.policy_rule ? (
                          <td>
                            <strong>{p.policy_name}</strong>
                          </td>
                        ) : null}
                        {visibleColumns.rule_category ? <td>{dashIfEmpty(p.rule_category)}</td> : null}
                        {visibleColumns.description ? (
                          <td className="description-cell" title={dashIfEmpty(p.policy_description)}>
                            {p.policy_description ? (
                              <span className="description-text">
                                {renderHighlightedDescription(p.policy_description, descriptionSearchTerm)}
                              </span>
                            ) : (
                              <em>{rules.length === 1 ? "1 rule" : `${rules.length} rules`}</em>
                            )}
                          </td>
                        ) : null}
                        {visibleColumns.state ? <td>{dashIfEmpty(p.state)}</td> : null}
                        {visibleColumns.policy_status ? <td>{policyStatus}</td> : null}
                        {visibleColumns.claim_type ? <td></td> : null}
                        {visibleColumns.claims_in_scope ? (
                          <td>{dashIfEmpty(policyClaimsInScope)}</td>
                        ) : null}
                        {visibleColumns.paid_amount_in_scope ? (
                          <td className="opportunity-amount">
                            {policyPaidAmountInScope !== null &&
                            policyPaidAmountInScope !== undefined
                              ? formatMoney(policyPaidAmountInScope)
                              : "-"}
                          </td>
                        ) : null}
                        {visibleColumns.matching_concepts ? (
                          <td>-</td>
                        ) : null}
                        {visibleColumns.assigned_to ? <td>{dashIfEmpty(p.assigned_to)}</td> : null}
                        {visibleColumns.status ? <td></td> : null}
                        {visibleColumns.status_reason ? <td>-</td> : null}
                        {visibleColumns.review_document ? <td>-</td> : null}
                        {showActionsColumn ? <td className="col-actions"></td> : null}
                      </tr>

                      {isOpen
                        ? p.ruleCategoryGroups.map((categoryGroup) => (
                            <React.Fragment key={categoryGroup.key}>
                              <tr className="rule-category-heading-row">
                                <td colSpan={tableColumnCount}>
                                  <span className="rule-category-heading-label">
                                    {categoryGroup.label}
                                  </span>
                                </td>
                              </tr>
                              {categoryGroup.rules.map((r) => {
                            const rowStatus = getCurrentStatus(p.policy_id, r);
                            const disableEdit =
                              isAcceptOrRejectStatus(rowStatus) &&
                              !EDIT_ALLOWED_USERS_FOR_ACCEPT_REJECT.has(currentUserEmail);
                            return (
                              <RuleRow
                                key={`${p.policy_id}-${r.rule_id}`}
                                rule={r}
                                policyStatus={policyStatus}
                                docUrl={r.review_document_url || ""}
                                controlledRegionId={controlledRegionId}
                                visibleColumns={visibleColumns}
                                availableAssignees={assigneeOptions}
                                currentStatus={rowStatus}
                                currentStatusReason={
                                  getRuleEditDraft(p.policy_id, r.rule_id)?.statusReason ??
                                  getCurrentStatusReason(p.policy_id, r)
                                }
                                isEditing={Boolean(getRuleEditDraft(p.policy_id, r.rule_id)?.isEditing)}
                                isSaving={isSavingBulk}
                                editStatus={
                                  getRuleEditDraft(p.policy_id, r.rule_id)?.status ??
                                  rowStatus
                                }
                                editAssignee={
                                  getRuleEditDraft(p.policy_id, r.rule_id)?.assignee ??
                                  getCurrentAssignee(p.policy_id, r)
                                }
                                onStatusDraftChange={(nextStatus) =>
                                  handleStatusDraftChange(p.policy_id, r.rule_id, nextStatus)
                                }
                                onAssigneeDraftChange={(nextAssignee) =>
                                  setRuleEditDraftField(p.policy_id, r.rule_id, "assignee", nextAssignee)
                                }
                                onStartEdit={() => startRuleEdit(p.policy_id, r)}
                                onCancelEdit={() => closeRuleEdit(p.policy_id, r.rule_id)}
                                onRuleClick={() => onRuleClick(p, r)}
                                onQidMetadataClick={openQidMetadataModal}
                                disableEdit={disableEdit}
                                descriptionSearchTerm={descriptionSearchTerm}
                              />
                            );
                              })}
                            </React.Fragment>
                          ))
                        : null}
                    </React.Fragment>
                  );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" role="status" aria-live="polite">
              <div className="empty-state-icon">i</div>
              <h3>No search results found</h3>
              <p>
                No search result found for &quot;{descriptionSearchTerm}&quot;
                {activeFilterSummary ? ` with applied filters: ${activeFilterSummary}.` : "."}
              </p>
              <p>Try to refine your search.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state" role="status" aria-live="polite">
          <div className="empty-state-icon">i</div>
          <h3>No policy insights available</h3>
          <p>We could not find policy rules for the selected filters.</p>
        </div>
      )}
      {modalState ? (
        <div
          className="confirm-modal-overlay visible"
          id="status-assignee-confirm-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="status-assignee-confirm-title"
        >
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            {modalState.type === "blocked_notice" ? (
              <>
                <h3 id="status-assignee-confirm-title">Status Update Restricted</h3>
                {modalState.blocked_status === BLOCKED_STATUS_OPTION ? (
                  <p>
                    The status will automatically change to <strong>Ready to Review</strong> once
                    the rule is finalized on the Rule Insights page.
                  </p>
                ) : (
                  <p>
                    {modalState.blocked_message ||
                      "The selected status update is restricted in this view."}
                  </p>
                )}
              </>
            ) : null}
            {modalState.type === "on_hold_reason" ? (
              <>
                <h3 id="status-assignee-confirm-title">Select On Hold Reason</h3>
                <div className="sub-reason-section" id="status-reason-section">
                  <label htmlFor="status-reason-select">
                    Reason <span style={{ color: "#c0392b" }}>*</span>
                  </label>
                  <select
                    className="sub-reason-select"
                    id="status-reason-select"
                    value={modalState.status_reason || ""}
                    onChange={(e) =>
                      setModalState((prev) => ({ ...prev, status_reason: e.target.value }))
                    }
                  >
                    <option value="">Select a reason...</option>
                    {ON_HOLD_REASON_OPTIONS.map((reasonOption) => (
                      <option key={reasonOption} value={reasonOption}>
                        {reasonOption}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}
            {modalState.type === "bulk_confirm" ? (
              <>
                <h3 id="status-assignee-confirm-title">Confirm Changes</h3>
                <div className="bulk-change-summary">
                  <span>Total: {bulkConfirmChanges.length}</span>
                  <span>Status: {bulkStatusChangeCount}</span>
                  <span>Assigned To: {bulkAssigneeChangeCount}</span>
                  <span>On hold: {bulkOnHoldCount}</span>
                </div>
                <div className="bulk-change-list">
                  <table className="bulk-change-table">
                    <thead>
                      <tr>
                        <th>Policy</th>
                        <th>Rule</th>
                        <th>Status Change</th>
                        <th>Assignee Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkConfirmChanges.map((change) => (
                        <tr key={`${change.policy_id}-${change.rule_id}`}>
                          <td title={change.policy_name}>{dashIfEmpty(change.policy_name)}</td>
                          <td>{dashIfEmpty(change.display_rule_id)}</td>
                          <td>
                            {change.status_changed ? (
                              <>
                                <span>{toStatusDisplayLabel(change.current_status || "Not started")}</span>
                                <span className="bulk-change-arrow"> to </span>
                                <span>{toStatusDisplayLabel(change.next_status || "Not started")}</span>
                                {change.next_status === ON_HOLD_STATUS && change.status_reason ? (
                                  <div className="bulk-change-reason" title={change.status_reason}>
                                    Reason: {change.status_reason}
                                  </div>
                                ) : null}
                              </>
                            ) : (
                              <span className="bulk-no-change">No change</span>
                            )}
                          </td>
                          <td>
                            {change.assignee_changed ? (
                              <>
                                <span>{change.current_assignee}</span>
                                <span className="bulk-change-arrow"> to </span>
                                <span>{change.next_assignee}</span>
                              </>
                            ) : (
                              <span className="bulk-no-change">No change</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              null
            )}
            {modalState.type === "qid_metadata" ? (
              <>
                <h3 id="status-assignee-confirm-title">QID Details</h3>
                <div className="qid-metadata-summary">
                  <span className="qid-metadata-label">QID</span>
                  <span>{dashIfEmpty(modalState.qid)}</span>
                </div>
                <div className="qid-metadata-fields">
                  <div className="qid-metadata-field">
                    <span className="qid-metadata-label">Type</span>
                    <span>{dashIfEmpty(modalState.metadata?.Type ?? modalState.metadata?.type)}</span>
                  </div>
                  <div className="qid-metadata-field">
                    <span className="qid-metadata-label">Title</span>
                    <span>{dashIfEmpty(modalState.metadata?.title)}</span>
                  </div>
                  <div className="qid-metadata-field">
                    <span className="qid-metadata-label">Query Description</span>
                    <span>{dashIfEmpty(modalState.metadata?.query_description)}</span>
                  </div>
                </div>
              </>
            ) : null}
            <div className="confirm-modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={handleModalClose}
                disabled={isSavingBulk}
              >
                {modalState.type === "blocked_notice"
                  ? "OK"
                  : modalState.type === "qid_metadata"
                    ? "Close"
                    : "Cancel"}
              </button>
              {modalState.type === "on_hold_reason" ? (
                <button
                  className="btn-modal-confirm"
                  onClick={applyOnHoldReason}
                >
                  Apply
                </button>
              ) : null}
              {modalState.type === "bulk_confirm" ? (
                <button
                  className="btn-modal-confirm"
                  onClick={saveBulkEdits}
                  disabled={isSavingBulk}
                >
                  {isSavingBulk ? "Saving..." : "Confirm"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ConceptDevelopment;
