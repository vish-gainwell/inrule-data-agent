import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../css/MetricsDashboard.css';
import {
  fetchMetricsAnalysis,
  fetchMetricsFilterOptions,
  fetchMetricsOverview,
  fetchSystemHealth,
} from '../api/metricsApi';
import CDDashboard from '../components/Metrics/CDDashboard';
import MetricsFilters from '../components/Metrics/MetricsFilters';
import MetricsOverview from '../components/Metrics/MetricsOverview';
import MetricsTabs from '../components/Metrics/MetricsTabs';
import SlowQueryMonitoring from '../components/Metrics/SlowQueryMonitoring';
import SystemHealth from '../components/Metrics/SystemHealth';
import {
  getDateRangeValues,
  normalizeFilterOptions,
} from '../components/Metrics/metricsUtils';

const createDefaultFilters = () => {
  const dateRange = getDateRangeValues('1w');
  return {
    client: 'ALL',
    user_id: 'ALL',
    mode: 'ALL',
    dateRange: '1w',
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
    relative_count: dateRange.relative_count,
    relative_unit: dateRange.relative_unit,
  };
};

const buildMetricsParams = (filters) => {
  const params = {};

  if (filters.client && filters.client !== 'ALL') params.client = filters.client;
  if (filters.user_id && filters.user_id !== 'ALL') params.user_id = filters.user_id;
  if (filters.mode && filters.mode !== 'ALL') params.mode = filters.mode;
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;

  if (filters.dateRange !== 'custom') {
    if (filters.relative_count) params.relative_count = filters.relative_count;
    if (filters.relative_unit) params.relative_unit = filters.relative_unit;
  }

  return params;
};

const buildAnalysisParams = (filters, slowThresholdSeconds) => ({
  ...buildMetricsParams(filters),
  slow_threshold_seconds: slowThresholdSeconds,
});

const hasMetricsDataShape = (payload) => {
  const data = payload?.data;
  return Boolean(
    data &&
      typeof data === 'object' &&
      (
        Array.isArray(data.records) ||
        Array.isArray(data.daily_trends) ||
        Array.isArray(data.error_observability) ||
        data.summary ||
        data.pagination
      )
  );
};

const getBodyStatusError = (response) => {
  const statusCode = Number(response?.status_code ?? response?.statusCode);
  if (Number.isFinite(statusCode) && statusCode >= 400) {
    return response?.message || `Metrics request failed with status ${statusCode}.`;
  }
  return '';
};

