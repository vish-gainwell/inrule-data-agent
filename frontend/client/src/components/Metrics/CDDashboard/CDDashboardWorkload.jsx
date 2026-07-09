import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchCdDashboardClientPolicies } from '../../../api/metricsApi';
import { buildParams, extractClientPolicies, formatInteger, formatMoney } from './utils';

const normalizeValue = (value) => String(value ?? '').trim();

const firstValue = (...values) => {
  for (const value of values) {
    const normalized = normalizeValue(value);
    if (normalized) return normalized;
  }
  return '';
};

const normalizeLookupKey = (value) =>
  normalizeValue(value)
    .toLowerCase()
    .replace(/[~\s_-]+/g, '');

const getDirectClientId = (client) =>
  firstValue(client.client_id, client.clientId, client.client, client.id, client.value);

const getClientName = (client) =>
  firstValue(client.client_name, client.clientName, client.name, client.label, getDirectClientId(client));

const getClientIdFromOptions = (client, clientOptions) => {
  const rowKeys = [
    getClientName(client),
    client.client_name,
    client.clientName,
    client.name,
    client.label,
  ].map(normalizeLookupKey).filter(Boolean);

  const option = clientOptions.find((item) => {
    const optionKeys = [item.label, item.value, item.client_name, item.clientName, item.name]
      .map(normalizeLookupKey)
      .filter(Boolean);
    return optionKeys.some((key) => rowKeys.includes(key));
  });

  return normalizeValue(option?.value);
};

const getClientId = (client, clientOptions) =>
  getDirectClientId(client) || getClientIdFromOptions(client, clientOptions);

const getClientKey = (client, clientOptions, index) => {
  const clientId = getClientId(client, clientOptions);
  const clientName = getClientName(client) || 'client';
  return `${clientId || clientName}-${index}`;
};

const getPolicyId = (policy) => firstValue(policy.policy_file_id, policy.policy_id, policy.policy_name);

const CDDashboardWorkload = ({
  clientWorkload,
  clientOptions = [],
  filters,
}) => {
  const [expandedClientKey, setExpandedClientKey] = useState('');
  const [policyStateByClientKey, setPolicyStateByClientKey] = useState({});
  const expandedCardRef = useRef(null);

  const expansionParams = useMemo(
    () => buildParams(filters, { client_id: '', policy_file_id: '' }),
    [filters]
  );

  useEffect(() => {
    setExpandedClientKey('');
    setPolicyStateByClientKey({});
  }, [clientWorkload, expansionParams]);

  useEffect(() => {
    if (!expandedClientKey || !expandedCardRef.current) return;

    expandedCardRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  }, [expandedClientKey]);

  const loadClientPolicies = async (client, clientKey) => {
    const clientId = getClientId(client, clientOptions);

    setExpandedClientKey(clientKey);
    setPolicyStateByClientKey((current) => ({
      ...current,
      [clientKey]: {
        policies: [],
        loading: true,
        loaded: false,
        error: '',
      },
    }));

    if (!clientId) {
      setPolicyStateByClientKey((current) => ({
        ...current,
        [clientKey]: {
          policies: [],
          loading: false,
          loaded: true,
          error: 'Unable to load policies because this workload row is missing a client identifier.',
        },
      }));
      return;
    }

    try {
      const response = await fetchCdDashboardClientPolicies(clientId, expansionParams);
      setPolicyStateByClientKey((current) => ({
        ...current,
        [clientKey]: {
          policies: extractClientPolicies(response),
          loading: false,
          loaded: true,
          error: '',
        },
      }));
    } catch (error) {
      setPolicyStateByClientKey((current) => ({
        ...current,
        [clientKey]: {
          policies: [],
          loading: false,
          loaded: true,
          error: error.message || 'Unable to load policies for this client.',
        },
      }));
    }
  };

  const toggleClient = (client, clientKey) => {
    if (expandedClientKey === clientKey) {
      setExpandedClientKey('');
      return;
    }

    loadClientPolicies(client, clientKey);
  };

  return (
    <div className="cd-panel">
      <div className="cd-panel-title-row">
        <h4>Client and Policy Workload</h4>
      </div>
      <div className="cd-client-accordion">
        {!clientWorkload.length && (
          <div className="metrics-table-empty">No client workload data available.</div>
        )}

        {clientWorkload.map((client, index) => {
          const clientKey = getClientKey(client, clientOptions, index);
          const isExpanded = expandedClientKey === clientKey;
          const policyState = policyStateByClientKey[clientKey] || {
            policies: [],
            loading: false,
            loaded: false,
            error: '',
          };
          const policiesPanelId = `cd-client-policies-${clientKey.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

          return (
            <div
              className={`cd-client-card${isExpanded ? ' expanded' : ''}`}
              key={clientKey}
              ref={isExpanded ? expandedCardRef : null}
            >
              <button
                className="cd-client-summary"
                type="button"
                aria-expanded={isExpanded}
                aria-controls={policiesPanelId}
                onClick={() => toggleClient(client, clientKey)}
              >
                <span className="cd-client-toggle">{isExpanded ? '-' : '+'}</span>
                <span className="cd-client-name">{getClientName(client) || '-'}</span>
                <span className="cd-client-metric">
                  <strong>{formatInteger(client.policy_count)}</strong>
                  <span>Policies</span>
                </span>
                <span className="cd-client-metric">
                  <strong>{formatInteger(client.rule_count)}</strong>
                  <span>Rules</span>
                </span>
                <span className="cd-client-metric">
                  <strong>{formatInteger(client.pending_rule_count)}</strong>
                  <span>Pending</span>
                </span>
                <span className="cd-client-metric">
                  <strong>{formatMoney(client.opportunity_size)}</strong>
                  <span>Opportunity</span>
                </span>
              </button>

              <div className="cd-client-policies" id={policiesPanelId}>
                {policyState.loading && (
                  <div className="metrics-inline-status cd-client-policy-status">Loading policies...</div>
                )}
                {policyState.error && (
                  <div className="metrics-inline-status error cd-client-policy-status">
                    {policyState.error}
                  </div>
                )}
                {!policyState.loading && !policyState.error && policyState.loaded && !policyState.policies.length && (
                  <div className="metrics-table-empty">No policies match this client.</div>
                )}
                {!policyState.loading && !policyState.error && policyState.policies.length > 0 && (
                  <table className="cd-data-table">
                    <thead>
                      <tr>
                        <th>Policy</th>
                        <th>Rules</th>
                        <th>Pending</th>
                        <th>Opportunity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {policyState.policies.map((policy, policyIndex) => (
                        <tr key={`${getPolicyId(policy) || 'policy'}-${policyIndex}`}>
                          <td>{policy.policy_name || policy.policy_file_id || '-'}</td>
                          <td>{formatInteger(policy.rule_count)}</td>
                          <td>{formatInteger(policy.pending_rule_count)}</td>
                          <td>{formatMoney(policy.opportunity_size)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CDDashboardWorkload;
