// src/utils/sessionUtils.js
// Utility functions for session management and validation

/**
 * Build session title and custom status from raw data
 * @param {string} rawTitle - The raw title from session data
 * @param {string} lastQuery - The last query text
 * @returns {Object} - { title, isCustom }
 */
export const buildSessionState = (rawTitle, lastQuery) => {
  const titleText = (rawTitle || '').trim().slice(0, 120);
  const queryText = (lastQuery || '').trim().slice(0, 120);

  if (titleText) {
    return {
      title: titleText,
      isCustom: queryText ? titleText !== queryText : true,
    };
  }

  return {
    title: queryText || 'Untitled chat',
    isCustom: false,
  };
};

/**
 * Format a timestamp for display (Today, Yesterday, or date)
 * @param {string} iso - ISO timestamp string
 * @returns {string} - Formatted time/date string
 */
export const formatWhen = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  if (sameDay) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (isYesterday) {
    return 'Yesterday';
  }
  return d.toLocaleDateString();
};

/**
 * Safely extract timestamp from session object for sorting
 * @param {Object} item - Session object
 * @returns {number} - Timestamp in milliseconds
 */
export const safeTimestamp = (item) => {
  const tsFields = [
    'last_updated_at',
    'last_updated',
    'updated_at',
    'end_at',
    'created_at',
    'timestamp',
  ];
  for (const f of tsFields) {
    const v = item?.[f];
    if (v) {
      const t = new Date(v).getTime();
      if (!Number.isNaN(t)) return t;
    }
  }
  return 0;
};

/**
 * Deduplicate sessions by ID, keeping the most recent
 * @param {Array} sessions - Array of session objects
 * @returns {Array} - Deduplicated sessions
 */
export const deduplicateSessions = (sessions) => {
  const seen = new Set();
  const deduped = [];
  // Sort by timestamp desc first
  const sorted = [...sessions].sort((a, b) => safeTimestamp(b) - safeTimestamp(a));

  sorted.forEach((s) => {
    const sid = s.session_id || s.id;
    if (!sid) return;
    if (seen.has(sid)) return;
    seen.add(sid);
    deduped.push(s);
  });

  return deduped;
};