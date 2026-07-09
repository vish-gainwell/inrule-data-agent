// Shared helper functions for Analyst page

export const nowIso = () => new Date().toISOString();

export const normalizeTitle = (text) => (text || '').trim().slice(0, 120);

export const createWelcomeMessage = (tenantName) => ({
  id: 1,
  role: 'system',
  user_query: null,
  generated_sql: null,
  execution_summary: null,
  content: `Welcome to GW AI Data Agent! I'm configured for the ${tenantName} client.`,
  timestamp: nowIso(),
});

export const normalizeSessionSummary = (s, index = 0) => {
  const rounds = Array.isArray(s.rounds)
    ? s.rounds
    : Array.isArray(s.messages)
      ? s.messages
      : [];

  const metaRounds = (s.metadata && s.metadata.rounds) || rounds;
  const safeRounds = Array.isArray(metaRounds) ? metaRounds : [];

  const lastRound =
    Array.isArray(safeRounds) && safeRounds.length
      ? safeRounds[safeRounds.length - 1]
      : null;

  return {
    id: s.session_id || s.id || `session-${index}`,
    session_id: s.session_id || s.id || null,
    tenant_id: s.tenant_id || s.tenant || null,
    user_id: s.user_id || s.user || null,
    created_at: s.created_at || s.started_at || s.timestamp || null,
    last_updated: s.last_updated || s.updated_at || null,
    last_query:
      s.last_query ||
      (s.metadata && s.metadata.last_query) ||
      (lastRound && lastRound.user_query) ||
      '',
    round_count: s.round_count || (Array.isArray(safeRounds) ? safeRounds.length : 0),
    raw: s,
  };
};

export const buildMessagesFromRounds = (rounds, tenantName) => {
  const msgs = [createWelcomeMessage(tenantName)];
  if (!Array.isArray(rounds)) return msgs;

  const toDisplayContent = (value) => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  rounds.forEach((r, idx) => {
    const baseTs = r.timestamp || nowIso();
    const baseId = Date.now() + idx * 10;

    if (r.user_query) {
      msgs.push({
        id: baseId,
        role: 'user',
        user_query: r.user_query,
        generated_sql: null,
        execution_summary: null,
        content: r.user_query,
        timestamp: baseTs,
        op_id: r.op_id,
      });
    }

    if (r.prompt_id != null) {
      msgs.push({
        id: baseId + 1,
        role: 'system',
        content: `Prompt ID: ${r.prompt_id}`,
        timestamp: baseTs,
      });
    }

    const sqlText = r.validate_sql || r.validated_sql || r.generated_sql;
    if (sqlText) {
      msgs.push({
        id: baseId + 2,
        role: 'system',
        user_query: r.user_query || null,
        generated_sql: sqlText,
        faithfulness_summary_reason: r.faithfulness_summary_reason || null,
        faithfulness_recommendation: r.faithfulness_recommendation || null,
        execution_summary: r.execution_summary || null,
        content: sqlText,
        isSql: true,
        timestamp: baseTs,
        op_id: r.op_id,
      });
    }

    if (r.preview_data) {
      msgs.push({
        id: baseId + 3,
        role: 'system',
        user_query: r.user_query || null,
        content: `Preview data:\n${toDisplayContent(r.preview_data)}`,
        timestamp: baseTs,
      });
    }

    if (r.execute_data) {
      msgs.push({
        id: baseId + 4,
        role: 'system',
        user_query: r.user_query || null,
        content: `Execute data:\n${toDisplayContent(r.execute_data)}`,
        op_id: r.op_id,
        timestamp: baseTs,
      });
    }

    if (r.error) {
      msgs.push({
        id: baseId + 5,
        role: 'system',
        isError: true,
        user_query: r.user_query || null,
        content: `Error: ${toDisplayContent(r.error)}`,
        timestamp: baseTs,
      });
    }

    if (r.execution_summary && !r.sql_result && !r.preview_data && !r.execute_data) {
      msgs.push({
        id: baseId + 6,
        role: 'system',
        user_query: r.user_query || null,
        generated_sql: sqlText || null,
        execution_summary: r.execution_summary,
        content: r.execution_summary.message || 'Execution summary available.',
        timestamp: baseTs,
      });
    }
  });

  return msgs;
};

export const isSessionDeleted = (session) => {
  const flag = session?.is_deleted;
  if (flag === true) return true;
  if (typeof flag === 'string') {
    const lowered = flag.toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(lowered)) return true;
  }
  if (typeof flag === 'number') {
    if (flag !== 0) return true;
  }
  const metaFlag = session?.metadata?.is_deleted;
  if (metaFlag === true) return true;
  if (typeof metaFlag === 'string') {
    const lowered = metaFlag.toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(lowered)) return true;
  }
  if (typeof metaFlag === 'number') {
    if (metaFlag !== 0) return true;
  }
  return false;
};

export const isSessionInactive = (session) => {
  const flag = session?.is_active;
  if (flag === false) return true;
  if (typeof flag === 'string') {
    const lowered = flag.toLowerCase();
    if (['false', '0', 'no', 'n'].includes(lowered)) return true;
  }
  if (typeof flag === 'number') {
    if (flag === 0) return true;
  }
  const metaFlag = session?.metadata?.is_active;
  if (metaFlag === false) return true;
  if (typeof metaFlag === 'string') {
    const lowered = metaFlag.toLowerCase();
    if (['false', '0', 'no', 'n'].includes(lowered)) return true;
  }
  if (typeof metaFlag === 'number') {
    if (metaFlag === 0) return true;
  }
  return false;
};

