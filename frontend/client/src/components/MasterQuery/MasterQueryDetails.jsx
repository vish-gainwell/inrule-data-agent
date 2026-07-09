import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import {
  getMasterQueryFinalizeQueryUrl,
  getMasterQueryGenerateQueryUrl,
  getMasterQueryInsightsUrl,
  getMasterQueryRegenerateQueryUrl,
  resolveUserId,
} from '../../config/apiConfig';
import MasterQueryDocumentation from './MasterQueryDocumentation';

const tabs = [
  { key: 'details', label: 'Query Details' },
  { key: 'insights', label: 'Query Insights' },
  { key: 'documentation', label: 'Query Documentation' },
];

const displayValue = (value) =>
  value === null || value === undefined || String(value).trim() === '' ? '-' : value;

const MONEY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const CLIENT_POLICY_MANUAL_URLS = {
  'TX~RAC': 'https://www.tmhp.com/resources/provider-manuals/tmppm',
  'CO~RAC': 'https://hcpf.colorado.gov/billing-manuals',
};

const normalizeClientPolicyManualKey = (value) =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s_-]+/g, '~');

const getClientPolicyManualUrl = (client) => {
  const clientKey = (
    typeof client === 'string'
      ? client
      : client?.client_id || client?.clientId || client?.id || client?.name || ''
  );

  return CLIENT_POLICY_MANUAL_URLS[normalizeClientPolicyManualKey(clientKey)] || '';
};

const getPolicyDetails = (details) => {
  if (Array.isArray(details?.policy_details)) return details.policy_details;
  if (Array.isArray(details?.policyDetails)) return details.policyDetails;
  if (Array.isArray(details?.policy_insights)) return details.policy_insights;
  return [];
};

const getPolicyInsights = (insights) => {
  if (Array.isArray(insights?.policy_insights)) return insights.policy_insights;
  if (Array.isArray(insights?.policyInsights)) return insights.policyInsights;
  return [];
};

const getPolicyInsightName = (policy, index) =>
  displayValue(
    policy?.policy_name ||
      policy?.policyName ||
      policy?.policy_title ||
      policy?.policyTitle ||
      policy?.title ||
      policy?.name ||
      `Policy ${index + 1}`
  );

const getAssociatedPolicies = (details) => {
  if (Array.isArray(details?.associated_policies)) return details.associated_policies;
  if (Array.isArray(details?.associatedPolicies)) return details.associatedPolicies;
  return [];
};

const getAssociatedPolicyLabel = (policy, index) => {
  if (policy === null || policy === undefined) return `Policy ${index + 1}`;
  if (typeof policy !== 'object') return displayValue(policy);

  const policyId =
    policy.policy_id ||
    policy.policyId ||
    policy.id ||
    policy.policy_code ||
    policy.policyCode ||
    '';
  const policyName =
    policy.policy_name ||
    policy.policyName ||
    policy.title ||
    policy.name ||
    policy.description ||
    '';

  if (policyId && policyName) return `${policyId} - ${policyName}`;
  return displayValue(policyName || policyId || `Policy ${index + 1}`);
};

const getPolicyTitle = (policy, index) =>
  displayValue(
    policy?.policy_title ||
      policy?.policyTitle ||
      policy?.policy_name ||
      policy?.policyName ||
      policy?.title ||
      policy?.name ||
      `Policy ${index + 1}`
  );

const getPolicyStatement = (policy) =>
  displayValue(
    policy?.policy_support ||
      policy?.policySupport ||
      policy?.support_statement ||
      policy?.supportStatement ||
      policy?.statement ||
      policy?.analyst_query ||
      policy?.analystQuery ||
      policy?.details
  );

const formatListText = (value) => {
  if (Array.isArray(value)) return value.length ? value.join('\n') : '-';
  return displayValue(value);
};

const getPolicySourceLine = (policy) => {
  const source =
    policy?.source_details ||
    policy?.sourceDetails ||
    policy?.source_line ||
    policy?.sourceLine ||
    policy?.sources ||
    policy?.source;

  if (Array.isArray(source)) {
    return source.length ? `Source details: ${source.join(', ')}` : '';
  }

  const pages = policy?.pages || policy?.source_pages || policy?.sourcePages;
  if (Array.isArray(pages) && pages.length) {
    return `Source details: Pages ${pages.join(', ')}`;
  }

  return source ? `Source details: ${source}` : '';
};

const getErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    return payload?.detail || payload?.message || JSON.stringify(payload);
  } catch (parseErr) {
    return response.statusText || 'Request failed.';
  }
};

const getSessionId = (session) => session?.session_id || session?.id || '';

const getMasterQueryPostHeaders = ({ account, client, session }) => {
  const userId = resolveUserId(account);
  const tenantId = client || '';
  const sessionId = getSessionId(session);
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (userId) headers['X-User-Id'] = userId;
  if (tenantId) headers['X-Tenant-Id'] = tenantId;
  if (sessionId) headers['X-Session-Id'] = sessionId;

  return headers;
};

const isGenerationFailed = (payload) => {
  const status = String(payload?.generation_status || '').trim().toLowerCase();
  return Boolean(payload?.error_message) || status === 'failed' || status === 'error';
};

