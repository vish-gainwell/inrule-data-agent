export const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatCompactMoney = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
  return formatMoney(amount);
};

export const uniqueSorted = (items, key) =>
  Array.from(new Set(items.map((item) => item[key]).filter(Boolean))).sort();
