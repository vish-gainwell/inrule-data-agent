import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchCdDashboardFeedbackWordCloud,
  fetchCdDashboardFilterOptions,
  fetchCdDashboardOverview,
  fetchCdDashboardRuleHistory,
  fetchCdDashboardRules,
} from '../../api/metricsApi';
import CDDashboardBreakdown from './CDDashboard/CDDashboardBreakdown';
import CDDashboardFilters from './CDDashboard/CDDashboardFilters';
import CDDashboardHistoryModal from './CDDashboard/CDDashboardHistoryModal';
import CDDashboardKpis from './CDDashboard/CDDashboardKpis';
import CDDashboardRules from './CDDashboard/CDDashboardRules';
import CDDashboardWorkload from './CDDashboard/CDDashboardWorkload';
import {
  ALL,
  buildParams,
  createDefaultFilters,
  createDefaultRulesPagination,
  extractRules,
  extractRulesPagination,
  getData,
  getPolicyId,
  getRuleId,
  normalizeOptions,
} from './CDDashboard/utils';

const CDDashboard = () => {
  const initialFilters = useMemo(() => createDefaultFilters(), []);
  const [filters, setFilters] = useState(initialFilters);
  const [filterOptions, setFilterOptions] = useState({
    clients: [],
    policies: [],
    users: [],
    categories: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [overviewResponse, setOverviewResponse] = useState(null);
  const [feedbackWordCloudResponse, setFeedbackWordCloudResponse] = useState(null);
  const [feedbackWordCloudLoading, setFeedbackWordCloudLoading] = useState(false);
  const [feedbackWordCloudError, setFeedbackWordCloudError] = useState('');
  const [rulesResponse, setRulesResponse] = useState(null);
  const [rulesPagination, setRulesPagination] = useState(() => createDefaultRulesPagination());
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesError, setRulesError] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [breakdownTab, setBreakdownTab] = useState('statuses');
  const [historyRule, setHistoryRule] = useState(null);
  const [historyResponse, setHistoryResponse] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const overviewData = getData(overviewResponse);
  const overviewAppliedFilters = overviewResponse?.applied_filters || overviewResponse?.data?.applied_filters || filters;
  const kpis = overviewData.kpis || {};
  const clientWorkload = Array.isArray(overviewData.client_workload) ? overviewData.client_workload : [];
  const breakdown = overviewData.workload_breakdown || {};
  const breakdownRows = Array.isArray(breakdown[breakdownTab]) ? breakdown[breakdownTab] : [];
  const rules = extractRules(rulesResponse);
  const rulesPaginationMeta = extractRulesPagination(rulesResponse);
  const historyData = getData(historyResponse);
  const historyItems = Array.isArray(historyData.history) ? historyData.history : [];
  const activeRuleId = historyRule ? getRuleId(historyRule) : '';
  const showResults = !dashboardLoading && !dashboardError && Boolean(overviewResponse || rulesResponse);

  const applyOptionUpdate = useCallback((response, updateFields) => {
    const normalized = normalizeOptions(response);
    setFilterOptions((current) => ({
      clients: updateFields.clients ? normalized.clients : current.clients,
      policies: updateFields.policies ? normalized.policies : current.policies,
      users: updateFields.users ? normalized.users : current.users,
      categories: updateFields.categories ? normalized.categories : current.categories,
    }));
    return normalized;
  }, []);

  const loadFilterOptions = useCallback(async (nextFilters, updateFields = {
    clients: true,
    policies: true,
    users: true,
    categories: true,
  }) => {
    setOptionsLoading(true);
    setOptionsError('');
    try {
      const response = await fetchCdDashboardFilterOptions(buildParams(nextFilters));
      return applyOptionUpdate(response, updateFields);
    } catch (error) {
      setOptionsError(error.message || 'Unable to load CD dashboard filters.');
      return null;
    } finally {
      setOptionsLoading(false);
    }
  }, [applyOptionUpdate]);

  const loadRules = useCallback(async (nextFilters, nextPagination) => {
    setRulesLoading(true);
    setRulesError('');
    try {
      const response = await fetchCdDashboardRules(buildParams(nextFilters, nextPagination));
      setRulesResponse(response);
    } catch (error) {
      setRulesResponse(null);
      setRulesError(error.message || 'Unable to load CD dashboard rules.');
    } finally {
      setRulesLoading(false);
    }
  }, []);

  const buildFeedbackWordCloudParams = useCallback((nextFilters) => {
    const params = {};

    if (nextFilters.client_id) params.client_id = nextFilters.client_id;
    if (nextFilters.policy_file_id) params.policy_file_id = nextFilters.policy_file_id;
    if (nextFilters.date_from) params.date_from = nextFilters.date_from;
    if (nextFilters.date_to) params.date_to = nextFilters.date_to;

    return params;
  }, []);

  const loadDashboard = useCallback(async (nextFilters, nextPagination = createDefaultRulesPagination()) => {
    setDashboardLoading(true);
    setFeedbackWordCloudLoading(true);
    setDashboardError('');
    setRulesError('');
    setFeedbackWordCloudError('');
    try {
      const params = buildParams(nextFilters);
      const [overview, rulesResult, feedbackWordCloudResult] = await Promise.allSettled([
        fetchCdDashboardOverview(params),
        fetchCdDashboardRules(buildParams(nextFilters, nextPagination)),
        fetchCdDashboardFeedbackWordCloud(buildFeedbackWordCloudParams(nextFilters)),
      ]);

      if (overview.status === 'rejected') throw overview.reason;
      if (rulesResult.status === 'rejected') throw rulesResult.reason;

      setOverviewResponse(overview.value);
      setRulesResponse(rulesResult.value);

      if (feedbackWordCloudResult.status === 'fulfilled') {
        setFeedbackWordCloudResponse(feedbackWordCloudResult.value);
      } else {
        setFeedbackWordCloudResponse(null);
        setFeedbackWordCloudError(
          feedbackWordCloudResult.reason?.message || 'Unable to load feedback sentiment.'
        );
      }
      setRulesPagination(nextPagination);
    } catch (error) {
      setOverviewResponse(null);
      setRulesResponse(null);
      setFeedbackWordCloudResponse(null);
      setDashboardError(error.message || 'Unable to load CD dashboard.');
    } finally {
      setDashboardLoading(false);
      setFeedbackWordCloudLoading(false);
    }
  }, [buildFeedbackWordCloudParams]);

  useEffect(() => {
    let isMounted = true;

    const initializeDashboard = async () => {
      const initialOptions = await loadFilterOptions(initialFilters);
      if (!isMounted) return;

      const firstClient = initialOptions?.clients?.[0]?.value || ALL;
      const nextFilters = { ...initialFilters, client_id: firstClient };
      setFilters(nextFilters);

      if (firstClient) {
        await loadFilterOptions(nextFilters, {
          clients: false,
          policies: true,
          users: true,
          categories: false,
        });
      }

      if (isMounted) loadDashboard(nextFilters);
    };

    initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, [initialFilters, loadDashboard, loadFilterOptions]);

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    if (key === 'client_id') {
      next.policy_file_id = ALL;
      next.user_id = ALL;
      next.category = ALL;
      setFilterOptions((current) => ({
        ...current,
        policies: [],
        users: [],
        categories: [],
      }));
      loadFilterOptions(next, {
        clients: false,
        policies: true,
        users: true,
        categories: false,
      });
    }
    if (key === 'policy_file_id' || key === 'user_id') {
      next.category = ALL;
      setFilterOptions((current) => ({
        ...current,
        categories: [],
      }));
      loadFilterOptions(next, {
        clients: false,
        policies: false,
        users: false,
        categories: true,
      });
    }
    setFilters(next);
  };

  const handleApply = () => {
    const resetPagination = createDefaultRulesPagination();
    setRulesPagination(resetPagination);
    loadDashboard(filters, resetPagination);
  };

  const handleClear = () => {
    const firstClient = filterOptions.clients[0]?.value || ALL;
    const resetFilters = { ...createDefaultFilters(), client_id: firstClient };
    const resetPagination = createDefaultRulesPagination();
    setFilters(resetFilters);
    setRulesPagination(resetPagination);
    setFilterOptions((current) => ({
      ...current,
      policies: [],
      users: [],
      categories: [],
    }));
    if (firstClient) {
      loadFilterOptions(resetFilters, {
        clients: false,
        policies: true,
        users: true,
        categories: false,
      });
    }
    loadDashboard(resetFilters, resetPagination);
  };

  const handleRulesPaginationChange = (patch) => {
    const nextPagination = {
      ...rulesPagination,
      ...patch,
    };
    if (patch.page_size || patch.sort_by || patch.sort_order) {
      nextPagination.page = 1;
    }
    setRulesPagination(nextPagination);
    loadRules(filters, nextPagination);
  };

  const openHistory = async (rule) => {
    const ruleId = getRuleId(rule);
    if (!ruleId) return;

    setHistoryRule(rule);
    setHistoryResponse(null);
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const historyParams = {};
      if (rule.client_id || filters.client_id) historyParams.client_id = rule.client_id || filters.client_id;
      if (getPolicyId(rule) || filters.policy_file_id) historyParams.policy_file_id = getPolicyId(rule) || filters.policy_file_id;
      if (rule.run_id) historyParams.run_id = rule.run_id;
      const response = await fetchCdDashboardRuleHistory(ruleId, historyParams);
      setHistoryResponse(response);
    } catch (error) {
      setHistoryError(error.message || 'Unable to load rule history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistory = () => {
    setHistoryRule(null);
    setHistoryResponse(null);
    setHistoryError('');
  };

  return (
    <div className="cd-dashboard-suite">
      <CDDashboardFilters
        filters={filters}
        filterOptions={filterOptions}
        optionsLoading={optionsLoading}
        optionsError={optionsError}
        dashboardLoading={dashboardLoading}
        onChange={handleFilterChange}
        onApply={handleApply}
        onClear={handleClear}
      />

      {dashboardError && <div className="metrics-inline-status error">{dashboardError}</div>}
      {dashboardLoading && <div className="metrics-inline-status">Loading CD dashboard...</div>}

      {showResults && (
        <>
          <CDDashboardKpis
            kpis={kpis}
            feedbackWordCloud={feedbackWordCloudResponse}
            feedbackLoading={feedbackWordCloudLoading}
            feedbackError={feedbackWordCloudError}
          />

          <div className="cd-workbench-middle">
            <CDDashboardWorkload
              clientWorkload={clientWorkload}
              clientOptions={filterOptions.clients}
              filters={overviewAppliedFilters}
            />
            <CDDashboardBreakdown
              breakdownTab={breakdownTab}
              breakdownRows={breakdownRows}
              onTabChange={setBreakdownTab}
            />
          </div>

          <CDDashboardRules
            rules={rules}
            loading={rulesLoading}
            error={rulesError}
            pagination={rulesPagination}
            paginationMeta={rulesPaginationMeta}
            activeRuleId={activeRuleId}
            onPaginationChange={handleRulesPaginationChange}
            onOpenHistory={openHistory}
          />
        </>
      )}

      <CDDashboardHistoryModal
        historyRule={historyRule}
        historyData={historyData}
        historyItems={historyItems}
        historyLoading={historyLoading}
        historyError={historyError}
        onClose={closeHistory}
      />
    </div>
  );
};

export default CDDashboard;