const isFinalizedStatus = (status) => String(status || '').trim().toUpperCase() === 'FINALIZED';

const POLICY_COLOR_PALETTE = [
  { bg: '#e8f3ff', border: '#1677c6', text: '#0b4f86' },
  { bg: '#eaf7ef', border: '#2f8f4e', text: '#1d5f34' },
  { bg: '#fff3df', border: '#c97916', text: '#7a4308' },
  { bg: '#f4ecff', border: '#7b55c7', text: '#52348c' },
  { bg: '#e7f7f8', border: '#16858e', text: '#0c5a61' },
  { bg: '#fdecef', border: '#c93d5d', text: '#86243b' },
  { bg: '#eef1f5', border: '#607089', text: '#39465a' },
  { bg: '#f0f5df', border: '#7d8f20', text: '#4f5d12' },
];

const getPolicyColor = (index) => POLICY_COLOR_PALETTE[index % POLICY_COLOR_PALETTE.length];

const getPolicyColorStyle = (color) => ({
  '--mq-policy-bg': color.bg,
  '--mq-policy-border': color.border,
  '--mq-policy-text': color.text,
});

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '-';
  return MONEY_FORMATTER.format(amount);
};

const formatExemptions = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '-';
  if (amount === 0) return MONEY_FORMATTER.format(0);
  return `- ${MONEY_FORMATTER.format(Math.abs(amount))}`;
};

const emptyFinalizeForm = {
  finalCombinedAnalystQuery: '',
  finalSqlQuery: '',
  grossOpportunity: '',
  exemptions: '',
  netOpportunity: '',
  reviewDocumentUrl: '',
};

const emptyRegenerateForm = {
  combinedAnalystQuery: '',
  sqlQuery: '',
};

const QUERY_GENERATION_HELPER_TEXT =
  'Execution in process. Generating the query for the first time or regenerating it may take approximately 1 to 2 minutes.';

const QueryGenerationHelperText = () => (
  <p className="mq-loading-helper-text">
    <svg className="mq-loading-helper-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
    <span>{QUERY_GENERATION_HELPER_TEXT}</span>
  </p>
);

const toEditableNumber = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return '';
  return String(value);
};

const toPayloadNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeCombinedAnalystQuery = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (item && typeof item === 'object') {
        return {
          statement: displayValue(item.statement || item.analyst_query || item.query || item.details),
          source: displayValue(item.source || item.policy_name || item.policyName || item.policy || 'Base Analyst Query'),
        };
      }

      return {
        statement: displayValue(item),
        source: 'Base Analyst Query',
      };
    });
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (!trimmedValue) return [];

    try {
      const parsedValue = JSON.parse(trimmedValue);
      if (Array.isArray(parsedValue)) return normalizeCombinedAnalystQuery(parsedValue);
    } catch (err) {
      return [
        {
          statement: trimmedValue,
          source: 'Base Analyst Query',
        },
      ];
    }

    return [
      {
        statement: trimmedValue,
        source: 'Base Analyst Query',
      },
    ];
  }

  return [];
};

const formatCombinedAnalystQueryText = (value) => {
  const entries = normalizeCombinedAnalystQuery(value);
  if (!entries.length) return '';

  return entries
    .map((entry, index) => `${index + 1}. [${entry.source}] ${entry.statement}`)
    .join('\n');
};

const formatCombinedAnalystQueryJson = (value) =>
  JSON.stringify(
    normalizeCombinedAnalystQuery(value).map((entry) => ({
      statement: entry.statement === '-' ? '' : String(entry.statement),
      source: entry.source === '-' ? '' : String(entry.source || 'Base Analyst Query'),
    })),
    null,
    2
  );

const parseCombinedAnalystQueryJson = (value) => {
  let parsedValue;

  try {
    parsedValue = JSON.parse(value);
  } catch (err) {
    throw new Error('Combined Analyst Query must be valid JSON.');
  }

  if (!Array.isArray(parsedValue)) {
    throw new Error('Combined Analyst Query must be a JSON array.');
  }

  return parsedValue.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`Combined Analyst Query item ${index + 1} must be an object.`);
    }

    const statement = String(item.statement || '').trim();
    const source = String(item.source || 'Base Analyst Query').trim();

    if (!statement) {
      throw new Error(`Combined Analyst Query item ${index + 1} must include a statement.`);
    }

    return {
      statement,
      source: source || 'Base Analyst Query',
    };
  });
};

