import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './MasterQuery.css';
import MasterQueryDetails from './MasterQueryDetails';
import MasterQueryFilters from './MasterQueryFilters';
import MasterQueryKpis from './MasterQueryKpis';
import MasterQueryTable, { defaultVisibleColumns } from './MasterQueryTable';
import { useClient } from '../../context/ClientContext';
import { useAuth } from '../../auth/AuthProvider';
import {
  getMasterQueryAssignmentUrl,
  getMasterQueryDetailsUrl,
  getMasterQueriesUrl,
  getMasterQueryStatusUrl,
  resolveUserId,
} from '../../config/apiConfig';
import { uniqueSorted } from './masterQueryUtils';

const emptyFilters = {
  state: '',
  assignedTo: '',
  status: '',
};

const sortValue = (query, key) => {
  if (key === 'opportunitySize') return query.opportunitySize;
  if (Array.isArray(query[key])) return query[key].join(', ').toLowerCase();
  return String(query[key] || '').toLowerCase();
};

const normalizeQuery = (query) => ({
  id: query?.id,
  title: query?.title || '',
  description: query?.description || '',
  matchingConcepts: Array.isArray(query?.matching_concepts)
    ? query.matching_concepts
    : [],
  state: query?.state || '',
  assignedTo: query?.assigned_to_name || query?.assignedToName || query?.assigned_to || query?.assignedTo || '',
  status: query?.status || '',
  assignedToEmail: query?.assigned_to_email || query?.assignedToEmail || '',
  assignedToName: query?.assigned_to_name || query?.assignedToName || query?.assigned_to || query?.assignedTo || '',
  opportunitySize: Number(query?.opportunity_size ?? query?.opportunitySize) || 0,
  reviewDocumentUrl: query?.review_document_url || query?.reviewDocumentUrl || '',
  raw: query || {},
});

const normalizeQueryList = (payload) => {
  const queries = Array.isArray(payload?.queries)
    ? payload.queries
    : Array.isArray(payload)
      ? payload
      : [];
  return queries.map(normalizeQuery).filter((query) => query.id !== undefined && query.id !== null);
};

const normalizeOverviewMetrics = (payload) => ({
  numberOfQueries: Number(payload?.number_of_queries) || 0,
  opportunitySize: Number(payload?.opportunity_size) || 0,
});

const getErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    return payload?.detail || payload?.message || JSON.stringify(payload);
  } catch (parseErr) {
    return response.statusText || 'Request failed.';
  }
};

