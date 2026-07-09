export const ALL = '';

export const USER_TYPE_OPTIONS = [
  { value: 'assigned_to', label: 'Assigned To' },
  { value: 'assigned_by', label: 'Assigned By' },
];

export const STATUS_OPTIONS = [
  { value: 'In progress', label: 'In progress' },
  { value: 'Ready to review', label: 'Ready to review' },
  { value: 'Accept', label: 'Accept' },
  { value: 'Reject', label: 'Reject' },
  { value: 'On hold', label: 'On hold' },
];

export const createDefaultFilters = () => ({
  client_id: ALL,
  policy_file_id: ALL,
  user_id: ALL,
  user_type: 'assigned_to',
  status: ALL,
  category: ALL,
});

export const createDefaultRulesPagination = () => ({
  page: 1,
  page_size: 25,
  sort_by: 'rule',
  sort_order: 'asc',
});

export const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const formatInteger = (value) => toNumber(value).toLocaleString('en-US');

export const formatMoney = (value) => {
  const number = toNumber(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: number >= 1000 ? 0 : 2,
  }).format(number);
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

export const labelize = (value) =>
  String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const getData = (response) => response?.data?.data || response?.data || response || {};

export const buildParams = (filters, overrides = {}) => {
  const merged = { ...filters, ...overrides };
  const params = {};

  [
    'client_id',
    'policy_file_id',
    'user_id',
    'user_type',
    'status',
    'category',
    'assignee_email',
    'rule_search',
    'page',
    'page_size',
    'sort_by',
    'sort_order',
  ].forEach((key) => {
    const value = merged[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      params[key] = value;
    }
  });

  return params;
};

const dedupeOptions = (items, getValue, getLabel) => {
  const map = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const value = String(getValue(item) ?? '').trim();
    if (!value || map.has(value)) return;
    map.set(value, {
      value,
      label: String(getLabel(item) ?? value).trim() || value,
    });
  });
  return Array.from(map.values());
};

export const normalizeOptions = (response) => {
  const data = getData(response);
  return {
    clients: dedupeOptions(data.clients, (item) => item.client_id, (item) => item.client_name || item.client_id),
    policies: dedupeOptions(
      data.policies,
      (item) => item.policy_file_id || item.policy_id || item.value,
      (item) => item.policy_name || item.label || item.policy_file_id
    ),
    users: dedupeOptions(
      data.users,
      (item) => item.user_id || item.email || item.assignee_email || item.value,
      (item) => item.user_name || item.name || item.email || item.label || item.user_id
    ),
    categories: dedupeOptions(
      data.categories,
      (item) => item.value || item.category || item.label || item,
      (item) => item.label || item.category || item.value || item
    ),
  };
};

export const extractRules = (response) => {
  const data = getData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.rules)) return data.rules;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.records)) return data.records;
  if (Array.isArray(response?.rules)) return response.rules;
  return [];
};

export const extractRulesPagination = (response) => {
  const data = getData(response);
  return data.pagination || response?.pagination || {};
};

export const extractClientPolicies = (response) => {
  const data = getData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.policies)) return data.policies;
  if (Array.isArray(data.policy_files)) return data.policy_files;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.records)) return data.records;
  if (Array.isArray(response?.policies)) return response.policies;
  return [];
};

export const getRuleId = (rule) => rule.rule_id || rule.rule_number || rule.id || rule.rule || '';

export const getRuleDisplayId = (rule) => rule.rule_display_id || rule.rule_number || rule.rule || getRuleId(rule);

export const getPolicyId = (rule) => rule.policy_file_id || rule.policy_id || '';

export const getPolicyName = (rule) =>
  rule.policy_name || rule.policy_title || rule.policy_file_name || getPolicyId(rule) || '-';

export const getAssignee = (rule) =>
  rule.assigned_to_name ||
  rule.assignee_name ||
  rule.assigned_to_email ||
  rule.assignee_email ||
  rule.assigned_to ||
  rule.user_name ||
  rule.user_id ||
  '-';

export const statusClass = (status) => {
  const normalized = labelize(status).toLowerCase();
  if (normalized.includes('accept')) return 'accept';
  if (normalized.includes('reject')) return 'reject';
  if (normalized.includes('review')) return 'review';
  if (normalized.includes('progress')) return 'progress';
  if (normalized.includes('hold')) return 'hold';
  return '';
};
