import { STATUS_OPTIONS, USER_TYPE_OPTIONS } from './utils';

const CDDashboardFilters = ({
  filters,
  filterOptions,
  optionsLoading,
  optionsError,
  dashboardLoading,
  onChange,
  onApply,
  onClear,
}) => (
  <div className="cd-filter-panel">
    {optionsError && <div className="metrics-inline-status error">{optionsError}</div>}
    <div className="cd-filter-grid">
      <div className="cd-filter-group">
        <label htmlFor="cd-client-filter">Client</label>
        <select
          id="cd-client-filter"
          value={filters.client_id}
          onChange={(event) => onChange('client_id', event.target.value)}
          disabled={optionsLoading}
        >
          <option value="">All clients</option>
          {filterOptions.clients.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="cd-filter-group">
        <label htmlFor="cd-policy-filter">Policy</label>
        <select
          id="cd-policy-filter"
          value={filters.policy_file_id}
          onChange={(event) => onChange('policy_file_id', event.target.value)}
          disabled={optionsLoading}
        >
          <option value="">All policies</option>
          {filterOptions.policies.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="cd-filter-group">
        <label htmlFor="cd-user-filter">User</label>
        <select
          id="cd-user-filter"
          value={filters.user_id}
          onChange={(event) => onChange('user_id', event.target.value)}
          disabled={optionsLoading}
        >
          <option value="">All users</option>
          {filterOptions.users.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="cd-filter-group">
        <label htmlFor="cd-user-type-filter">User Type</label>
        <select
          id="cd-user-type-filter"
          value={filters.user_type}
          onChange={(event) => onChange('user_type', event.target.value)}
        >
          {USER_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="cd-filter-group">
        <label htmlFor="cd-status-filter">Status</label>
        <select
          id="cd-status-filter"
          value={filters.status}
          onChange={(event) => onChange('status', event.target.value)}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="cd-filter-group">
        <label htmlFor="cd-category-filter">Rule Category</label>
        <select
          id="cd-category-filter"
          value={filters.category}
          onChange={(event) => onChange('category', event.target.value)}
          disabled={optionsLoading}
        >
          <option value="">All categories</option>
          {filterOptions.categories.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="cd-filter-actions">
        <button type="button" className="cd-apply-btn" onClick={onApply} disabled={dashboardLoading}>
          Apply
        </button>
        <button type="button" className="cd-clear-btn" onClick={onClear} disabled={dashboardLoading}>
          Clear
        </button>
      </div>
    </div>
  </div>
);

export default CDDashboardFilters;
