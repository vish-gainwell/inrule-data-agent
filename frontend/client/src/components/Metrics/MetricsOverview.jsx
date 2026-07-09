import {
  MODE_LABELS,
  buildMetricsViewModel,
  formatDecimal,
  formatInteger,
} from './metricsUtils';
import MetricsErrorsTable from './MetricsErrorsTable';
import MetricsTrendChart from './MetricsTrendChart';
import {
  RequestCountCard,
  SuccessFailureBar,
  TimeStatsCard,
  TokenUsageCard,
} from './MetricsKpiCard';

const ModeMetricsSection = ({ summary }) => (
  <div className="metrics-section">
    <h3>{summary.label} Metrics</h3>
    <div className="metrics-mode-grid">
      <div>
        <div className="metrics-kpi-big-value mode-total">
          {formatInteger(summary.requestStats.total)}
        </div>
        <SuccessFailureBar {...summary.requestStats} />
      </div>
      <div className="metrics-mode-time">
        <h4>Processing Time (seconds)</h4>
        <div className="metrics-time-grid">
          <div className="metrics-time-item">
            <div className="label">Min</div>
            <div className="value">{formatDecimal(summary.timeStats.min, 1)}</div>
          </div>
          <div className="metrics-time-item">
            <div className="label">Avg</div>
            <div className="value">{formatDecimal(summary.timeStats.avg, 1)}</div>
          </div>
          <div className="metrics-time-item">
            <div className="label">Max</div>
            <div className="value">{formatDecimal(summary.timeStats.max, 1)}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MetricsOverview = ({ metricsResponse, loading, error, mode }) => {
  const viewModel = buildMetricsViewModel(metricsResponse);
  const selectedMode = mode === 'ALL' ? null : mode;
  const title = selectedMode
    ? `${MODE_LABELS[selectedMode] || selectedMode} Requests`
    : 'All Requests (Generate + Execute + Preview)';
  const trendYAxisMax = Math.max(
    ...viewModel.trends.flatMap((item) => [
      Number(item.questions) || 0,
      Number(item.errors) || 0,
    ]),
    0
  );

  return (
    <div className="metrics-dashboard-content">
      {loading && <div className="metrics-inline-status">Loading metrics...</div>}
      {error && <div className="metrics-inline-status error">{error}</div>}

      <div className="metrics-kpi-section">
        <h3 className="metrics-section-title">{title}</h3>
        <div className="metrics-kpi-row">
          <RequestCountCard stats={viewModel.requestStats} />
          <TimeStatsCard stats={viewModel.timeStats} />
          <TokenUsageCard stats={viewModel.tokenStats} />
        </div>
      </div>

      <div className="metrics-trend-grid">
        <MetricsTrendChart
          title="Daily Questions Trend"
          data={viewModel.trends}
          valueKey="questions"
          color="#129cb9"
          fillColor="rgba(18,156,185,0.12)"
          yAxisMax={trendYAxisMax}
        />
        <MetricsTrendChart
          title="Daily Errors Trend"
          data={viewModel.trends}
          valueKey="errors"
          color="#d46060"
          fillColor="rgba(212,96,96,0.12)"
          yAxisMax={trendYAxisMax}
        />
      </div>

      {!selectedMode && (
        <div className="metrics-sections">
          {viewModel.modes.map((summary) => (
            <ModeMetricsSection key={summary.mode} summary={summary} />
          ))}
        </div>
      )}

      <MetricsErrorsTable rows={viewModel.errors} />
    </div>
  );
};

export default MetricsOverview;