const MasterQueryDetails = ({ query, details, isLoading, errorDetail, client, session, onBack }) => {
  const { account } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [insights, setInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState('');
  const [generatedQuery, setGeneratedQuery] = useState(null);
  const [isLoadingGeneratedQuery, setIsLoadingGeneratedQuery] = useState(false);
  const [generatedQueryError, setGeneratedQueryError] = useState('');
  const [isRegeneratingQuery, setIsRegeneratingQuery] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [finalizeForm, setFinalizeForm] = useState(emptyFinalizeForm);
  const [isFinalizingQuery, setIsFinalizingQuery] = useState(false);
  const [finalizeError, setFinalizeError] = useState('');
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [regenerateForm, setRegenerateForm] = useState(emptyRegenerateForm);
  const [regenerateError, setRegenerateError] = useState('');

  useEffect(() => {
    setInsights(null);
    setInsightsError('');
    setIsLoadingInsights(false);
    setGeneratedQuery(null);
    setGeneratedQueryError('');
    setIsLoadingGeneratedQuery(false);
    setIsRegeneratingQuery(false);
    setCopyStatus('');
    setIsFinalizeModalOpen(false);
    setFinalizeForm(emptyFinalizeForm);
    setIsFinalizingQuery(false);
    setFinalizeError('');
    setIsRegenerateModalOpen(false);
    setRegenerateForm(emptyRegenerateForm);
    setRegenerateError('');
    setActiveTab('details');
  }, [query?.id, client]);

  useEffect(() => {
    if (!toast.open) return undefined;
    const timeoutId = window.setTimeout(() => {
      setToast((current) => ({ ...current, open: false }));
    }, 4000);
    return () => window.clearTimeout(timeoutId);
  }, [toast.open]);

  const loadInsights = useCallback(
    async (signal) => {
      if (!query?.id) return null;

      setIsLoadingInsights(true);
      setInsightsError('');

      try {
        const response = await fetch(getMasterQueryInsightsUrl(query.id, client), {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          signal,
        });

        if (!response.ok) {
          const message = await getErrorMessage(response);
          setInsightsError(message);
          setInsights(null);
          return null;
        }

        const payload = await response.json();
        setInsights(payload);
        return payload;
      } catch (err) {
        if (signal?.aborted) return null;
        setInsightsError(err?.message || 'Failed to load query insights.');
        setInsights(null);
        return null;
      } finally {
        if (!signal?.aborted) {
          setIsLoadingInsights(false);
        }
      }
    },
    [client, query?.id]
  );

  useEffect(() => {
    if (activeTab !== 'insights' || !query?.id || insights || insightsError) {
      return undefined;
    }

    const controller = new AbortController();

    loadInsights(controller.signal);

    return () => controller.abort();
  }, [activeTab, insights, insightsError, loadInsights, query?.id]);

  useEffect(() => {
    if (
      activeTab !== 'insights' ||
      !query?.id ||
      generatedQuery ||
      generatedQueryError
    ) {
      return undefined;
    }

    const controller = new AbortController();

    const fetchGeneratedQuery = async () => {
      setIsLoadingGeneratedQuery(true);
      setGeneratedQueryError('');

      try {
        const response = await fetch(getMasterQueryGenerateQueryUrl(query.id, client), {
          method: 'POST',
          headers: getMasterQueryPostHeaders({ account, client, session }),
          signal: controller.signal,
        });

        if (!response.ok) {
          setGeneratedQueryError(await getErrorMessage(response));
          setGeneratedQuery(null);
          return;
        }

        const payload = await response.json();
        if (isGenerationFailed(payload)) {
          setGeneratedQueryError(payload?.error_message || 'Failed to generate SQL query.');
        }
        setGeneratedQuery(payload);
      } catch (err) {
        if (controller.signal.aborted) return;
        setGeneratedQueryError(err?.message || 'Failed to generate SQL query.');
        setGeneratedQuery(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingGeneratedQuery(false);
        }
      }
    };

    fetchGeneratedQuery();

    return () => controller.abort();
  }, [
    account,
    activeTab,
    client,
    generatedQuery,
    generatedQueryError,
    query?.id,
    session,
  ]);

  const handleOpenRegenerateModal = () => {
    setRegenerateForm({
      combinedAnalystQuery: formatCombinedAnalystQueryJson(generatedQuery?.combined_analyst_query),
      sqlQuery: String(generatedQuery?.sql_query || ''),
    });
    setRegenerateError('');
    setIsRegenerateModalOpen(true);
  };

  const handleRegenerateFieldChange = (field, value) => {
    setRegenerateForm((current) => ({ ...current, [field]: value }));
  };

  const handleCloseRegenerateModal = () => {
    if (isRegeneratingQuery) return;
    const shouldClose = window.confirm('Changes will not be saved. Close without saving?');
    if (!shouldClose) return;
    setIsRegenerateModalOpen(false);
    setRegenerateError('');
  };

  const handleRegenerateQuery = async () => {
    if (!query?.id || isRegeneratingQuery) return;

    let combinedAnalystQuery;
    try {
      combinedAnalystQuery = parseCombinedAnalystQueryJson(regenerateForm.combinedAnalystQuery);
    } catch (err) {
      setRegenerateError(err?.message || 'Combined Analyst Query is invalid.');
      return;
    }

    setIsRegeneratingQuery(true);
    setRegenerateError('');
    setGeneratedQueryError('');

    try {
      const response = await fetch(getMasterQueryRegenerateQueryUrl(query.id, client), {
        method: 'POST',
        headers: getMasterQueryPostHeaders({ account, client, session }),
        body: JSON.stringify({
          combined_analyst_query: combinedAnalystQuery,
          sql_query: regenerateForm.sqlQuery,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const payload = await response.json();
      if (isGenerationFailed(payload)) {
        throw new Error(payload?.error_message || 'Failed to regenerate SQL query.');
      }

      setGeneratedQuery((current) => ({
        ...(current || {}),
        ...payload,
        combined_analyst_query:
          payload?.combined_analyst_query || combinedAnalystQuery,
        sql_query: payload?.sql_query || regenerateForm.sqlQuery,
      }));
      setIsRegenerateModalOpen(false);
      setToast({
        open: true,
        message: 'Query regenerated successfully.',
        severity: 'success',
      });
    } catch (err) {
      const message = err?.message || 'Failed to regenerate SQL query.';
      setRegenerateError(message);
      setToast({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setIsRegeneratingQuery(false);
    }
  };

  const handleCopySql = async () => {
    const text = String(generatedQuery?.sql_query || '').trim();
    if (!text) return;

    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setCopyStatus('Copied');
        window.setTimeout(() => setCopyStatus(''), 2000);
        return;
      } catch (err) {
        // Fall through to the legacy copy path.
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopyStatus('Copied');
      window.setTimeout(() => setCopyStatus(''), 2000);
    } finally {
      document.body.removeChild(textarea);
    }
  };

const handleOpenFinalizeModal = () => {
    const opportunitySizing = generatedQuery?.opportunity_sizing || {};
    setFinalizeForm({
      finalCombinedAnalystQuery: formatCombinedAnalystQueryJson(generatedQuery?.combined_analyst_query),
      finalSqlQuery: String(generatedQuery?.sql_query || ''),
      grossOpportunity: toEditableNumber(opportunitySizing.gross_opportunity),
      exemptions: toEditableNumber(opportunitySizing.exemptions),
      netOpportunity: toEditableNumber(opportunitySizing.net_opportunity),
      reviewDocumentUrl: String(generatedQuery?.review_document_url || query?.reviewDocumentUrl || ''),
    });
    setFinalizeError('');
    setIsFinalizeModalOpen(true);
  };

  const handleFinalizeFieldChange = (field, value) => {
    setFinalizeForm((current) => ({ ...current, [field]: value }));
  };

  const handleCloseFinalizeModal = () => {
    if (isFinalizingQuery) return;
    const shouldClose = window.confirm('Changes will not be saved. Close without saving?');
    if (!shouldClose) return;
    setIsFinalizeModalOpen(false);
    setFinalizeError('');
  };

  const handleFinalizeQuery = async () => {
    if (!query?.id || isFinalizingQuery) return;

    let finalCombinedAnalystQuery;
    try {
      finalCombinedAnalystQuery = parseCombinedAnalystQueryJson(
        finalizeForm.finalCombinedAnalystQuery
      );
    } catch (err) {
      setFinalizeError(err?.message || 'Combined Analyst Query is invalid.');
      return;
    }

    setIsFinalizingQuery(true);
    setFinalizeError('');
    try {
      const userId = resolveUserId(account);
      const response = await fetch(getMasterQueryFinalizeQueryUrl(query.id, client), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          final_combined_analyst_query: finalCombinedAnalystQuery,
          final_sql_query: finalizeForm.finalSqlQuery,
          opportunity_sizing: {
            gross_opportunity: toPayloadNumber(finalizeForm.grossOpportunity),
            exemptions: toPayloadNumber(finalizeForm.exemptions),
            net_opportunity: toPayloadNumber(finalizeForm.netOpportunity),
          },
          review_document_url: finalizeForm.reviewDocumentUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const payload = await response.json();
      setGeneratedQuery((current) => ({
        ...(current || {}),
        ...payload,
        combined_analyst_query:
          payload?.combined_analyst_query || finalCombinedAnalystQuery,
        sql_query: payload?.sql_query || finalizeForm.finalSqlQuery,
      }));
      await loadInsights();
      setIsFinalizeModalOpen(false);
      setToast({
        open: true,
        message: 'Query finalized successfully.',
        severity: 'success',
      });
    } catch (err) {
      setFinalizeError(err?.message || 'Failed to finalize query.');
    } finally {
      setIsFinalizingQuery(false);
    }
  };

  return (
    <section className="mq-details-section">
      {toast.open ? (
        <div className={`mq-toast mq-toast-${toast.severity}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      ) : null}
      <div className="mq-detail-heading">
        <h2>{displayValue(query.title)}</h2>
        {query.status ? <span className="mq-status-badge mq-status-accept">{query.status}</span> : null}
      </div>

      <div className="mq-policy-tabs" role="tablist" aria-label="Master query detail tabs">
        <button type="button" className="mq-btn-back-to-overview" onClick={onBack}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Query List
        </button>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            className={`mq-policy-tab-btn${activeTab === tab.key ? ' active' : ''}`}
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-indicator" role="status" aria-live="polite">
          Loading query details...
        </div>
      ) : null}
      {!isLoading && errorDetail ? (
        <div className="error-detail" role="alert">
          {errorDetail}
        </div>
      ) : null}

      {!isLoading && !errorDetail && activeTab === 'details' ? (
        <QueryDetailsTab query={query} details={details} client={client} />
      ) : null}
      {!isLoading && !errorDetail && activeTab === 'insights' ? (
        <QueryInsightsTab
          insights={insights}
          isLoading={isLoadingInsights}
          errorDetail={insightsError}
          generatedQuery={generatedQuery}
          isLoadingGeneratedQuery={isLoadingGeneratedQuery}
          generatedQueryError={generatedQueryError}
          isRegeneratingQuery={isRegeneratingQuery}
          copyStatus={copyStatus}
          onRegenerateQuery={handleOpenRegenerateModal}
          onCopySql={handleCopySql}
          onOpenFinalizeModal={handleOpenFinalizeModal}
        />
      ) : null}
      {!isLoading && !errorDetail && activeTab === 'documentation' ? (
        <MasterQueryDocumentation
          queryId={query?.id}
          client={client}
          setToast={setToast}
        />
      ) : null}
      {isFinalizeModalOpen ? (
        <FinalizeQueryModal
          form={finalizeForm}
          errorDetail={finalizeError}
          isSaving={isFinalizingQuery}
          onChange={handleFinalizeFieldChange}
          onClose={handleCloseFinalizeModal}
          onFinalize={handleFinalizeQuery}
        />
      ) : null}
      {isRegenerateModalOpen ? (
        <RegenerateQueryModal
          form={regenerateForm}
          errorDetail={regenerateError}
          isSaving={isRegeneratingQuery}
          onChange={handleRegenerateFieldChange}
          onClose={handleCloseRegenerateModal}
          onRegenerate={handleRegenerateQuery}
        />
      ) : null}
    </section>
  );
};

const QueryDetailsTab = ({ query, details, client }) => {
  const policyDetails = getPolicyDetails(details);
  const associatedPolicies = getAssociatedPolicies(details);
  const policyManualUrl = getClientPolicyManualUrl(client);
  const [expandedPolicies, setExpandedPolicies] = useState(() => new Set());

  const togglePolicy = (policyKey) => {
    setExpandedPolicies((current) => {
      const next = new Set(current);
      if (next.has(policyKey)) {
        next.delete(policyKey);
      } else {
        next.add(policyKey);
      }
      return next;
    });
  };

  return (
    <div className="mq-policy-tab-content active">
      <div className="mq-validation-card">
        <DetailBlock title="Query ID">
          <p>{displayValue(details?.id ?? query.id)}</p>
        </DetailBlock>

        <DetailBlock title="Associated Policies">
          {associatedPolicies.length ? (
            <div className="mq-policy-tags">
              {associatedPolicies.map((policy, index) => {
                const policyLabel = getAssociatedPolicyLabel(policy, index);

                return policyManualUrl ? (
                  <a
                    key={`${policyLabel}-${index}`}
                    href={policyManualUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mq-policy-tag-link"
                  >
                    {policyLabel}
                  </a>
                ) : (
                  <span key={`${policyLabel}-${index}`}>{policyLabel}</span>
                );
              })}
            </div>
          ) : (
            <p>-</p>
          )}
        </DetailBlock>

        <DetailBlock title="Query Description">
          <p>{displayValue(details?.description ?? query.description)}</p>
        </DetailBlock>

        <DetailBlock title="Policy Details">
          {policyDetails.length ? (
            <div className="policy-list">
              {policyDetails.map((policy, index) => {
                const policyTitle = getPolicyTitle(policy, index);
                const policyKey = `${policyTitle}-${index}`;
                const isExpanded = expandedPolicies.has(policyKey);
                const sourceLine = getPolicySourceLine(policy);
                return (
                  <article className={`policy-card${isExpanded ? ' expanded' : ''}`} key={policyKey}>
                    <button
                      type="button"
                      className="policy-card-header policy-card-toggle"
                      aria-expanded={isExpanded}
                      onClick={() => togglePolicy(policyKey)}
                    >
                      <span className="policy-title">{policyTitle}</span>
                      <span className="rank">
                        Policy {index + 1} of {policyDetails.length}
                        <span className="policy-expand-icon" aria-hidden="true">
                          {isExpanded ? '-' : '+'}
                        </span>
                      </span>
                    </button>
                    {isExpanded ? (
                      <div className="policy-card-body">
                        <label>Policy Support</label>
                        <div className="statement">{getPolicyStatement(policy)}</div>
                        {sourceLine ? <div className="source-line">{sourceLine}</div> : null}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <p>No policy details available.</p>
          )}
        </DetailBlock>
      </div>
    </div>
  );
};

const QueryInsightsTab = ({
  insights,
  isLoading,
  errorDetail,
  generatedQuery,
  isLoadingGeneratedQuery,
  generatedQueryError,
  isRegeneratingQuery,
  copyStatus,
  onRegenerateQuery,
  onCopySql,
  onOpenFinalizeModal,
}) => {
  const policyInsights = getPolicyInsights(insights);
  const baseQuery = insights?.base_analyst_query || {};
  const opportunitySizing = insights?.opportunity_sizing;
  const hasOpportunitySizing =
    opportunitySizing &&
    typeof opportunitySizing === 'object' &&
    !Array.isArray(opportunitySizing);
  const isFinalized = isFinalizedStatus(insights?.status || generatedQuery?.status);
  const combinedAnalystQuery = normalizeCombinedAnalystQuery(generatedQuery?.combined_analyst_query);
  const combinedQuerySources = Array.from(
    new Set(
      combinedAnalystQuery
        .map((item) => item.source)
        .filter((source) => source && source !== '-')
    )
  );
  const policyNames = Array.from(
    new Set(
      policyInsights
        .map((policy, index) => getPolicyInsightName(policy, index))
        .filter((name) => name && name !== '-')
    )
  );
  const combinedSourceNames = combinedQuerySources.length ? combinedQuerySources : policyNames;
  const sourceColorMap = combinedSourceNames.reduce((map, source, index) => {
    map[source] = getPolicyColor(index);
    return map;
  }, {});

  return (
    <div className="mq-policy-tab-content active">
      <div className="mq-validation-card">
        {isLoading ? (
          <div className="loading-indicator" role="status" aria-live="polite">
            Loading query insights...
          </div>
        ) : null}
        {!isLoading && errorDetail ? (
          <div className="error-detail" role="alert">
            {errorDetail}
          </div>
        ) : null}
        {!isLoading && !errorDetail ? (
          <>
            <InsightBlock
              title="Base Analyst Query"
              copy="The foundational analyst query derived from the raw rule definition. This captures the core overpayment logic before exemptions are applied."
            >
              <div className="mq-base-query-grid">
                <div className="mq-base-query-item">
                  <h5>Professional</h5>
                  <pre className="mq-code-block">{displayValue(baseQuery.professional)}</pre>
                </div>
                <div className="mq-base-query-item">
                  <h5>Institutional</h5>
                  <pre className="mq-code-block">{displayValue(baseQuery.institutional)}</pre>
                </div>
              </div>
            </InsightBlock>

            <InsightBlock title="Policy Insights" copy="Client policy-driven analyst query support.">
              {policyInsights.length ? (
                <PolicyInsightList policies={policyInsights} />
              ) : (
                <p>No policy insights available.</p>
              )}
            </InsightBlock>
          </>
        ) : null}

        {isLoadingGeneratedQuery ? (
          <div className="mq-loading-with-helper">
            <div className="loading-indicator" role="status" aria-live="polite">
              Generating combined query and SQL...
            </div>
            <QueryGenerationHelperText />
          </div>
        ) : null}
        {!isLoadingGeneratedQuery && generatedQueryError ? (
          <div className="error-detail" role="alert">
            {generatedQueryError}
          </div>
        ) : null}
        {!isLoadingGeneratedQuery && generatedQuery ? (
          <>
            <InsightBlock
              title="Combined Client Policy-Driven Analyst Queries"
              copy="Consolidated analyst queries that incorporate all identified client-specific policy exemptions and limitations into a single unified query logic."
              action={
                isFinalized ? (
                  <span className="mq-finalized-status">FINALIZED</span>
                ) : (
                  <button
                    type="button"
                    className="mq-btn-small-primary"
                    disabled={!combinedAnalystQuery.length || !generatedQuery?.sql_query}
                    onClick={onOpenFinalizeModal}
                  >
                    Create Final Query
                  </button>
                )
              }
            >
              <div className="mq-soft-box">
                {combinedSourceNames.length ? (
                  <div className="mq-policy-tags mq-policy-tags-compact">
                    {combinedSourceNames.map((policyName) => (
                      <span
                        key={policyName}
                        className="mq-source-policy-tag"
                        style={getPolicyColorStyle(sourceColorMap[policyName])}
                      >
                        {policyName}
                      </span>
                    ))}
                  </div>
                ) : null}
                <CombinedAnalystQueryList
                  entries={combinedAnalystQuery}
                  sourceColorMap={sourceColorMap}
                />
              </div>
            </InsightBlock>

            <InsightBlock
              title="SQL Query Generation"
              copy="SQL queries incorporate all identified limitations above the base master query. Users may modify exemption/limitation parameters and regenerate."
            >
              <pre className="mq-sql-query-block">{displayValue(generatedQuery.sql_query)}</pre>
              {isRegeneratingQuery ? (
                <div className="mq-loading-with-helper mq-inline-loading">
                  <div className="loading-indicator" role="status" aria-live="polite">
                    Regenerating SQL query...
                  </div>
                  <QueryGenerationHelperText />
                </div>
              ) : null}
              <div className="mq-query-actions">
                <button
                  type="button"
                  className="mq-btn-small-primary"
                  disabled={isRegeneratingQuery}
                  onClick={onRegenerateQuery}
                >
                  {isRegeneratingQuery ? 'Regenerating...' : 'Regenerate Query'}
                </button>
                <button
                  type="button"
                  className="mq-btn-small-secondary"
                  disabled={!generatedQuery?.sql_query}
                  onClick={onCopySql}
                >
                  {copyStatus || 'Copy SQL'}
                </button>
              </div>
            </InsightBlock>
          </>
        ) : null}

        {hasOpportunitySizing ? (
          <InsightBlock
            title="Opportunity Sizing"
            copy="Initial opportunity sizing incorporates all identified limitations. Values update when exemptions/limitations are modified and queries are regenerated."
          >
            <div className="mq-opportunity-sizing-grid">
              <div className="mq-opportunity-sizing-card">
                <div className="mq-opportunity-sizing-value">
                  {formatMoney(opportunitySizing.gross_opportunity)}
                </div>
                <div className="mq-opportunity-sizing-label">Gross Opportunity</div>
              </div>
              <div className="mq-opportunity-sizing-card">
                <div className="mq-opportunity-sizing-value mq-opportunity-exemptions">
                  {formatExemptions(opportunitySizing.exemptions)}
                </div>
                <div className="mq-opportunity-sizing-label">Exemptions</div>
              </div>
              <div className="mq-opportunity-sizing-card mq-opportunity-sizing-card-net">
                <div className="mq-opportunity-sizing-value mq-opportunity-net">
                  {formatMoney(opportunitySizing.net_opportunity)}
                </div>
                <div className="mq-opportunity-sizing-label">Net Opportunity</div>
              </div>
            </div>
          </InsightBlock>
        ) : null}

        {!isLoadingGeneratedQuery && !generatedQuery && !generatedQueryError ? (
          <div className="mq-alert mq-alert-info">
            Combined query and SQL generation has not returned content yet.
          </div>
        ) : null}

      </div>
    </div>
  );
};

const CombinedAnalystQueryList = ({ entries, sourceColorMap }) => {
  if (!entries.length) {
    return <p>-</p>;
  }

  const groupedEntries = entries.reduce((groups, entry, index) => {
    const source = entry.source || 'Base Analyst Query';
    const existingGroup = groups.find((group) => group.source === source);
    const item = { ...entry, displayIndex: index + 1 };

    if (existingGroup) {
      existingGroup.entries.push(item);
      return groups;
    }

    groups.push({
      source,
      entries: [item],
    });
    return groups;
  }, []);

  return (
    <ol className="mq-combined-query-list">
      {groupedEntries.map((group, index) => {
        const sourceColor = sourceColorMap[group.source] || getPolicyColor(index);

        return (
          <li
            key={`${group.source}-${index}`}
            className="mq-combined-query-item"
            style={getPolicyColorStyle(sourceColor)}
          >
            {group.entries.map((entry) => (
              <p key={`${group.source}-${entry.displayIndex}-${entry.statement}`}>
                {entry.displayIndex}. {entry.statement}
              </p>
            ))}
          </li>
        );
      })}
    </ol>
  );
};

const PolicyInsightList = ({ policies }) => {
  const [expandedPolicies, setExpandedPolicies] = useState(() => new Set());

  const togglePolicy = (policyKey) => {
    setExpandedPolicies((current) => {
      const next = new Set(current);
      if (next.has(policyKey)) {
        next.delete(policyKey);
      } else {
        next.add(policyKey);
      }
      return next;
    });
  };

  return (
    <div className="policy-list">
      {policies.map((policy, index) => {
        const policyTitle = getPolicyTitle(policy, index);
        const policyKey = `${policyTitle}-${index}`;
        const isExpanded = expandedPolicies.has(policyKey);

        return (
          <article className={`policy-card${isExpanded ? ' expanded' : ''}`} key={policyKey}>
            <button
              type="button"
              className="policy-card-header policy-card-toggle"
              aria-expanded={isExpanded}
              onClick={() => togglePolicy(policyKey)}
            >
              <span className="policy-title">{policyTitle}</span>
              <span className="rank">
                Policy {index + 1} of {policies.length}
                <span className="policy-expand-icon" aria-hidden="true">
                  {isExpanded ? '-' : '+'}
                </span>
              </span>
            </button>
            {isExpanded ? (
              <div className="policy-card-body">
                <div className="mq-context-block single-block">
                  <div className="mq-context-box">
                    <div className="mq-insight-detail-group">
                      <strong>Limitations:</strong>
                      <p>{formatListText(policy?.limitations)}</p>
                    </div>
                    <div className="mq-insight-detail-group">
                      <strong>Exceptions:</strong>
                      <p>{formatListText(policy?.exceptions)}</p>
                    </div>
                    <div className="mq-insight-detail-group">
                      <strong>Additional Details:</strong>
                      <p>{formatListText(policy?.additional_details || policy?.additionalDetails)}</p>
                    </div>
                  </div>
                </div>
                <label>Analyst Query</label>
                <pre className="mq-code-block">{displayValue(policy?.analyst_query)}</pre>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
};

const DetailBlock = ({ title, children }) => (
  <div className="mq-detail-block">
    <h4>{title}</h4>
    {children}
  </div>
);

const InsightBlock = ({ title, copy, action, children }) => (
  <section className="mq-insight-block">
    <div className="mq-insight-block-header">
      <h4>{title}</h4>
      {action ? <div className="mq-insight-block-action">{action}</div> : null}
    </div>
    <p>{copy}</p>
    {children}
  </section>
);

const FinalizeQueryModal = ({
  form,
  errorDetail,
  isSaving,
  onChange,
  onClose,
  onFinalize,
}) => (
  <div className="mq-modal-overlay" role="presentation" onClick={onClose}>
    <div
      className="mq-finalize-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mq-finalize-modal-title"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mq-finalize-modal-header">
        <h3 id="mq-finalize-modal-title">Create Final Query</h3>
        <button
          type="button"
          className="mq-modal-close"
          onClick={onClose}
          aria-label="Close finalize query modal"
          disabled={isSaving}
        >
          &times;
        </button>
      </div>
      <div className="mq-finalize-modal-body">
        <div className="mq-finalize-field">
          <label htmlFor="mq-final-combined-query">Combined Analyst Query</label>
          <textarea
            id="mq-final-combined-query"
            value={form.finalCombinedAnalystQuery}
            onChange={(event) => onChange('finalCombinedAnalystQuery', event.target.value)}
            rows="7"
            className="mq-regenerate-json-textarea"
          />
        </div>
        <div className="mq-finalize-field">
          <label htmlFor="mq-final-sql-query">SQL Query</label>
          <textarea
            id="mq-final-sql-query"
            value={form.finalSqlQuery}
            onChange={(event) => onChange('finalSqlQuery', event.target.value)}
            rows="9"
            className="mq-finalize-sql-textarea"
          />
        </div>
        <div className="mq-finalize-grid">
          <div className="mq-finalize-field">
            <label htmlFor="mq-gross-opportunity">Gross Opportunity</label>
            <input
              id="mq-gross-opportunity"
              type="text"
              inputMode="decimal"
              value={form.grossOpportunity}
              onChange={(event) => onChange('grossOpportunity', event.target.value)}
            />
          </div>
          <div className="mq-finalize-field">
            <label htmlFor="mq-exemptions">Exemptions</label>
            <input
              id="mq-exemptions"
              type="text"
              inputMode="decimal"
              value={form.exemptions}
              onChange={(event) => onChange('exemptions', event.target.value)}
            />
          </div>
          <div className="mq-finalize-field">
            <label htmlFor="mq-net-opportunity">Net Opportunity</label>
            <input
              id="mq-net-opportunity"
              type="text"
              inputMode="decimal"
              value={form.netOpportunity}
              onChange={(event) => onChange('netOpportunity', event.target.value)}
            />
          </div>
        </div>
        <div className="mq-finalize-field">
          <label htmlFor="mq-review-document-url">Review Document URL</label>
          <input
            id="mq-review-document-url"
            type="url"
            value={form.reviewDocumentUrl}
            onChange={(event) => onChange('reviewDocumentUrl', event.target.value)}
          />
        </div>
        {errorDetail ? (
          <div className="mq-alert mq-alert-error" role="alert">
            {errorDetail}
          </div>
        ) : null}
      </div>
      <div className="mq-finalize-modal-footer">
        <button
          type="button"
          className="mq-btn-small-secondary"
          onClick={onClose}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="button"
          className="mq-btn-small-primary"
          onClick={onFinalize}
          disabled={isSaving}
        >
          {isSaving ? 'Finalizing...' : 'Finalize Query'}
        </button>
      </div>
    </div>
  </div>
);

const RegenerateQueryModal = ({
  form,
  errorDetail,
  isSaving,
  onChange,
  onClose,
  onRegenerate,
}) => (
  <div className="mq-modal-overlay" role="presentation" onClick={onClose}>
    <div
      className="mq-finalize-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mq-regenerate-modal-title"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mq-finalize-modal-header">
        <h3 id="mq-regenerate-modal-title">Regenerate Query</h3>
        <button
          type="button"
          className="mq-modal-close"
          onClick={onClose}
          aria-label="Close regenerate query modal"
          disabled={isSaving}
        >
          &times;
        </button>
      </div>
      <div className="mq-finalize-modal-body">
        <div className="mq-finalize-field">
          <label htmlFor="mq-regenerate-combined-query">Combined Analyst Query</label>
          <textarea
            id="mq-regenerate-combined-query"
            value={form.combinedAnalystQuery}
            onChange={(event) => onChange('combinedAnalystQuery', event.target.value)}
            rows="9"
            className="mq-regenerate-json-textarea"
            disabled={isSaving}
          />
        </div>
        <div className="mq-finalize-field">
          <label htmlFor="mq-regenerate-sql-query">SQL Query</label>
          <textarea
            id="mq-regenerate-sql-query"
            value={form.sqlQuery}
            onChange={(event) => onChange('sqlQuery', event.target.value)}
            rows="10"
            className="mq-finalize-sql-textarea"
            disabled={isSaving}
          />
        </div>
        {isSaving ? (
          <div className="mq-loading-with-helper mq-modal-loading">
            <div className="loading-indicator" role="status" aria-live="polite">
              Regenerating SQL query...
            </div>
            <QueryGenerationHelperText />
          </div>
        ) : null}
        {errorDetail ? (
          <div className="mq-alert mq-alert-error" role="alert">
            {errorDetail}
          </div>
        ) : null}
      </div>
      <div className="mq-finalize-modal-footer">
        <button
          type="button"
          className="mq-btn-small-secondary"
          onClick={onClose}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="button"
          className="mq-btn-small-primary"
          onClick={onRegenerate}
          disabled={isSaving}
        >
          {isSaving ? 'Regenerating...' : 'Regenerate Query'}
        </button>
      </div>
    </div>
  </div>
);

export default MasterQueryDetails;