const MetricsDashboard = () => {
  const initialFilters = useMemo(() => createDefaultFilters(), []);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filters, setFilters] = useState(initialFilters);
  const [filterOptions, setFilterOptions] = useState({ clients: [], users: [] });
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [overviewResponse, setOverviewResponse] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState('');
  const [analysisResponse, setAnalysisResponse] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [slowThresholdSeconds, setSlowThresholdSeconds] = useState(30);
  const [healthResponse, setHealthResponse] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState('');

  const loadOverviewMetrics = useCallback(async (nextFilters) => {
    setOverviewLoading(true);
    setOverviewError('');
    try {
      const response = await fetchMetricsOverview(buildMetricsParams(nextFilters));
      setOverviewResponse(response);
      const bodyStatusError = getBodyStatusError(response);
      if (bodyStatusError) setOverviewError(bodyStatusError);
    } catch (error) {
      if (hasMetricsDataShape(error.response)) {
        setOverviewResponse(error.response);
      }
      setOverviewError(error.message || 'Unable to load dashboard metrics.');
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const loadAnalysisMetrics = useCallback(async (nextFilters, thresholdSeconds) => {
    setAnalysisLoading(true);
    setAnalysisError('');
    try {
      const response = await fetchMetricsAnalysis(buildAnalysisParams(nextFilters, thresholdSeconds));
      setAnalysisResponse(response);
      const bodyStatusError = getBodyStatusError(response);
      if (bodyStatusError) setAnalysisError(bodyStatusError);
    } catch (error) {
      if (hasMetricsDataShape(error.response)) {
        setAnalysisResponse(error.response);
      }
      setAnalysisError(error.message || 'Unable to load slow query metrics.');
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    setHealthError('');
    try {
      const response = await fetchSystemHealth();
      setHealthResponse(response);
    } catch (error) {
      setHealthError(error.message || 'Unable to load system health.');
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      setOptionsLoading(true);
      setOptionsError('');
      try {
        const response = await fetchMetricsFilterOptions();
        if (isMounted) setFilterOptions(normalizeFilterOptions(response));
      } catch (error) {
        if (isMounted) setOptionsError(`Filter options failed: ${error.message}`);
      } finally {
        if (isMounted) setOptionsLoading(false);
      }
    };

    loadOptions();
    loadOverviewMetrics(initialFilters);

    return () => {
      isMounted = false;
    };
  }, [initialFilters, loadOverviewMetrics]);

  useEffect(() => {
    if (activeTab === 'queries' && !analysisResponse && !analysisLoading) {
      loadAnalysisMetrics(filters, slowThresholdSeconds);
    }
  }, [
    activeTab,
    analysisResponse,
    analysisLoading,
    filters,
    slowThresholdSeconds,
    loadAnalysisMetrics,
  ]);

  useEffect(() => {
    if (activeTab === 'health' && !healthResponse && !healthLoading) {
      loadHealth();
    }
  }, [activeTab, healthResponse, healthLoading, loadHealth]);

  const handleFilterChange = (patch) => {
    setFilters((current) => {
      const next = { ...current, ...patch };

      if (Object.prototype.hasOwnProperty.call(patch, 'dateRange')) {
        if (patch.dateRange === 'custom') {
          const shouldClearDates = patch.start_date === undefined && patch.end_date === undefined;
          return {
            ...next,
            start_date: shouldClearDates ? '' : next.start_date,
            end_date: shouldClearDates ? '' : next.end_date,
            relative_count: null,
            relative_unit: null,
          };
        }

        const rangeValues = getDateRangeValues(patch.dateRange);
        return { ...next, ...rangeValues };
      }

      if (patch.start_date !== undefined || patch.end_date !== undefined) {
        return {
          ...next,
          dateRange: 'custom',
          relative_count: null,
          relative_unit: null,
        };
      }

      return next;
    });
  };

  const handleApply = () => {
    if (activeTab === 'queries') {
      loadAnalysisMetrics(filters, slowThresholdSeconds);
      return;
    }

    loadOverviewMetrics(filters);
  };

  const handleClear = () => {
    const resetFilters = createDefaultFilters();
    setFilters(resetFilters);
    setSlowThresholdSeconds(30);

    if (activeTab === 'queries') {
      loadAnalysisMetrics(resetFilters, 30);
      return;
    }

    loadOverviewMetrics(resetFilters);
  };

  return (
    <div className="metrics-page">
      <MetricsTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'dashboard' && (
        <>
          <MetricsFilters
            filters={filters}
            filterOptions={filterOptions}
            loading={overviewLoading}
            optionsLoading={optionsLoading}
            optionsError={optionsError}
            onChange={handleFilterChange}
            onApply={handleApply}
            onClear={handleClear}
          />
          <MetricsOverview
            metricsResponse={overviewResponse}
            loading={overviewLoading}
            error={overviewError}
            mode={filters.mode}
          />
        </>
      )}

      {activeTab === 'health' && (
        <SystemHealth
          healthResponse={healthResponse}
          loading={healthLoading}
          error={healthError}
          onRefresh={loadHealth}
        />
      )}

      {activeTab === 'cd-dashboard' && <CDDashboard />}

      {activeTab === 'queries' && (
        <>
          <MetricsFilters
            filters={filters}
            filterOptions={filterOptions}
            loading={analysisLoading}
            optionsLoading={optionsLoading}
            optionsError={optionsError}
            showSlowQueryThreshold
            slowThresholdSeconds={slowThresholdSeconds}
            onChange={handleFilterChange}
            onSlowThresholdChange={setSlowThresholdSeconds}
            onApply={handleApply}
            onClear={handleClear}
          />
          <SlowQueryMonitoring
            metricsResponse={analysisResponse}
            loading={analysisLoading}
            error={analysisError}
            thresholdSeconds={slowThresholdSeconds}
          />
        </>
      )}
    </div>
  );
};

export default MetricsDashboard;
