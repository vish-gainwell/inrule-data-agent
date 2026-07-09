import { useState } from 'react';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import OpenInFullOutlinedIcon from '@mui/icons-material/OpenInFullOutlined';
import { IconButton, Popover, Tooltip } from '@mui/material';
import { format as sqlFormat } from 'sql-formatter';

import {
  formatInteger,
  formatSeconds,
  getMetricsPayload,
  getProcessingTime,
  toNumber,
} from './metricsUtils';

const QUERY_PREVIEW_LENGTH = 140;

const formatThresholdSeconds = (seconds) => formatSeconds(seconds);

const getSlowQueriesData = (payload) => {
  const slowQueriesRoot = payload?.slow_queries;

  if (Array.isArray(slowQueriesRoot)) {
    return {
      items: slowQueriesRoot,
      pagination: null,
    };
  }

  if (slowQueriesRoot && typeof slowQueriesRoot === 'object') {
    return {
      items: Array.isArray(slowQueriesRoot.items) ? slowQueriesRoot.items : [],
      pagination: slowQueriesRoot.pagination ?? null,
    };
  }

  return {
    items: [],
    pagination: null,
  };
};

const formatTimestamp = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const normalizeQuery = (query) => {
  const text = String(query || '').replace(/\s+/g, ' ').trim();
  if (!text) return '-';
  return text;
};

const formatUserId = (value) => {
  const text = String(value || '').trim();
  if (!text) return '-';
  return text.replace(/@gainwelltechnologies\.com$/i, '');
};

const formatQueryPreview = (query) => {
  if (query === '-' || query.length <= QUERY_PREVIEW_LENGTH) return query;
  return `${query.slice(0, QUERY_PREVIEW_LENGTH - 3)}...`;
};

const formatSqlQuery = (query) => {
  if (!query || query === '-') return '-';
  try {
    return sqlFormat(query, { language: 'tsql' });
  } catch (firstError) {
    const stripped = query
      .replace(/^\s*DECLARE\s+@[\s\S]*?;?\s*$/gim, '')
      .replace(/^\s*SET\s+@[\s\S]*?;?\s*$/gim, '')
      .replace(/^\s*GO\s*$/gim, '')
      .trim();

    try {
      return stripped ? sqlFormat(stripped, { language: 'tsql' }) : query;
    } catch (secondError) {
      return query;
    }
  }
};

const getDurationColor = (seconds) => {
  if (seconds >= 30) return '#b91c1c';
  if (seconds >= 15) return '#d46060';
  if (seconds >= 5) return '#a06400';
  return '#007cad';
};

