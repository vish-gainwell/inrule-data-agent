const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const API_ENDPOINTS = {
  BASE_URL: API_BASE,
  ADD_USER: `${API_BASE}/users`,
  GENERATE_SQL: `${API_BASE}/generate_query`,
  GENERATE_QUERIES: `${API_BASE}/generate_queries`,
  EXECUTE_SQL: `${API_BASE}/execute_query`,
  CANCEL_SQL: `${API_BASE}/cancel_query`,
  QUERY_ANALYZER: `${API_BASE}/query_analyzer`,
  REPHRASE_QUERY: `${API_BASE}/rephrase_query`,
  HITL_RESPOND: `${API_BASE}/hitl/respond`,
  PROMPTS: `${API_BASE}/prompts`,
  FAVORITE_PROMPTS_SAVE: `${API_BASE}/favorite_prompts/save`,
  FAVORITE_PROMPTS_DELETE: `${API_BASE}/favorite_prompts/delete`,
  NEW_SESSION: `${API_BASE}/new_session`,
  UPDATE_SESSION: `${API_BASE}/update_session`,
  CHAT_HISTORY: `${API_BASE}/session_list`,
  SESSION_DATA: `${API_BASE}/get_session`,
  TENANT_METADATA: `${API_BASE}/api/tenant-metadata`,
  TENANT_METADATA_ALL: `${API_BASE}/api/tenant-metadata/all`,
};

export const CONCEPT_DEVELOPMENT_API_ENDPOINTS = {
  BASE_URL: API_BASE,
  GET_INSIGHTS_TEMPLATE: `${API_BASE}/clients/{client_id}/policyrules/summaryinsights`,
  UPDATE_ASSIGNMENT: `${API_BASE}/policyrules/assignment/update`,
  BULK_UPDATE_ASSIGNMENT: `${API_BASE}/policyrules/assignment/bulk-update`,
  UPDATE_RULE_INSIGHT_QUERY: `${API_BASE}/policyruleinsights/finalquery/update`,
  SUBMIT_RULE_FEEDBACK: `${API_BASE}/policyruleinsights/feedback/submit`,
  RETURN_TO_REVIEW: `${API_BASE}/policyruleinsights/return-to-review`,
  POLICY_FILE_PRESIGNED_URL: `${API_BASE}/policy-files/presigned-url`,
  NOTES_GET_ALL: `${API_BASE}/notes/get-all`,
  NOTES_ADD: `${API_BASE}/notes/add`,
  NOTES_UPDATE: `${API_BASE}/notes/update`,
  NOTES_DELETE: `${API_BASE}/notes/delete`,
  QTS_RULES: `${API_BASE}/api/qts/rules`,
};

export const METRICS_API_ENDPOINTS = {
  BASE_URL: API_BASE,
  FILTER_OPTIONS: `${API_BASE}/metrics/filter_options`,
  METRICS: `${API_BASE}/metrics`,
  OVERVIEW: `${API_BASE}/metrics/overview`,
  ANALYSIS: `${API_BASE}/metrics/analysis`,
  HEALTH: `${API_BASE}/health`,
};

export const CD_DASHBOARD_API_ENDPOINTS = {
  BASE_URL: API_BASE,
  FILTER_OPTIONS: `${API_BASE}/cd-dashboard/filter-options`,
  OVERVIEW: `${API_BASE}/cd-dashboard/overview`,
  FEEDBACK_WORD_CLOUD: `${API_BASE}/cd-dashboard/feedback-insights`,
  RULES: `${API_BASE}/cd-dashboard/rules`,
  CLIENT_POLICIES: (clientId) =>
    `${API_BASE}/cd-dashboard/clients/${encodeURIComponent(clientId ?? "")}/policies`,
  RULE_HISTORY: (ruleId) =>
    `${API_BASE}/cd-dashboard/rules/${encodeURIComponent(ruleId ?? "")}/history`,
};

export const normalizeClientId = (clientId) =>
  String(clientId ?? "")
    .trim()
    .replace(/\s+/g, "~");

export const getConceptDevelopmentInsightsUrl = (clientId, userId) => {
  const encodedClientId = encodeURIComponent(normalizeClientId(clientId));
  const encodedUserId = encodeURIComponent(userId || DEFAULT_USER_ID);
  return `${API_BASE}/clients/${encodedClientId}/policyrules/summaryinsights?user_id=${encodedUserId}`;
};

export const getConceptDevelopmentRuleDetailsUrl = (
  clientId,
  policyId,
  ruleId,
  userId,
) => {
  const encodedClientId = encodeURIComponent(normalizeClientId(clientId));
  const encodedPolicyId = encodeURIComponent(policyId ?? "");
  const encodedRuleId = encodeURIComponent(ruleId ?? "");
  const encodedUserId = encodeURIComponent(userId || DEFAULT_USER_ID);
  return `${API_BASE}/clients/${encodedClientId}/policies/${encodedPolicyId}/rule/${encodedRuleId}/details?user_id=${encodedUserId}`;
};

export const getConceptDevelopmentRuleInsightsUrl = (
  clientId,
  policyId,
  ruleId,
  userId,
) => {
  const encodedClientId = encodeURIComponent(normalizeClientId(clientId));
  const encodedPolicyId = encodeURIComponent(policyId ?? "");
  const encodedRuleId = encodeURIComponent(ruleId ?? "");
  const encodedUserId = encodeURIComponent(userId || DEFAULT_USER_ID);
  return `${API_BASE}/clients/${encodedClientId}/policies/${encodedPolicyId}/rules/${encodedRuleId}/insights?user_id=${encodedUserId}`;
};