export const parseJsonSafe = (value, fallback = null) => {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const deriveRoundsFromOps = (ops) => {
  if (!Array.isArray(ops) || ops.length === 0) return [];

  const grouped = {};
  ops.forEach((op, idx) => {
    const key = op.op_id || op.sequence_id || `op-${idx}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(op);
  });

  const toMetadata = (op) => parseJsonSafe(op?.history_metadata, {});

  return Object.values(grouped).map((steps, idx) => {
    steps.sort((a, b) => (a.sequence_id || idx) - (b.sequence_id || idx));

    let userQuery = null;
    let promptId = null;
    let generatedSql = null;
    let validatedSql = null;
    let faithfulnessSummaryReason = null;
    let faithfulnessRecommendation = null;
    let executionSummary = null;
    let executeData = null;
    let previewData = null;
    let error = null;
    let ts = steps[0]?.start_at || steps[0]?.inserted_at || nowIso();
    let opId = steps[0]?.op_id || null; // ✅ Capture op_id

    steps.forEach((step) => {
      const meta = toMetadata(step);
      const action = (step.action || '').toLowerCase();

      if (action === 'userquery' || action === 'promptquery') {
        userQuery = meta.query_text || meta.user_query || meta.query || userQuery;
        ts = step.start_at || step.inserted_at || ts;
      }

      if (action === 'promptrun' || action === 'prompt' || action === 'prompt_run') {
        promptId = meta.prompt_id != null ? meta.prompt_id : promptId;
        // Some payloads only include query_text in the prompt run
        userQuery = meta.query_text || meta.user_query || userQuery;
      }

      if (action === 'responsequery') {
        generatedSql = meta.generated_sql || meta.validated_sql || meta.sql || generatedSql;
        validatedSql = meta.validated_sql || meta.generated_sql || validatedSql;
        faithfulnessSummaryReason =
          meta.faithfulness_summary_reason || faithfulnessSummaryReason;
        faithfulnessRecommendation =
          meta.faithfulness_recommendation || faithfulnessRecommendation;
        if (meta.error || meta.success === false) {
          error = meta.error || meta.validation_feedback || meta.message || error;
        }
      }

      if (action === 'responsetext' && meta.message) {
        executionSummary = { message: meta.message };
        if (meta.is_valid === false || meta.success === false) {
          error = meta.error || meta.message || error;
        }
      }

      if (action === 'responseexecutedata' || action === 'executequery' || action === 'execute') {
        executeData = meta.execute_data || meta.data || meta;
        if (meta.error) error = meta.error;
      }

      if (action === 'responsepreviewdata' || action === 'previewquery' || action === 'preview') {
        previewData = meta.preview_data || meta.data || meta;
        if (meta.error) error = meta.error;
      }
    });

    const toColumns = (payload) => {
      if (!payload) return null;
      if (Array.isArray(payload.columns)) return payload.columns;
      if (Array.isArray(payload.column_names)) return payload.column_names;
      return null;
    };

    const toRows = (payload) => {
      if (!payload) return null;
      if (Array.isArray(payload.rows)) return payload.rows;
      if (Array.isArray(payload.data)) return payload.data;
      return null;
    };

    const columns = toColumns(executeData) || toColumns(previewData) || null;
    const rows = toRows(executeData) || toRows(previewData) || null;

    return {
      op_id: opId,
      user_query: userQuery,
      // prompt_id: promptId,
      generated_sql: generatedSql,
      validated_sql: validatedSql || generatedSql,
      validate_sql: validatedSql || generatedSql,
      faithfulness_summary_reason: faithfulnessSummaryReason,
      faithfulness_recommendation: faithfulnessRecommendation,
      execute_data: executeData,
      preview_data: previewData,
      execution_summary: executionSummary,
      // sql_result: rows || null,
      // columns: columns || null,
      error,
      timestamp: ts,
    };
  });
};

export const deriveChatTitle = (lastQuery) => {
  if (!lastQuery) return undefined;
  const trimmed = lastQuery.trim();
  return trimmed ? trimmed.slice(0, 120) : undefined;
};


export const insertAfterLastOpId =(arr, opId, item) => {
  if (!Array.isArray(arr)) return [item];
  if (!opId) return [...arr, item];

  // Find last index with the same op_id (search from end)
  let lastIdx = -1;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] && arr[i].op_id === opId) {
      lastIdx = i;
      break;
    }
  }

  if (lastIdx === -1) {
    // No matching op_id — append
    return [...arr, item];
  }

  // Insert right after lastIdx
  const before = arr.slice(0, lastIdx + 1);
  const after = arr.slice(lastIdx + 1);
  return [...before, item, ...after];
}


export const buildExecutionMessage = (opts) => {
  const { rowsLength, lastSql, isPreview, opId, nowIso, resultsData } = opts;

  return {
    id: Date.now() + 3,
    role: 'system',
    user_query: null,
    generated_sql: lastSql,
    resultsData: resultsData,
    execution_summary: {
      rows_returned: rowsLength,
      mode: isPreview ? 'preview' : 'full',
    },
    content: isPreview
      ? `Preview executed (${rowsLength} rows).`
      : `Full query executed (${rowsLength} rows).`,
    timestamp: typeof nowIso === 'function' ? nowIso() : new Date().toISOString(),
    op_id: opId, // keep threading linkage
  };
}

