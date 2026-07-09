import { formatInteger } from './metricsUtils';

const getErrorMessage = (row) =>
  row.message ?? row.error_reason ?? row.error_message ?? row.errorMessage ?? row.type ?? '-';

const MetricsErrorsTable = ({ rows }) => {
  const displayRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="metrics-errors">
      <h3>Error Messages</h3>
      <table className="metrics-error-table">
        <thead>
          <tr>
            <th>Error Message</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody id="metrics-error-table-body">
          {displayRows.length === 0 ? (
            <tr>
              <td colSpan="2" className="metrics-table-empty">
                No errors found for the selected filters.
              </td>
            </tr>
          ) : (
            displayRows.map((row, index) => (
              <tr key={row.id ?? `${getErrorMessage(row)}-${index}`}>
                <td>{getErrorMessage(row)}</td>
                <td>{formatInteger(row.count ?? row.error_count ?? 0)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MetricsErrorsTable;
