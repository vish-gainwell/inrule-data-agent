const asArray = (value) => (Array.isArray(value) ? value : []);

export function normalizeGenerateQueriesResponse(payload) {
  const raw = payload && typeof payload === "object" ? payload : {};
  const steps = asArray(raw.queries).map((step) => {
    const queries = asArray(step?.queries).filter(
      (query) => typeof query === "string",
    );
    return {
      stepNumber: step?.step_number ?? step?.stepNumber ?? null,
      businessMeaning: step?.business_meaning ?? step?.businessMeaning ?? "",
      queries,
      matched: Boolean(step?.matched ?? queries.length > 0),
      raw: step,
    };
  });

  return {
    kind: "generated_queries",
    editId: raw.edit_id ?? raw.editId ?? "",
    steps,
    raw,
  };
}



export function normalizeGenerateSqlResponse(payload) {
  const raw = payload && typeof payload === "object" ? payload : {};
  const blockingErrors = asArray(raw.blocking_errors ?? raw.blockingErrors);
  const warnings = asArray(raw.warnings);
  const canGenerate = raw.canGenerate ?? raw.can_generate ?? false;
  const sql = raw.sql ?? raw.generated_sql ?? raw.generatedSql ?? null;

  return {
    kind: "sql",
    sql,
    canGenerate: Boolean(canGenerate),
    selectedTables: asArray(raw.selectedTables ?? raw.selected_tables),
    selectedColumns: asArray(raw.selectedColumns ?? raw.selected_columns),
    joinAssumptions: asArray(raw.joinAssumptions ?? raw.join_assumptions),
    warnings,
    blocking_errors: blockingErrors,
    confidence: raw.confidence ?? "low",
    reason: raw.reason ?? null,
    missing: asArray(raw.missing),
    nextAction: raw.nextAction ?? raw.next_action ?? null,
    raw,
  };
}

export function getTypedBackendMessage(payload, fallback) {
  const raw = payload && typeof payload === "object" ? payload : {};
  const nestedFinding = Array.isArray(raw.blocking_errors)
    ? raw.blocking_errors.find((finding) => finding?.code)
    : null;
  const code = raw.code || nestedFinding?.code || null;

  if (code === "NOT_IMPLEMENTED") {
    return "NL-to-SQL generation is coming in a later phase.";
  }

  if (code === "DB_UNAVAILABLE") {
    return "Query execution is unavailable because this environment has no database connectivity.";
  }

  if (code === "LLM_UNAVAILABLE") {
    return "NL-to-SQL generation is temporarily unavailable because the LLM gateway could not be reached.";
  }

  if (code === "SCHEMA_UNAVAILABLE") {
    return (
      nestedFinding?.message ||
      "Required schema is unavailable, so SQL generation is blocked."
    );
  }

  if (code === "NO_MATCHING_QUERY") {
    return (
      payload.message ||
      "No approved query matched. Routed to human governance."
    );
  }

  return fallback;
}
