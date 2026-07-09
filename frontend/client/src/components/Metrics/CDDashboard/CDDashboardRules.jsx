import { formatInteger, formatMoney, getAssignee, getPolicyName, getRuleDisplayId, getRuleId, statusClass } from './utils';

const SORT_OPTIONS = [
  { value: 'rule', label: 'Rule' },
  { value: 'policy', label: 'Policy' },
  { value: 'category', label: 'Category' },
  { value: 'status', label: 'Status' },
  { value: 'opportunity_size', label: 'Opportunity' },
];

const CDDashboardRules = ({
  rules,
  loading,
  error,
  pagination,
  paginationMeta,
  activeRuleId,
  onPaginationChange,
  onOpenHistory,
}) => {
  const page = Number(paginationMeta.page || pagination.page || 1);
  const pageSize = Number(paginationMeta.page_size || pagination.page_size || 25);
  const total = Number(paginationMeta.total || 0);
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : page;
  const hasNext = Boolean(paginationMeta.has_next);
  const hasPrevious = page > 1;
  const start = total > 0 ? ((page - 1) * pageSize) + 1 : 0;
  const end = total > 0 ? Math.min(page * pageSize, total) : rules.length;

  return (
  <div className="cd-panel cd-rules-panel">
    <div className="cd-panel-title-row">
      <h4>Rules Matching Current Filter</h4>
    </div>
    {error && <div className="metrics-inline-status error cd-rules-status">{error}</div>}
    {loading && <div className="metrics-inline-status cd-rules-status">Loading rules...</div>}
    <div className="cd-rules-table-wrap">
      <table className="cd-data-table">
        <thead>
          <tr>
            <th>Rule</th>
            <th>Policy</th>
            <th>Category</th>
            <th>Assignee</th>
            <th>Status</th>
            <th>Opportunity</th>
            <th>History</th>
          </tr>
        </thead>
        <tbody>
          {!loading && !error && !rules.length && (
            <tr>
              <td colSpan={7} className="metrics-table-empty">No rules match the current filters.</td>
            </tr>
          )}
          {rules.map((rule, index) => {
            const ruleId = getRuleId(rule);
            const ruleDisplayId = getRuleDisplayId(rule);
            const status = rule.status || rule.rule_status || '-';
            const openRuleHistory = () => onOpenHistory(rule);
            return (
              <tr
                className={`cd-rule-selectable${activeRuleId === ruleId ? ' cd-rule-selected' : ''}`}
                key={`${ruleId || 'rule'}-${index}`}
                tabIndex={0}
                role="button"
                aria-label={`View history for rule ${ruleDisplayId || index + 1}`}
                onClick={openRuleHistory}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openRuleHistory();
                  }
                }}
              >
                <td>{ruleDisplayId || '-'}</td>
                <td>{getPolicyName(rule)}</td>
                <td>{rule.category || rule.rule_category || '-'}</td>
                <td>{getAssignee(rule)}</td>
                <td><span className={`cd-status-pill ${statusClass(status)}`}>{status}</span></td>
                <td>{formatMoney(rule.opportunity_size)}</td>
                <td>
                  <span className="cd-table-action" aria-hidden="true">View</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <div className="cd-rules-pagination">
      <div className="cd-rules-page-summary">
        {total > 0 ? `${formatInteger(start)}-${formatInteger(end)} of ${formatInteger(total)}` : `${formatInteger(rules.length)} rules`}
      </div>
      <div className="cd-rules-page-controls">
        <label>
          <span>Rows</span>
          <select
            value={pagination.page_size}
            onChange={(event) => onPaginationChange({ page_size: Number(event.target.value) })}
            disabled={loading}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select
            value={pagination.sort_by}
            onChange={(event) => onPaginationChange({ sort_by: event.target.value })}
            disabled={loading}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Order</span>
          <select
            value={pagination.sort_order}
            onChange={(event) => onPaginationChange({ sort_order: event.target.value })}
            disabled={loading}
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </label>
        <button
          type="button"
          className="cd-table-action"
          onClick={() => onPaginationChange({ page: page - 1 })}
          disabled={loading || !hasPrevious}
        >
          Previous
        </button>
        <span className="cd-rules-page-number">Page {formatInteger(page)} of {formatInteger(totalPages || 1)}</span>
        <button
          type="button"
          className="cd-table-action"
          onClick={() => onPaginationChange({ page: page + 1 })}
          disabled={loading || (!hasNext && page >= totalPages)}
        >
          Next
        </button>
      </div>
    </div>
  </div>
  );
};

export default CDDashboardRules;
