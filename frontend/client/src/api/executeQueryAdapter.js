const asArray = (value) => (Array.isArray(value) ? value : []);

export function buildExecuteQueryRequest({ sql, params } = {}) {
  if (typeof sql !== "string" || !sql.trim()) {
    throw new Error("SQL is required before executing a query.");
  }

  const normalizedParams =
    params && typeof params === "object" && !Array.isArray(params) ? params : {};

  return {
    sql,
    params: normalizedParams,
  };
}

export function normalizeExecuteQueryResponse(payload) {
  const raw = payload && typeof payload === "object" ? payload : {};
  const columns = asArray(raw.columns);
  const rows = Array.isArray(raw.rows) ? raw.rows : asArray(raw.sql_result);

  if (!Array.isArray(raw.columns) || !Array.isArray(rows)) {
    throw new Error("execute_query returned results in an unexpected format.");
  }

  return {
    columns,
    rows,
    rowCount: raw.row_count ?? raw.rowCount ?? rows.length,
    executionMs: raw.execution_ms ?? raw.executionMs ?? null,
    raw,
  };
}
