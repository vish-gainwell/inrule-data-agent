export const MODE_OPTIONS = [
  { value: 'ALL', label: 'All modes' },
  { value: 'generate', label: 'Generate query' },
  { value: 'execute', label: 'Execute query' },
  { value: 'preview', label: 'Preview' },
];

export const DATE_RANGE_OPTIONS = [
  { value: '', label: 'Select range' },
  { value: '1d', label: 'Last 1 Day' },
  { value: '1w', label: 'Last 1 Week' },
  { value: '1m', label: 'Last Month' },
  { value: 'custom', label: 'Custom' },
];

export const MODE_LABELS = {
  generate: 'Generate Query',
  execute: 'Execute Query',
  preview: 'Preview',
};

export const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const formatInteger = (value) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(toNumber(value));

export const formatDecimal = (value, digits = 2) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(toNumber(value));

export const formatSeconds = (value, digits = 1) => `${formatDecimal(value, digits)} sec`;

export const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDateRangeValues = (range) => {
  const today = new Date();
  const start = new Date(today);
  let relative_count = null;
  let relative_unit = null;

  if (range === '1d') {
    start.setDate(today.getDate() - 1);
    relative_count = 1;
    relative_unit = 'days';
  } else if (range === '1w') {
    start.setDate(today.getDate() - 7);
    relative_count = 1;
    relative_unit = 'weeks';
  } else if (range === '1m') {
    start.setMonth(today.getMonth() - 1);
    relative_count = 1;
    relative_unit = 'months';
  } else {
    return { start_date: '', end_date: '', relative_count, relative_unit };
  }

  return {
    start_date: formatDateInput(start),
    end_date: formatDateInput(today),
    relative_count,
    relative_unit,
  };
};

const normalizeOption = (item, fallbackPrefix) => {
  if (item === null || item === undefined) return null;
  if (typeof item !== 'object') {
    const value = String(item).trim();
    return value ? { value, label: value } : null;
  }

  const value = String(
    item.value ??
      item.id ??
      item.client ??
      item.client_id ??
      item.user_id ??
      item.userId ??
      item.email ??
      item.username ??
      ''
  ).trim();

  if (!value) return null;

  const label = String(
    item.label ??
      item.name ??
      item.display_name ??
      item.displayName ??
      item.client_name ??
      item.user_name ??
      item.email ??
      value
  ).trim();

  return { value, label: label || `${fallbackPrefix} ${value}` };
};

