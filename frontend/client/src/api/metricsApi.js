import { CD_DASHBOARD_API_ENDPOINTS, METRICS_API_ENDPOINTS } from '../config/apiConfig';
import { buildUrl, parseJsonResponse } from '../utils/apiUtils';

const parseApiError = (status, statusText, payload, raw) => {
  if (Array.isArray(payload?.detail)) {
    return payload.detail
      .map((item) => {
        const field = Array.isArray(item?.loc) ? item.loc.join('.') : item?.loc;
        return [field, item?.msg].filter(Boolean).join(': ');
      })
      .filter(Boolean)
      .join('; ');
  }

  return payload?.message || payload?.detail || raw || `HTTP ${status} ${statusText}`;
};

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const raw = await response.text();
  const data = parseJsonResponse(raw, raw ? { raw } : {});

  if (!response.ok) {
    const error = new Error(parseApiError(response.status, response.statusText, data, raw));
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return data;
}

export function fetchMetricsFilterOptions(options = {}) {
  return requestJson(METRICS_API_ENDPOINTS.FILTER_OPTIONS, options);
}

export function fetchMetrics(params = {}, options = {}) {
  const url = buildUrl(METRICS_API_ENDPOINTS.METRICS, params);
  return requestJson(url, options);
}

export function fetchMetricsOverview(params = {}, options = {}) {
  const url = buildUrl(METRICS_API_ENDPOINTS.OVERVIEW, params);
  return requestJson(url, options);
}

export function fetchMetricsAnalysis(params = {}, options = {}) {
  const url = buildUrl(METRICS_API_ENDPOINTS.ANALYSIS, params);
  return requestJson(url, options);
}

export function fetchSystemHealth(options = {}) {
  return requestJson(METRICS_API_ENDPOINTS.HEALTH, options);
}

export function fetchCdDashboardFilterOptions(params = {}, options = {}) {
  const url = buildUrl(CD_DASHBOARD_API_ENDPOINTS.FILTER_OPTIONS, params);
  return requestJson(url, options);
}

export function fetchCdDashboardOverview(params = {}, options = {}) {
  const url = buildUrl(CD_DASHBOARD_API_ENDPOINTS.OVERVIEW, params);
  return requestJson(url, options);
}

export function fetchCdDashboardFeedbackWordCloud(params = {}, options = {}) {
  const url = buildUrl(CD_DASHBOARD_API_ENDPOINTS.FEEDBACK_WORD_CLOUD, params);
  return requestJson(url, options);
}

export function fetchCdDashboardRules(params = {}, options = {}) {
  const url = buildUrl(CD_DASHBOARD_API_ENDPOINTS.RULES, params);
  return requestJson(url, options);
}

export function fetchCdDashboardClientPolicies(clientId, params = {}, options = {}) {
  const url = buildUrl(CD_DASHBOARD_API_ENDPOINTS.CLIENT_POLICIES(clientId), params);
  return requestJson(url, options);
}

export function fetchCdDashboardRuleHistory(ruleId, params = {}, options = {}) {
  const url = buildUrl(CD_DASHBOARD_API_ENDPOINTS.RULE_HISTORY(ruleId), params);
  return requestJson(url, options);
}
