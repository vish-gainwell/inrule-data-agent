import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'matchingConcepts', label: 'Matching Concepts' },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'status', label: 'Status' },
  { key: 'reviewDocument', label: 'Review Document', sortable: false },
];

const statusOptions = [
  { value: 'NOT_STARTED', label: 'Not started' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'FINALIZED', label: 'Finalized' },
  { value: 'REJECTED', label: 'Rejected' },
];

const normalizeStatusValue = (value) =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

export const defaultVisibleColumns = columns.reduce((acc, column) => {
  acc[column.key] = true;
  return acc;
}, {});

const MasterQueryTable = ({
  queries,
  isLoading,
  sortConfig,
  visibleColumns,
  isColumnSelectorOpen,
  onSort,
  onToggleColumn,
  onToggleColumnSelector,
  onCloseColumnSelector,
  onOpenDetails,
  assigneeOptions = [],
  onSaveQueryUpdates,
  onQueryUpdateError,
  restoreQueryId,
  onRestoreComplete,
}) => {
  const selectorRef = useRef(null);
  const rowRefs = useRef({});
  const [editingQueryId, setEditingQueryId] = useState(null);
  const [draftAssigneeEmail, setDraftAssigneeEmail] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [savingQueryId, setSavingQueryId] = useState(null);

  useEffect(() => {
    if (!isColumnSelectorOpen) return undefined;

    const handleClick = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        onCloseColumnSelector();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isColumnSelectorOpen, onCloseColumnSelector]);

  useEffect(() => {
    if (isLoading || !restoreQueryId) return;

    const targetRow = rowRefs.current[String(restoreQueryId)];
    if (!targetRow) {
      onRestoreComplete?.();
      return;
    }

    targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetRow.focus({ preventScroll: true });
    const timeoutId = window.setTimeout(() => {
      onRestoreComplete?.();
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [isLoading, onRestoreComplete, queries, restoreQueryId]);

  const sortIcon = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '^' : 'v';
  };

  const headerClass = (column) => {
    if (column.sortable === false) return '';
    const active = sortConfig.key === column.key ? ` active ${sortConfig.direction}` : '';
    return `sortable${active}`;
  };

  const formatList = (value) => {
    if (Array.isArray(value)) return value.length ? value.join(', ') : '-';
    return value || '-';
  };

  const displayValue = (value) =>
    value === null || value === undefined || String(value).trim() === '' ? '-' : value;

  const visibleColumnCount = columns.filter((column) => visibleColumns[column.key]).length;
  const showActionsColumn = visibleColumns.assignedTo || visibleColumns.status;
  const tableColSpan = visibleColumnCount + (showActionsColumn ? 1 : 0);

  const normalizedAssigneeOptions = useMemo(() => {
    const seen = new Set();
    return (Array.isArray(assigneeOptions) ? assigneeOptions : [])
      .map((option) => ({
        email: String(option?.email || '').trim(),
        name: String(option?.name || '').trim(),
      }))
      .filter((option) => option.email && option.name)
      .filter((option) => {
        const key = option.email.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [assigneeOptions]);

  const filterAssigneeOptions = (options, { inputValue }) => {
    const search = String(inputValue || '').trim().toLowerCase();
    if (!search) return options;
    return options.filter(
      (option) =>
        option.name.toLowerCase().includes(search) ||
        option.email.toLowerCase().includes(search)
    );
  };

  const startEditAssignment = (query) => {
    setEditingQueryId(query.id);
    setDraftAssigneeEmail(String(query.assignedToEmail || '').trim());
    setDraftStatus(normalizeStatusValue(query.status) || 'NOT_ASSIGNED');
  };

  const cancelEditAssignment = () => {
    setEditingQueryId(null);
    setDraftAssigneeEmail('');
    setDraftStatus('');
  };

  const saveAssignment = async (query) => {
    if (!onSaveQueryUpdates || savingQueryId) return;
    const assignee =
      normalizedAssigneeOptions.find((option) => option.email === draftAssigneeEmail) ||
      (draftAssigneeEmail
        ? {
            email: draftAssigneeEmail,
            name: query.assignedToName || query.assignedTo || draftAssigneeEmail,
          }
        : { email: '', name: '' });
    const assignmentChanged =
      String(query.assignedToEmail || '').trim() !== String(draftAssigneeEmail || '').trim();
    const currentStatus = normalizeStatusValue(query.status) || 'NOT_ASSIGNED';
    const nextStatus = normalizeStatusValue(draftStatus) || 'NOT_ASSIGNED';
    const statusChanged = currentStatus !== nextStatus;

    if (!assignmentChanged && !statusChanged) {
      cancelEditAssignment();
      return;
    }

    setSavingQueryId(query.id);
    try {
      await onSaveQueryUpdates(query, {
        assignmentChanged,
        statusChanged,
        assignee,
        status: nextStatus,
      });
      cancelEditAssignment();
    } catch (err) {
      onQueryUpdateError?.(err?.message || 'Failed to update query.');
    } finally {
      setSavingQueryId(null);
    }
  };

  return (
    <section className="mq-policy-overview-section">
      <div className="mq-overview-header">
        <div className="mq-overview-header-text">
          <h2>Query Overview</h2>
          <p>Click on a query title to view details and insights.</p>
        </div>
        <div className="mq-column-selector-wrapper" ref={selectorRef}>
          <button type="button" className="mq-btn-column-selector" onClick={onToggleColumnSelector}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Columns
          </button>
          <div className={`mq-column-selector-dropdown${isColumnSelectorOpen ? ' open' : ''}`}>
            <div className="mq-col-select-header">Toggle Columns</div>
            {columns.map((column) => (
              <label key={column.key}>
                <input
                  type="checkbox"
                  checked={visibleColumns[column.key]}
                  onChange={(event) => onToggleColumn(column.key, event.target.checked)}
                />
                {column.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mq-policy-rules-table">
        <table className="mq-rules-overview-table">
          <thead>
            <tr>
              {columns.map((column) =>
                visibleColumns[column.key] ? (
                  <th
                    key={column.key}
                    className={headerClass(column)}
                    onClick={() => column.sortable !== false && onSort(column.key)}
                    aria-sort={
                      sortConfig.key === column.key
                        ? sortConfig.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {column.label}
                    {column.sortable !== false && sortConfig.key === column.key ? (
                      <span className="sort-icon">{sortIcon(column.key)}</span>
                    ) : null}
                  </th>
                ) : null
              )}
              {showActionsColumn ? <th className="mq-col-actions" aria-label="Actions"></th> : null}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={tableColSpan}>
                  <div className="mq-table-state" role="status">
                    Loading master queries...
                  </div>
                </td>
              </tr>
            ) : null}
            {!isLoading && !queries.length ? (
              <tr>
                <td colSpan={tableColSpan}>
                  <div className="mq-table-state">No master queries found.</div>
                </td>
              </tr>
            ) : null}
            {!isLoading && queries.map((query) => (
              <tr
                key={query.id}
                ref={(element) => {
                  if (element) {
                    rowRefs.current[String(query.id)] = element;
                  } else {
                    delete rowRefs.current[String(query.id)];
                  }
                }}
                className={`rule-row${editingQueryId === query.id ? ' row-editing' : ''}${
                  String(restoreQueryId) === String(query.id) ? ' row-restored' : ''
                }`}
                tabIndex={-1}
                onClick={() => onOpenDetails(query)}
              >
                {visibleColumns.id ? <td>{displayValue(query.id)}</td> : null}
                {visibleColumns.title ? (
                  <td>
                    <button
                      type="button"
                      className="mq-title-link"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenDetails(query);
                      }}
                    >
                      {displayValue(query.title)}
                    </button>
                  </td>
                ) : null}
                {visibleColumns.description ? <td>{displayValue(query.description)}</td> : null}
                {visibleColumns.matchingConcepts ? <td>{formatList(query.matchingConcepts)}</td> : null}
                {visibleColumns.assignedTo ? (
                  <td onClick={(event) => event.stopPropagation()} title={query.assignedToName || query.assignedTo || ''}>
                    {editingQueryId === query.id ? (
                      <Autocomplete
                        className="mq-assignee-autocomplete"
                        options={normalizedAssigneeOptions}
                        filterOptions={filterAssigneeOptions}
                        value={
                          normalizedAssigneeOptions.find(
                            (option) => option.email === draftAssigneeEmail
                          ) || null
                        }
                        openOnFocus
                        disabled={savingQueryId === query.id}
                        getOptionLabel={(option) => option?.name || ''}
                        isOptionEqualToValue={(option, value) => option.email === value.email}
                        onChange={(_, newValue) => {
                          setDraftAssigneeEmail(newValue?.email || '');
                        }}
                        renderOption={(props, option) => {
                          const { key, ...optionProps } = props;
                          return (
                            <li key={key} {...optionProps} title={option.name}>
                              <span className="mq-assignee-option-name">{option.name}</span>
                            </li>
                          );
                        }}
                        renderInput={(params) => (
                          <TextField {...params} size="small" placeholder="Select.." />
                        )}
                        onClick={(event) => event.stopPropagation()}
                      />
                    ) : (
                      <span className="mq-assigned-to-display">
                        {displayValue(query.assignedToName || query.assignedTo)}
                      </span>
                    )}
                  </td>
                ) : null}
                {visibleColumns.status ? (
                  <td onClick={(event) => event.stopPropagation()}>
                    {editingQueryId === query.id ? (
                      <select
                        className="mq-status-select"
                        value={draftStatus}
                        disabled={savingQueryId === query.id}
                        onChange={(event) => setDraftStatus(event.target.value)}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : query.status ? (
                      <span className="mq-status-badge mq-status-accept">{query.status}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                ) : null}
                {visibleColumns.reviewDocument ? (
                  <td>
                    <button
                      type="button"
                      className="mq-doc-icon-btn"
                      title="Review document"
                      disabled={!query.reviewDocumentUrl}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (query.reviewDocumentUrl) {
                          window.open(query.reviewDocumentUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </button>
                  </td>
                ) : null}
                {showActionsColumn ? (
                  <td className="mq-col-actions" onClick={(event) => event.stopPropagation()}>
                    {editingQueryId === query.id ? (
                      <div className="mq-row-action-buttons">
                        <button
                          type="button"
                          className="mq-row-icon-btn mq-row-save-btn"
                          title="Save changes"
                          aria-label="Save changes"
                          disabled={savingQueryId === query.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            saveAssignment(query);
                          }}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="mq-row-icon-btn mq-row-cancel-btn"
                          title="Cancel"
                          aria-label="Cancel assignment edit"
                          disabled={savingQueryId === query.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            cancelEditAssignment();
                          }}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="mq-row-icon-btn"
                        title="Edit assignment and status"
                        aria-label="Edit assignment and status"
                        disabled={Boolean(savingQueryId)}
                        onClick={(event) => {
                          event.stopPropagation();
                          startEditAssignment(query);
                        }}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MasterQueryTable;