export const MASTER_QUERY_API_ENDPOINTS = {
  BASE_URL: API_BASE,
  QUERIES: `${API_BASE}/master_queries`,
};

export const getMasterQueriesUrl = (clientId) => {
  const params = new URLSearchParams();
  if (clientId) {
    params.set("client", normalizeClientId(clientId));
  }
  const queryString = params.toString();
  return `${API_BASE}/master_queries${queryString ? `?${queryString}` : ""}`;
};

export const getMasterQueryDetailsUrl = (id, clientId) => {
  const params = new URLSearchParams();
  if (clientId) {
    params.set("client", normalizeClientId(clientId));
  }
  const queryString = params.toString();
  return `${API_BASE}/master_queries/${encodeURIComponent(id ?? "")}/details${
    queryString ? `?${queryString}` : ""
  }`;
};

export const getMasterQueryAssignmentUrl = (id, clientId) => {
  const params = new URLSearchParams();
  if (clientId) {
    params.set("client", normalizeClientId(clientId));
  }
  const queryString = params.toString();
  return `${API_BASE}/master_queries/${encodeURIComponent(id ?? "")}/assignment${
    queryString ? `?${queryString}` : ""
  }`;
};

export const getMasterQueryStatusUrl = (id, clientId) => {
  const params = new URLSearchParams();
  if (clientId) {
    params.set("client", normalizeClientId(clientId));
  }
  const queryString = params.toString();
  return `${API_BASE}/master_queries/${encodeURIComponent(id ?? "")}/status${
    queryString ? `?${queryString}` : ""
  }`;
};

export const getMasterQueryInsightsUrl = (id, clientId) => {
  const params = new URLSearchParams();
  if (clientId) {
    params.set("client", normalizeClientId(clientId));
  }
  const queryString = params.toString();
  return `${API_BASE}/master_queries/${encodeURIComponent(id ?? "")}/insights${
    queryString ? `?${queryString}` : ""
  }`;
};

export const getMasterQueryGenerateQueryUrl = (id, clientId) => {
  const params = new URLSearchParams();
  if (clientId) {
    params.set("client", normalizeClientId(clientId));
  }
  const queryString = params.toString();
  return `${API_BASE}/master_queries/${encodeURIComponent(id ?? "")}/generate-query${
    queryString ? `?${queryString}` : ""
  }`;
};

export const getMasterQueryRegenerateQueryUrl = (id, clientId) => {
  const params = new URLSearchParams();
  if (clientId) {
    params.set("client", normalizeClientId(clientId));
  }
  const queryString = params.toString();
  return `${API_BASE}/master_queries/${encodeURIComponent(id ?? "")}/regenerate-query${
    queryString ? `?${queryString}` : ""
  }`;
};

export const getMasterQueryFinalizeQueryUrl = (id, clientId) => {
  const params = new URLSearchParams();
  if (clientId) {
    params.set("client", normalizeClientId(clientId));
  }
  const queryString = params.toString();
  return `${API_BASE}/master_queries/${encodeURIComponent(id ?? "")}/finalize-query${
    queryString ? `?${queryString}` : ""
  }`;
};

export const getMasterQueryNotesUrl = (id, clientId) => {
  const params = new URLSearchParams();
  if (clientId) {
    params.set("client", normalizeClientId(clientId));
  }
  const queryString = params.toString();
  return `${API_BASE}/master_queries/${encodeURIComponent(id ?? "")}/notes${
    queryString ? `?${queryString}` : ""
  }`;
};

export const getMasterQueryNoteUrl = (id, noteId, clientId) => {
  const params = new URLSearchParams();
  if (clientId) {
    params.set("client", normalizeClientId(clientId));
  }
  const queryString = params.toString();
  return `${API_BASE}/master_queries/${encodeURIComponent(id ?? "")}/notes/${encodeURIComponent(
    noteId ?? "",
  )}${queryString ? `?${queryString}` : ""}`;
};

const DEFAULT_TENANT_FALLBACK = import.meta.env.VITE_DEFAULT_TENANT_ID || "";
const DEFAULT_USER_FALLBACK = import.meta.env.VITE_DEFAULT_USER_ID || "";

export const resolveUserId = (
  authAccount,
  fallback = DEFAULT_USER_FALLBACK,
) => {
  if (authAccount?.username) return authAccount.username;
  if (authAccount?.name) return authAccount.name;
  return fallback;
};

export const getConceptDevelopmentRuleDataProfileUrl = (
  clientId,
  ruleId,
  claimType = "ALL",
  lineOfBusiness = "__DEFAULT__",
) => {
  const encodedClientId = encodeURIComponent(normalizeClientId(clientId));
  const encodedRuleId = encodeURIComponent(ruleId ?? "");
  const params = new URLSearchParams({
    claim_type: claimType || "ALL",
    line_of_business: lineOfBusiness || "__DEFAULT__",
  });
  return `${API_BASE}/clients/${encodedClientId}/rules/${encodedRuleId}/data-profile?${params.toString()}`;
};

export const resolveTenantId = (
  selectedTenant,
  fallback = DEFAULT_TENANT_FALLBACK,
) => selectedTenant || fallback;

export const DEFAULT_TENANT_ID = resolveTenantId();
export const DEFAULT_USER_ID = resolveUserId();
