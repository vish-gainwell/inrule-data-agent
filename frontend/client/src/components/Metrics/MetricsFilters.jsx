import { DATE_RANGE_OPTIONS, MODE_OPTIONS, formatSeconds } from './metricsUtils';

const MetricsFilters = ({
  filters,
  filterOptions,
  loading,
  optionsLoading,
  optionsError = '',
  showSlowQueryThreshold = false,
  slowThresholdSeconds = 30,
  onChange,
  onSlowThresholdChange,
  onApply,
  onClear,
}) => {
  const clients = filterOptions.clients || [];
  const users = filterOptions.users || [];

  const handleFieldChange = (field) => (event) => {
    onChange({ [field]: event.target.value });
  };

  const handleDateChange = (field) => (event) => {
    onChange({ [field]: event.target.value, dateRange: 'custom' });
  };

  return (
    <div className="metrics-filter-panel">
      {optionsError && <div className="metrics-inline-status error">{optionsError}</div>}
      <div className="metrics-filter-grid">
        <div className="metrics-filter-group">
          <label htmlFor="metrics-client-filter">Client</label>
          <select
            id="metrics-client-filter"
            value={filters.client}
            onChange={handleFieldChange('client')}
            disabled={optionsLoading || loading}
          >
            <option value="ALL">All clients</option>
            {clients.map((client) => (
              <option key={client.value} value={client.value}>
                {client.label}
              </option>
            ))}
          </select>
        </div>

        <div className="metrics-filter-group">
          <label htmlFor="metrics-user-filter">User</label>
          <select
            id="metrics-user-filter"
            value={filters.user_id}
            onChange={handleFieldChange('user_id')}
            disabled={optionsLoading || loading}
          >
            <option value="ALL">All users</option>
            {users.map((user) => (
              <option key={user.value} value={user.value}>
                {user.label}
              </option>
            ))}
          </select>
        </div>

        <div className="metrics-filter-group">
          <label htmlFor="metrics-mode-filter">Mode</label>
          <select
            id="metrics-mode-filter"
            value={filters.mode}
            onChange={handleFieldChange('mode')}
            disabled={loading}
          >
            {MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="metrics-filter-group">
          <label htmlFor="metrics-date-range">Date Range</label>
          <select
            id="metrics-date-range"
            value={filters.dateRange}
            onChange={handleFieldChange('dateRange')}
            disabled={loading}
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value || 'none'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="metrics-filter-group">
          <label htmlFor="metrics-start-date">Start Date</label>
          <input
            type="date"
            id="metrics-start-date"
            value={filters.start_date}
            onChange={handleDateChange('start_date')}
            disabled={loading}
          />
        </div>

        <div className="metrics-filter-group">
          <label htmlFor="metrics-end-date">End Date</label>
          <input
            type="date"
            id="metrics-end-date"
            value={filters.end_date}
            onChange={handleDateChange('end_date')}
            disabled={loading}
          />
        </div>

        {showSlowQueryThreshold && (
          <div className="metrics-filter-group metrics-slow-threshold-filter">
            <label htmlFor="slow-query-threshold">Slow Query Threshold</label>
            <div className="metrics-threshold-filter-control">
              <input
                type="range"
                id="slow-query-threshold"
                min="30"
                max="600"
                step="1"
                value={slowThresholdSeconds}
                onChange={(event) => onSlowThresholdChange(Number(event.target.value))}
                disabled={loading}
              />
              <span>{formatSeconds(slowThresholdSeconds)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="metrics-actions">
        <button type="button" className="metrics-btn" onClick={onApply} disabled={loading}>
          {loading ? 'Loading...' : 'Apply Filters'}
        </button>
        <button type="button" className="metrics-btn secondary" onClick={onClear} disabled={loading}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default MetricsFilters;