const uniqueOptions = (options) => {
  const seen = new Set();
  return options.filter((option) => {
    const key = option.value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const normalizeFilterOptions = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const filters = root.filters ?? root.filter_options ?? root.options ?? root;
  const clientsSource = filters.clients ?? filters.client_options ?? root.clients ?? [];
  const usersSource = filters.users ?? filters.user_options ?? root.users ?? [];

  const clients = uniqueOptions(
    (Array.isArray(clientsSource) ? clientsSource : [])
      .map((item) => normalizeOption(item, 'Client'))
      .filter(Boolean)
  );

  const users = uniqueOptions(
    (Array.isArray(usersSource) ? usersSource : [])
      .map((item) => normalizeOption(item, 'User'))
      .filter(Boolean)
  );

  return { clients, users };
};

const hasMetricsShape = (value) =>
  value &&
  typeof value === 'object' &&
  (
    Array.isArray(value.records) ||
    Array.isArray(value.daily_trends) ||
    Array.isArray(value.error_observability) ||
    value.summary ||
    value.filters
  );

export const getMetricsPayload = (response) => {
  const root = response ?? {};
  if (hasMetricsShape(root)) return root;
  if (hasMetricsShape(root.data)) return root.data;
  if (hasMetricsShape(root.data?.data)) return root.data.data;
  return root.data ?? root;
};

export const getMetricsRecords = (response) => {
  const payload = getMetricsPayload(response);
  if (Array.isArray(payload.records)) return payload.records;
  if (Array.isArray(payload.metric_records)) return payload.metric_records;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

export const normalizeMode = (mode) => {
  const value = String(mode || '').toLowerCase();
  if (value.includes('generate')) return 'generate';
  if (value.includes('execute')) return 'execute';
  if (value.includes('preview')) return 'preview';
  return value;
};

export const isSuccessStatus = (status) => {
  const value = String(status || '').toLowerCase();
  if (!value) return false;
  return (
    value.includes('success') ||
    value.includes('completed') ||
    value === 'ok' ||
    value === 'healthy'
  );
};

export const getProcessingTime = (record) =>
  toNumber(record?.processing_time ?? record?.execute_processing_time, null);

const firstNumber = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

export const calculateTimeStats = (records, summary = {}) => {
  const minFromSummary = firstNumber(
    summary.min_processing_time,
    summary.processing_time_min,
    summary.min_execute_processing_time,
    summary.min_duration_seconds
  );
  const avgFromSummary = firstNumber(
    summary.avg_processing_time,
    summary.average_processing_time,
    summary.processing_time_avg,
    summary.avg_execute_processing_time,
    summary.avg_duration_seconds
  );
  const maxFromSummary = firstNumber(
    summary.max_processing_time,
    summary.processing_time_max,
    summary.max_execute_processing_time,
    summary.max_duration_seconds
  );

  if (
    minFromSummary !== null ||
    avgFromSummary !== null ||
    maxFromSummary !== null
  ) {
    return {
      min: toNumber(minFromSummary),
      avg: toNumber(avgFromSummary),
      max: toNumber(maxFromSummary),
    };
  }

  const values = records
    .map(getProcessingTime)
    .filter((value) => Number.isFinite(value) && value >= 0);

  if (values.length === 0) return { min: 0, avg: 0, max: 0 };

  const sum = values.reduce((total, value) => total + value, 0);
  return {
    min: Math.min(...values),
    avg: sum / values.length,
    max: Math.max(...values),
  };
};

export const calculateRequestStats = (records, summary = {}) => {
  const totalFromSummary = firstNumber(
    summary.total_requests,
    summary.request_count,
    summary.total_count,
    summary.questions_asked,
    summary.total_questions
  );
  const successFromSummary = firstNumber(
    summary.success_count,
    summary.successful_requests,
    summary.success_requests,
    summary.completed_count
  );
  const failedFromSummary = firstNumber(
    summary.failed_count,
    summary.failure_count,
    summary.failed_requests,
    summary.error_count,
    summary.errors
  );

  if (
    totalFromSummary !== null ||
    successFromSummary !== null ||
    failedFromSummary !== null
  ) {
    const success = toNumber(successFromSummary);
    const failed = toNumber(
      failedFromSummary,
      Math.max(toNumber(totalFromSummary) - success, 0)
    );
    const total = toNumber(totalFromSummary, success + failed);
    const successPct = total ? (success / total) * 100 : 0;
    const failedPct = total ? (failed / total) * 100 : 0;

    return { total, success, failed, successPct, failedPct };
  }

  const total = records.length;
  const success = records.filter((record) => isSuccessStatus(record.execution_status)).length;
  const failed = Math.max(total - success, 0);
  const successPct = total ? (success / total) * 100 : 0;
  const failedPct = total ? (failed / total) * 100 : 0;

  return { total, success, failed, successPct, failedPct };
};

export const calculateTokenStats = (payload, records) => {
  const summary = payload?.summary ?? payload?.token_summary ?? {};
  const input = toNumber(
    summary.input_tokens ??
      summary.total_input_tokens ??
      summary.prompt_tokens ??
      records.reduce((sum, record) => sum + toNumber(record.input_tokens), 0)
  );
  const output = toNumber(
    summary.output_tokens ??
      summary.total_output_tokens ??
      summary.completion_tokens ??
      records.reduce((sum, record) => sum + toNumber(record.output_tokens), 0)
  );
  const total = toNumber(summary.total_tokens, input + output);
  const inputPct = total ? (input / total) * 100 : 0;
  const outputPct = total ? (output / total) * 100 : 0;

  return { input, output, total, inputPct, outputPct };
};

export const normalizeTrendDate = (value) => {
  if (!value) return '';
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  return text.slice(0, 10);
};

export const buildDailyTrends = (payload, records) => {
  if (Array.isArray(payload?.daily_trends) && payload.daily_trends.length > 0) {
    return payload.daily_trends.map((item) => ({
      date: normalizeTrendDate(item.day_bucket ?? item.date ?? item.date_only),
      questions: toNumber(item.questions_asked ?? item.total_requests ?? item.requests),
      errors: toNumber(item.errors ?? item.error_count ?? item.failed_requests),
      tokens: toNumber(item.total_tokens ?? item.tokens),
    }));
  }

  const byDate = new Map();
  records.forEach((record) => {
    const date = record.date_only || String(record.timestamp || '').slice(0, 10);
    if (!date) return;
    const current = byDate.get(date) || { date, questions: 0, errors: 0, tokens: 0 };
    current.questions += 1;
    if (!isSuccessStatus(record.execution_status)) current.errors += 1;
    current.tokens += toNumber(record.input_tokens) + toNumber(record.output_tokens);
    byDate.set(date, current);
  });

  return Array.from(byDate.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));
};

export const buildErrorRows = (payload, records) => {
  if (Array.isArray(payload?.error_observability) && payload.error_observability.length > 0) {
    return payload.error_observability.map((item, index) => ({
      id: `${item.error_type || item.error_reason || item.error_message || 'error'}-${index}`,
      type: item.error_type ?? item.type ?? 'Error',
      message: item.error_reason ?? item.error_message ?? item.message ?? '-',
      count: toNumber(item.count ?? item.error_count, 1),
      lastSeen: item.last_seen ?? item.latest_timestamp ?? item.timestamp ?? '-',
    }));
  }

  const grouped = new Map();
  records.forEach((record) => {
    const message = String(record.error_message || '').trim();
    if (!message) return;
    const key = message.toLowerCase();
    const current = grouped.get(key) || {
      id: key,
      type: record.error_type || 'Execution',
      message,
      count: 0,
      lastSeen: '-',
    };
    current.count += 1;
    current.lastSeen = record.timestamp || current.lastSeen;
    grouped.set(key, current);
  });

  return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
};

const getModeBreakdown = (payload) => {
  const source =
    payload?.mode_breakdown ??
    payload?.mode_metrics ??
    payload?.summary?.mode_breakdown ??
    payload?.summary?.mode_metrics;

  if (Array.isArray(source)) return source;

  if (source && typeof source === 'object') {
    return Object.entries(source).map(([mode, summary]) => ({
      mode,
      ...(summary && typeof summary === 'object' ? summary : { total_requests: summary }),
    }));
  }

  return [];
};

export const buildMetricsViewModel = (response) => {
  const payload = getMetricsPayload(response);
  const records = getMetricsRecords(response);
  const summary = payload?.summary ?? {};
  const requestStats = calculateRequestStats(records, summary);
  const tokenStats = calculateTokenStats(payload, records);
  const trends = buildDailyTrends(payload, records);
  const errors = buildErrorRows(payload, records);
  const modeBreakdown = getModeBreakdown(payload);

  const modes = ['generate', 'execute', 'preview'].map((mode) => {
    const modeSummary = modeBreakdown.find(
      (item) => normalizeMode(item.mode ?? item.label ?? item.name) === mode
    );
    const modeRecords = records.filter((record) => normalizeMode(record.mode) === mode);
    return {
      mode,
      label: MODE_LABELS[mode],
      requestStats: calculateRequestStats(modeRecords, modeSummary ?? {}),
      timeStats: calculateTimeStats(modeRecords, modeSummary ?? {}),
    };
  });

  return {
    payload,
    records,
    requestStats,
    timeStats: calculateTimeStats(records, summary),
    tokenStats,
    trends,
    errors,
    modes,
  };
};
