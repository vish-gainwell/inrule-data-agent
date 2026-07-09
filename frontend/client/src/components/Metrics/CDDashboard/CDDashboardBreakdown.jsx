import { formatInteger, toNumber } from './utils';

const BreakdownList = ({ rows }) => {
  const max = Math.max(...rows.map((row) => toNumber(row.count)), 0);

  if (!rows.length) {
    return <div className="metrics-table-empty">No breakdown data available.</div>;
  }

  return (
    <div className="cd-bar-list">
      {rows.map((row, index) => {
        const count = toNumber(row.count);
        const width = max > 0 ? Math.max((count / max) * 100, 4) : 0;
        return (
          <div className="cd-bar-row" key={`${row.label || 'row'}-${index}`}>
            <div className="top">
              <span>{row.label || '-'}</span>
              <strong>{formatInteger(count)}</strong>
            </div>
            <div className="cd-bar-track">
              <div className="cd-bar-fill" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CDDashboardBreakdown = ({ breakdownTab, breakdownRows, onTabChange }) => (
  <div className="cd-panel">
    <div className="cd-panel-title-row">
      <h4>Workload Breakdown</h4>
    </div>
    <div className="cd-breakdown-tabs" role="tablist" aria-label="Workload breakdown">
      <button
        className={`cd-breakdown-tab${breakdownTab === 'statuses' ? ' active' : ''}`}
        type="button"
        onClick={() => onTabChange('statuses')}
      >
        Status
      </button>
      <button
        className={`cd-breakdown-tab${breakdownTab === 'assignees' ? ' active' : ''}`}
        type="button"
        onClick={() => onTabChange('assignees')}
      >
        Assignee
      </button>
    </div>
    <div className="cd-breakdown-scroll">
      <BreakdownList rows={breakdownRows} />
    </div>
  </div>
);

export default CDDashboardBreakdown;
