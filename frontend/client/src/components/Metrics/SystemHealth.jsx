import { formatSeconds, toNumber } from './metricsUtils';

const normalizeHealthPayload = (healthResponse) => healthResponse?.data ?? healthResponse ?? {};

const getStatusClass = (status) => {
  const value = String(status || '').toLowerCase();
  if (value.includes('healthy') || value === 'ok') return 'ok';
  if (value.includes('degraded') || value.includes('warn')) return 'degraded';
  return 'bad';
};

const formatHealthDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCellValue = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '-';
  if (typeof value === 'object') {
    const entries = Object.entries(value)
      .filter(([, entryValue]) => entryValue !== null && entryValue !== undefined && entryValue !== '')
      .map(([key, entryValue]) => `${key}: ${formatCellValue(entryValue)}`);
    return entries.length ? entries.join(' | ') : '-';
  }
  return String(value);
};

const formatHealthStatusLabel = (status) => {
  const value = String(status || '').toLowerCase();
  if (value.includes('healthy') || value === 'ok') return 'OK';
  if (value.includes('degraded') || value.includes('warn')) return 'Degraded';
  if (value.includes('unhealthy') || value.includes('down') || value.includes('error')) return 'Issue';
  return status || 'Unknown';
};

const getServiceLabel = (key, service) => {
  const lowerKey = String(key || '').toLowerCase();
  const serviceName = String(service?.service_name || '').toLowerCase();

  if (lowerKey.includes('api_')) return 'API Server';
  if (lowerKey.includes('mcp') || serviceName.includes('mcp')) return 'MCP Server';
  if (lowerKey.includes('postgres')) return 'PostgreSQL';
  if (lowerKey.includes('openai')) return 'OpenAI';
  if (lowerKey.includes('sql')) return 'SQL Server (Client DB)';

  return service?.service_name || key;
};

const getServiceCheck = (key, service) => {
  const lowerKey = String(key || '').toLowerCase();

  if (lowerKey === 'mcp_server') return '/health endpoint';
  if (lowerKey === 'postgresql') {
    const tables = service?.details?.tables_checked;
    return Array.isArray(tables) && tables.length ? tables.join(' / ') : 'sessions / operations / metrics';
  }
  if (lowerKey === 'openai') return 'models connectivity';
  if (lowerKey.includes('sql')) return 'connection pool';

  return service?.check || key;
};

const getServiceResponseTimeSeconds = (service) => {
  const seconds =
    service?.response_time_seconds ??
    service?.response_time_sec ??
    service?.response_seconds;

  if (seconds !== null && seconds !== undefined && seconds !== '') {
    return toNumber(seconds, null);
  }

  const milliseconds = service?.response_time_ms ?? service?.response_time;
  if (milliseconds === null || milliseconds === undefined || milliseconds === '') return null;

  const parsed = toNumber(milliseconds, null);
  return parsed === null ? null : parsed / 1000;
};

const SystemHealth = ({ healthResponse, loading, error, onRefresh }) => {
  const health = normalizeHealthPayload(healthResponse);
  const services = Object.entries(health.services || {}).map(([name, service]) => ({
    name,
    displayName: getServiceLabel(name, service),
    check: getServiceCheck(name, service),
    status: service?.status || 'unknown',
    responseTimeSeconds: getServiceResponseTimeSeconds(service),
  }));

  return (
    <div className="metrics-health-content">
      <div className="metrics-health-actions">
        <button type="button" className="metrics-btn" onClick={onRefresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="metrics-inline-status error">{error}</div>}

      <div className="metrics-errors metrics-service-status-panel">
        <h3>Service Status</h3>
        <table className="metrics-error-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Check</th>
              <th>Status</th>
              <th>Response Time</th>
              <th>Last Checked</th>
            </tr>
          </thead>
          <tbody>
            {loading && services.length === 0 ? (
              <tr>
                <td colSpan="5" className="metrics-table-empty">
                  Loading system health...
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan="5" className="metrics-table-empty">
                  No service health data is available.
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.name}>
                  <td>
                    <strong>{service.displayName}</strong>
                  </td>
                  <td>{formatCellValue(service.check)}</td>
                  <td>
                    <span className={`health-status ${getStatusClass(service.status)}`}>
                      {formatHealthStatusLabel(service.status)}
                    </span>
                  </td>
                  <td>
                    {service.responseTimeSeconds === null
                      ? '-'
                      : formatSeconds(service.responseTimeSeconds)}
                  </td>
                  <td>{formatHealthDate(health.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemHealth;