const SlowQueryMonitoring = ({
  metricsResponse,
  loading,
  error,
  thresholdSeconds,
}) => {
  const [queryPopover, setQueryPopover] = useState({
    anchorEl: null,
    queryKey: '',
    queryText: '',
  });
  const [copiedQueryKey, setCopiedQueryKey] = useState('');
  const payload = getMetricsPayload(metricsResponse);
  const { items: slowQueries, pagination } = getSlowQueriesData(payload);
  const slowQueryCount = toNumber(
    payload?.summary?.slow_query_count ??
      payload?.slow_query_count ??
      pagination?.total_count ??
      pagination?.returned_count,
    slowQueries.length
  );
  const durations = slowQueries
    .map((query) => getProcessingTime(query))
    .filter((value) => Number.isFinite(value) && value >= 0);
  const avgDuration = durations.length
    ? durations.reduce((sum, value) => sum + value, 0) / durations.length
    : 0;
  const maxDuration = durations.length ? Math.max(...durations) : 0;
  const resolvedThresholdSeconds = toNumber(
    payload?.summary?.slow_threshold_seconds ??
      payload?.applied_filters?.slow_threshold_seconds,
    thresholdSeconds
  );
  const thresholdLabel = formatThresholdSeconds(resolvedThresholdSeconds);
  const formattedPopoverQuery = formatSqlQuery(queryPopover.queryText);

  const openQueryPopover = (event, queryKey, queryText) => {
    setQueryPopover({
      anchorEl: event.currentTarget,
      queryKey,
      queryText,
    });
  };

  const closeQueryPopover = () => {
    setQueryPopover({
      anchorEl: null,
      queryKey: '',
      queryText: '',
    });
  };

  const handleCopyQuery = async (queryKey, value) => {
    const text = value && value !== '-' ? String(value) : '';
    if (!text) return;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedQueryKey(queryKey);
        setTimeout(() => setCopiedQueryKey(''), 2000);
        return;
      } catch (err) {
        // fall back to execCommand
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopiedQueryKey(queryKey);
      setTimeout(() => setCopiedQueryKey(''), 2000);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="metrics-sub-content active">
      {loading && <div className="metrics-inline-status">Loading slow query metrics...</div>}
      {error && <div className="metrics-inline-status error">{error}</div>}

      <div className="metrics-enhancement-suite">
        <div className="metrics-kpi-row">
          <div className="metrics-kpi-card">
            <h4>Slow Queries Found</h4>
            <div className="metrics-kpi-big-value metrics-danger-text">
              {formatInteger(slowQueryCount)}
            </div>
            <p>Above {thresholdLabel} threshold</p>
          </div>
          <div className="metrics-kpi-card">
            <h4>Avg Duration (Slow)</h4>
            <div className="metrics-kpi-big-value">{formatSeconds(avgDuration)}</div>
            <p>Across flagged queries</p>
          </div>
          <div className="metrics-kpi-card">
            <h4>Max Duration</h4>
            <div className="metrics-kpi-big-value">{formatSeconds(maxDuration)}</div>
            <p>Worst-case execution time</p>
          </div>
        </div>

        <div className="metrics-errors">
          <h3>
            Flagged Queries <span>(above threshold)</span>
          </h3>
          <div className="metrics-table-scroll">
            <table className="metrics-error-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Session</th>
                  <th>Client</th>
                  <th>Query (trimmed)</th>
                  <th>Duration</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {slowQueries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="metrics-table-empty">
                      No slow queries found for the selected threshold.
                    </td>
                  </tr>
                ) : (
                  slowQueries.map((query, index) => {
                    const duration = getProcessingTime(query);
                    const queryKey =
                      query.metrics_op_id || `${query.session_id || 'query'}-${index}`;
                    const queryText = normalizeQuery(query.user_query || query.generated_sql);
                    return (
                      <tr key={queryKey}>
                        <td title={query.user_id || ''}>{formatUserId(query.user_id)}</td>
                        <td>{query.session_id || '-'}</td>
                        <td>{query.client || '-'}</td>
                        <td className="metrics-query-preview">
                          <div className="metrics-query-cell">
                            <span className="metrics-query-text">
                              {formatQueryPreview(queryText)}
                            </span>
                            {queryText !== '-' ? (
                              <Tooltip title="View formatted query">
                                <IconButton
                                  aria-label="View formatted query"
                                  className="metrics-query-popover-trigger"
                                  size="small"
                                  onClick={(event) => openQueryPopover(event, queryKey, queryText)}
                                >
                                  <OpenInFullOutlinedIcon fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                            ) : null}
                          </div>
                        </td>
                        <td
                          className="metrics-duration-cell"
                          style={{ color: getDurationColor(duration) }}
                        >
                          {formatSeconds(duration)}
                        </td>
                        <td>{formatTimestamp(query.timestamp)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Popover
            open={Boolean(queryPopover.anchorEl)}
            anchorEl={queryPopover.anchorEl}
            onClose={closeQueryPopover}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ className: 'metrics-query-popover' }}
          >
            <div className="metrics-query-popover-header">
              <h4>Formatted SQL</h4>
              <div className="metrics-query-popover-actions">
                <button
                  type="button"
                  className="metrics-query-copy-button"
                  onClick={() => handleCopyQuery(queryPopover.queryKey, formattedPopoverQuery)}
                >
                  <ContentCopyOutlinedIcon fontSize="inherit" />
                  {copiedQueryKey === queryPopover.queryKey ? 'Copied' : 'Copy'}
                </button>
                <Tooltip title="Close">
                  <IconButton
                    aria-label="Close formatted query"
                    className="metrics-query-close-button"
                    size="small"
                    onClick={closeQueryPopover}
                  >
                    <CloseOutlinedIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
            <pre className="metrics-query-popover-sql">{formattedPopoverQuery}</pre>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default SlowQueryMonitoring;
