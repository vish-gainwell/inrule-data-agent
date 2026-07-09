import {
  formatDateTime,
  getPolicyName,
  getRuleId,
} from './utils';

const fallbackValue = (...values) => {
  const value = values.find((item) => item !== undefined && item !== null && String(item).trim() !== '');
  return value === undefined ? '-' : value;
};

const CDDashboardHistoryModal = ({
  historyRule,
  historyData,
  historyItems,
  historyLoading,
  historyError,
  onClose,
}) => {
  if (!historyRule) return null;

  return (
    <div className="cd-history-modal" role="dialog" aria-modal="true" aria-labelledby="cd-history-modal-title">
      <div
        className="cd-history-scrim"
        role="button"
        tabIndex={0}
        aria-label="Close rule history"
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClose();
          }
        }}
      />
      <div className="cd-history-dialog">
        <div className="cd-history-header">
          <div>
            <h4 id="cd-history-modal-title">Rule History</h4>
            <p>{getRuleId(historyRule)} | {getPolicyName(historyRule)}</p>
          </div>
          <button type="button" className="cd-history-close" onClick={onClose} aria-label="Close rule history">x</button>
        </div>
        <div className="cd-history-body">
          {historyLoading && <div className="metrics-inline-status">Loading rule history...</div>}
          {historyError && <div className="metrics-inline-status error">{historyError}</div>}
          {!historyLoading && !historyError && (
            <>
              {historyData.empty_state && !historyItems.length && (
                <div className="cd-note-box">{historyData.empty_state}</div>
              )}
              <div className="cd-history-table-wrap">
                {!historyItems.length && !historyData.empty_state && (
                  <div className="metrics-table-empty">No history events available.</div>
                )}
                {Boolean(historyItems.length) && (
                  <table className="cd-history-table" aria-label="Rule history events">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Event</th>
                        <th>Updated By</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyItems.map((item) => (
                        <tr key={item.event_id || `${item.event_timestamp}-${item.event_type}`}>
                          <td className="muted">{formatDateTime(item.event_timestamp)}</td>
                          <td className="event">{fallbackValue(item.event_type)}</td>
                          <td>{fallbackValue(item.actor_user_id, item.event_source)}</td>
                          <td>{fallbackValue(item.new_status, item.old_status)}</td>
                          <td>{fallbackValue(item.new_assignee_email, item.old_assignee_email)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CDDashboardHistoryModal;
