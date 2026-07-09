// src/api/sqlClient.js
import { API_ENDPOINTS } from "../config/apiConfig";
import {
  getTypedBackendMessage,
  normalizeGenerateQueriesResponse,
  normalizeGenerateSqlResponse,
} from "./queryParamsAdapter.js";

const parseJsonBody = (text) => {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const parseCriteriaAnalyzerJson = (criteriaJson) => {
  try {
    return JSON.parse(criteriaJson);
  } catch (error) {
    throw new Error(
      `Criteria Analyzer input must be valid JSON: ${error.message}`,
    );
  }
};

const validateGenerateQueriesPayload = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Criteria Analyzer JSON must be an object.");
  }

  if (typeof payload.edit_id !== "string" || !payload.edit_id.trim()) {
    throw new Error(
      'Criteria Analyzer JSON must include a non-empty "edit_id".',
    );
  }

  if (!Array.isArray(payload.steps)) {
    throw new Error('Criteria Analyzer JSON must include a "steps" array.');
  }

  return payload;
};

/**
 * Helper to call /generate_queries.
 * Input is the full Criteria Analyzer JSON: { edit_id, steps[] }.
 */
export async function generateQueries({ criteriaJson, payload }) {
  const body = validateGenerateQueriesPayload(
    payload ?? parseCriteriaAnalyzerJson(criteriaJson),
  );

  const resp = await fetch(API_ENDPOINTS.GENERATE_QUERIES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await resp.text();
  const data = parseJsonBody(text);

  if (!resp.ok) {
    const typedMessage = getTypedBackendMessage(data);
    throw new Error(
      typedMessage ||
        `GENERATE_QUERIES failed: HTTP ${resp.status} ${resp.statusText}`,
    );
  }

  return normalizeGenerateQueriesResponse(data);
}

/**
 * Legacy helper for the archived NL→SQL flow. Not used by the Data Agent demo.
 */
export async function generateSql({
  query,
  nlQuestion,
  environment = import.meta.env.VITE_VALIDATION_ENV || "prod",
  signal,
}) {
  const body = {
    nlQuestion: nlQuestion ?? query,
    environment,
  };

  const resp = await fetch(API_ENDPOINTS.GENERATE_SQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });

  const text = await resp.text();
  const data = parseJsonBody(text);

  if (!resp.ok) {
    const typedMessage = getTypedBackendMessage(data);
    throw new Error(
      typedMessage ||
        `GENERATE_SQL failed: HTTP ${resp.status} ${resp.statusText}`,
    );
  }

  return normalizeGenerateSqlResponse(data);
}



export async function executeSql({
  sqlQuery,
  userId,
  tenantId,
  isPreview,
  dbSessionId,
  sessionId,
}) {
  const body = {
    query: sqlQuery,
    user_id: userId,
    is_preview: isPreview,
  };

  if (dbSessionId) body.db_session_id = dbSessionId;

  const resp = await fetch(API_ENDPOINTS.EXECUTE_SQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      "X-Tenant-Id": tenantId,
      "X-User-Id": userId,
      ...(sessionId ? { "X-Session-ID": sessionId } : {}),
    },
    body: JSON.stringify(body),
  });

  const text = await resp.text();

  if (!resp.ok) {
    throw new Error(
      `EXECUTE_SQL failed: HTTP ${resp.status} ${resp.statusText} – ${text}`,
    );
  }

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error(`EXECUTE_SQL: invalid JSON response – ${e.message}`);
  }

  return data;
}