const MasterQuery = () => {
  const { client, session } = useClient();
  const { account, users } = useAuth();
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [queries, setQueries] = useState([]);
  const [overviewMetrics, setOverviewMetrics] = useState({
    numberOfQueries: 0,
    opportunitySize: 0,
  });
  const [isLoadingQueries, setIsLoadingQueries] = useState(false);
  const [overviewError, setOverviewError] = useState('');
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [restoreQueryId, setRestoreQueryId] = useState(null);

  useEffect(() => {
    if (!toast.open) return undefined;
    const timeoutId = window.setTimeout(() => {
      setToast((current) => ({ ...current, open: false }));
    }, 4000);
    return () => window.clearTimeout(timeoutId);
  }, [toast.open]);

  const loadQueries = useCallback(
    async ({ signal, resetView = false } = {}) => {
      if (resetView) {
        setSelectedQuery(null);
        setSelectedDetails(null);
        setDetailsError('');
        setIsLoadingDetails(false);
        setIsColumnSelectorOpen(false);
        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        setSortConfig({ key: '', direction: 'asc' });
        setRestoreQueryId(null);
      }

      setQueries([]);
      setOverviewMetrics({ numberOfQueries: 0, opportunitySize: 0 });
      setIsLoadingQueries(true);
      setOverviewError('');

      try {
        const response = await fetch(getMasterQueriesUrl(client), {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          signal,
        });

        if (!response.ok) {
          setQueries([]);
          setOverviewMetrics({ numberOfQueries: 0, opportunitySize: 0 });
          setOverviewError(await getErrorMessage(response));
          return;
        }

        const payload = await response.json();
        setQueries(normalizeQueryList(payload));
        setOverviewMetrics(normalizeOverviewMetrics(payload));
      } catch (err) {
        if (signal?.aborted) return;
        setQueries([]);
        setOverviewMetrics({ numberOfQueries: 0, opportunitySize: 0 });
        setOverviewError(err?.message || 'Failed to load master queries.');
      } finally {
        if (!signal?.aborted) {
          setIsLoadingQueries(false);
        }
      }
    },
    [client]
  );

  useEffect(() => {
    const controller = new AbortController();

    loadQueries({ signal: controller.signal, resetView: true });

    return () => controller.abort();
  }, [loadQueries]);

  useEffect(() => {
    if (!selectedQuery?.id) {
      setSelectedDetails(null);
      setDetailsError('');
      setIsLoadingDetails(false);
      return undefined;
    }

    const controller = new AbortController();

    const fetchDetails = async () => {
      setIsLoadingDetails(true);
      setDetailsError('');
      setSelectedDetails(null);

      try {
        const response = await fetch(getMasterQueryDetailsUrl(selectedQuery.id, client), {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          setDetailsError(await getErrorMessage(response));
          return;
        }

        const payload = await response.json();
        setSelectedDetails(payload);
      } catch (err) {
        if (controller.signal.aborted) return;
        setDetailsError(err?.message || 'Failed to load query details.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingDetails(false);
        }
      }
    };

    fetchDetails();

    return () => controller.abort();
  }, [client, selectedQuery?.id]);

  const filterOptions = useMemo(
    () => ({
      states: uniqueSorted(queries, 'state'),
      assignees: uniqueSorted(queries, 'assignedTo'),
      statuses: uniqueSorted(queries, 'status'),
    }),
    [queries]
  );

  const assigneeOptions = useMemo(() => {
    const seen = new Set();
    return (Array.isArray(users) ? users : [])
      .map((user) => ({
        email: String(user?.email || '').trim(),
        name: String(user?.name || '').trim(),
      }))
      .filter((user) => user.email && user.name)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
      .filter((user) => {
        const key = user.email.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [users]);

  const filteredQueries = useMemo(() => {
    const filtered = queries.filter((query) => {
      if (appliedFilters.state && query.state !== appliedFilters.state) return false;
      if (appliedFilters.assignedTo && query.assignedTo !== appliedFilters.assignedTo) return false;
      if (appliedFilters.status && query.status !== appliedFilters.status) return false;
      return true;
    });

    if (!sortConfig.key) return filtered;

    return [...filtered].sort((a, b) => {
      const aValue = sortValue(a, sortConfig.key);
      const bValue = sortValue(b, sortConfig.key);
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [appliedFilters, queries, sortConfig]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: key === 'opportunitySize' ? 'desc' : 'asc' };
    });
  };

  const handleBackToOverview = useCallback(() => {
    const queryIdToRestore = selectedQuery?.id;
    setSelectedQuery(null);
    setSelectedDetails(null);
    setDetailsError('');
    setIsLoadingDetails(false);
    setIsColumnSelectorOpen(false);
    setRestoreQueryId(queryIdToRestore ?? null);
    loadQueries();
  }, [loadQueries, selectedQuery?.id]);

  const handleOpenDetails = useCallback((query) => {
    setIsColumnSelectorOpen(false);
    setSelectedDetails(null);
    setDetailsError('');
    setIsLoadingDetails(true);
    setRestoreQueryId(null);
    setSelectedQuery(query);
  }, []);

  const handleSaveQueryUpdates = useCallback(
    async (query, updates) => {
      if (!query?.id) return;

      const userId = resolveUserId(account);
      let didUpdate = false;

      if (updates?.assignmentChanged) {
        const assignedByName = String(account?.name || account?.username || userId || '').trim();
        const payload = {
          assigned_to_email: String(updates?.assignee?.email || '').trim(),
          assigned_to_name: String(updates?.assignee?.name || '').trim(),
          assigned_by_name: assignedByName,
        };

        const response = await fetch(getMasterQueryAssignmentUrl(query.id, client), {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-User-Id': userId || '',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const updatedAssignment = await response.json();
        setQueries((current) =>
          current.map((item) => {
            if (String(item.id) !== String(query.id)) return item;
            const assignedToEmail =
              updatedAssignment?.assigned_to_email ?? payload.assigned_to_email;
            const assignedToName =
              updatedAssignment?.assigned_to_name ?? payload.assigned_to_name;
            return {
              ...item,
              assignedTo: assignedToName || assignedToEmail || '',
              assignedToEmail: assignedToEmail || '',
              assignedToName: assignedToName || '',
              raw: {
                ...(item.raw || {}),
                ...updatedAssignment,
              },
            };
          })
        );
        didUpdate = true;
      }

      if (updates?.statusChanged) {
        const payload = {
          status: String(updates?.status || '').trim(),
        };

        const response = await fetch(getMasterQueryStatusUrl(query.id, client), {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-User-Id': userId || '',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const updatedStatus = await response.json();
        setQueries((current) =>
          current.map((item) => {
            if (String(item.id) !== String(query.id)) return item;
            const status = updatedStatus?.status ?? payload.status;
            return {
              ...item,
              status: status || '',
              raw: {
                ...(item.raw || {}),
                ...updatedStatus,
              },
            };
          })
        );
        didUpdate = true;
      }

      if (didUpdate) {
        setToast({
          open: true,
          message:
            updates?.assignmentChanged && updates?.statusChanged
              ? 'Assignment and status updated successfully.'
              : updates?.statusChanged
                ? 'Status updated successfully.'
                : 'Assignment updated successfully.',
          severity: 'success',
        });
      }
    },
    [account, client]
  );

  const handleQueryUpdateError = useCallback((message) => {
    setToast({
      open: true,
      message: message || 'Failed to update query.',
      severity: 'error',
    });
  }, []);

  const handleRestoreComplete = useCallback(() => {
    setRestoreQueryId(null);
  }, []);

  const pageTitle = selectedQuery ? 'Query Details' : 'Master Query Library';

  return (
    <div id="view-masterquery" className="mq-page">
      {toast.open ? (
        <div className={`mq-toast mq-toast-${toast.severity}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      ) : null}
      <h1>{pageTitle}</h1>
      {selectedQuery ? (
        <MasterQueryDetails
          query={selectedQuery}
          details={selectedDetails}
          isLoading={isLoadingDetails}
          errorDetail={detailsError}
          client={client}
          session={session}
          onBack={handleBackToOverview}
        />
      ) : (
        <>
          <p className="mq-intro">
            Browse production queries across clients. Click a query title to view details and insights.
          </p>
          <MasterQueryFilters
            filters={filters}
            states={filterOptions.states}
            assignees={filterOptions.assignees}
            statuses={filterOptions.statuses}
            onChange={handleFilterChange}
            onApply={() => setAppliedFilters(filters)}
            onClear={handleClearFilters}
          />
          <MasterQueryKpis queryCount={overviewMetrics.numberOfQueries} />
          {overviewError ? (
            <div className="mq-alert mq-alert-error" role="alert">
              {overviewError}
            </div>
          ) : null}
          <MasterQueryTable
            key={String(client || '')}
            queries={filteredQueries}
            isLoading={isLoadingQueries}
            sortConfig={sortConfig}
            visibleColumns={visibleColumns}
            isColumnSelectorOpen={isColumnSelectorOpen}
            onSort={handleSort}
            onToggleColumn={(key, isVisible) =>
              setVisibleColumns((current) => ({ ...current, [key]: isVisible }))
            }
            onToggleColumnSelector={() => setIsColumnSelectorOpen((current) => !current)}
            onCloseColumnSelector={() => setIsColumnSelectorOpen(false)}
            onOpenDetails={handleOpenDetails}
            assigneeOptions={assigneeOptions}
            onSaveQueryUpdates={handleSaveQueryUpdates}
            onQueryUpdateError={handleQueryUpdateError}
            restoreQueryId={restoreQueryId}
            onRestoreComplete={handleRestoreComplete}
          />
        </>
      )}
    </div>
  );
};

export default MasterQuery;
