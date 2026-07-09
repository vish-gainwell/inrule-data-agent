import { formatDecimal, formatInteger } from './metricsUtils';

export const SuccessFailureBar = ({ successPct, failedPct, success, failed }) => {
  const safeSuccessPct = Math.max(successPct, success > 0 ? 4 : 0);
  const safeFailedPct = Math.max(failedPct, failed > 0 ? 4 : 0);

  return (
    <>
      <div className="metrics-success-fail-bar" title={`Success: ${success} | Failed: ${failed}`}>
        <div
          className="metrics-bar-success"
          style={{ width: `${safeSuccessPct}%` }}
          title={`Success: ${success} (${formatDecimal(successPct, 1)}%)`}
        >
          {success > 0 ? `${formatDecimal(successPct, 1)}%` : ''}
        </div>
        <div
          className="metrics-bar-fail"
          style={{ width: `${safeFailedPct}%` }}
          title={`Failed: ${failed} (${formatDecimal(failedPct, 1)}%)`}
        >
          {failed > 0 ? `${formatDecimal(failedPct, 1)}%` : ''}
        </div>
      </div>
      <div className="metrics-bar-legend">
        <span className="legend-success">Success: {formatInteger(success)}</span>
        <span className="legend-fail">Failed: {formatInteger(failed)}</span>
      </div>
    </>
  );
};

export const RequestCountCard = ({ stats }) => (
  <div className="metrics-kpi-card">
    <h4>Request Count</h4>
    <div className="metrics-kpi-big-value">{formatInteger(stats.total)}</div>
    <SuccessFailureBar {...stats} />
  </div>
);

export const TimeStatsCard = ({ stats, title = 'Processing Time (seconds)' }) => (
  <div className="metrics-kpi-card">
    <h4>{title}</h4>
    <div className="metrics-time-grid">
      <div className="metrics-time-item">
        <div className="label">Min</div>
        <div className="value">{formatDecimal(stats.min, 1)}</div>
      </div>
      <div className="metrics-time-item">
        <div className="label">Avg</div>
        <div className="value">{formatDecimal(stats.avg, 1)}</div>
      </div>
      <div className="metrics-time-item">
        <div className="label">Max</div>
        <div className="value">{formatDecimal(stats.max, 1)}</div>
      </div>
    </div>
  </div>
);

export const TokenUsageCard = ({ stats }) => (
  <div className="metrics-kpi-card">
    <h4>Token Usage</h4>
    <div className="metrics-kpi-big-value">{formatInteger(stats.total)}</div>
    <div className="metrics-success-fail-bar" title={`Input: ${stats.input} | Output: ${stats.output}`}>
      <div
        className="metrics-bar-token-input"
        style={{ width: `${Math.max(stats.inputPct, stats.input > 0 ? 4 : 0)}%` }}
      >
        {stats.input > 0 ? `${formatDecimal(stats.inputPct, 1)}%` : ''}
      </div>
      <div
        className="metrics-bar-token-output"
        style={{ width: `${Math.max(stats.outputPct, stats.output > 0 ? 4 : 0)}%` }}
      >
        {stats.output > 0 ? `${formatDecimal(stats.outputPct, 1)}%` : ''}
      </div>
    </div>
    <div className="metrics-bar-legend token">
      <span className="legend-token-input">Input: {formatInteger(stats.input)}</span>
      <span className="legend-token-output">Output: {formatInteger(stats.output)}</span>
    </div>
  </div>
);
