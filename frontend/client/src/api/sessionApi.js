import { API_ENDPOINTS } from '../config/apiConfig';
import { logInfo, logError, logWarn } from '../utils/logger';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateSessionId() {
  try {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
  } catch (e) {
    // ignore and fall back
  }
  const rand = Math.random().toString(16).slice(2);
  return `ui-session-${Date.now().toString(16)}-${rand}`;
}

// Generic POST JSON helper
async function postJson(url, payload) {
  logInfo('sessionApi postJson', { url, payload });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    logInfo('sessionApi raw response', { url, status: response.status, raw });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${raw}`);
    }

    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    logError('sessionApi network error', { url, error: err?.message || String(err) });
    throw err;
  }
}

// Generic PATCH JSON helper
async function patchJson(url, payload) {
  logInfo('sessionApi patchJson', { url, payload });

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    logInfo('sessionApi PATCH raw response', { url, status: response.status, raw });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${raw}`);
    }

    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    logError('sessionApi PATCH network error', { url, error: err?.message || String(err) });
    throw err;
  }
}

// Generic DELETE helper
async function deleteRequest(url) {
  logInfo('sessionApi deleteRequest', { url });

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });

    const raw = await response.text();
    logInfo('sessionApi DELETE raw response', { url, status: response.status, raw });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${raw}`);
    }

    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    logError('sessionApi DELETE network error', { url, error: err?.message || String(err) });
    throw err;
  }
}

// Helper to build a single-session URL
function buildSessionUrl(sessionId) {
  // If you later add API_ENDPOINTS.SESSION_DETAIL, this will start using it.
  if (typeof API_ENDPOINTS.SESSION_DETAIL === 'function') {
    return API_ENDPOINTS.SESSION_DETAIL(sessionId);
  }
  // Fallback: treat NEW_SESSION as the base and append the id.
  return `${API_ENDPOINTS.NEW_SESSION}/${encodeURIComponent(sessionId)}`;
}

// In-memory cache to dedupe in-flight create calls per session id
const ensureCreateCache = new Map();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function createSession({ chat_title, userId, tenantId, instance, clientId, sessionId }) {
  const generatedSessionId = generateSessionId();

  const payload = {
    session_id: sessionId || generatedSessionId,
    user_id: userId,
    client_id: clientId || tenantId,
    instance_id: instance,
    chat_title
  };

  const data = await postJson(API_ENDPOINTS.NEW_SESSION, payload);

  const resolvedSessionId =
    data.session_id ?? data.sessionId ?? (sessionId || generatedSessionId);
  const dbSessionId = data.db_session_id ?? data.dbSessionId ?? resolvedSessionId;

  return {
    ...data,
    session_id: resolvedSessionId,
    db_session_id: dbSessionId,
  };
}

/**
 * Ensure a session with a specific id exists on the backend.
 * Dedupe concurrent calls for the same id.
 */
export function ensureSessionCreated({ chat_title, sessionId, userId, tenantId, instance, clientId }) {
  if (!sessionId) {
    throw new Error('ensureSessionCreated requires a sessionId');
  }

  const key = String(sessionId);
  const existing = ensureCreateCache.get(key);
  if (existing) return existing;

  const p = (async () => {
    try {
      logInfo('ensureSessionCreated: begin', { sessionId, tenantId, userId });
      await createSession({ chat_title, sessionId, userId, tenantId, instance, clientId });
      logInfo('ensureSessionCreated: created or confirmed session exists', { sessionId });
    } catch (e) {
      // If the server returns already exists or any non-fatal, we continue
      logWarn('ensureSessionCreated: create failed (may already exist)', {
        sessionId,
        error: e?.message || String(e),
      });
    } finally {
      ensureCreateCache.delete(key);
    }
    return true;
  })();

  ensureCreateCache.set(key, p);
  return p;
}

/**
 * List sessions for history (backed by /session_list).
 * Matches Analyst.jsx usage:
 *   ?user_id=<user>&client_id=<tenant>
 */
export async function listSessions({ userId, tenantId, clientId }) {
  const uid = userId;
  const cid = clientId || tenantId;

  if (!uid) {
    throw new Error('listSessions requires userId');
  }
  if (!cid) {
    throw new Error('listSessions requires tenantId/clientId');
  }

  const url =
    `${API_ENDPOINTS.CHAT_HISTORY}` +
    `?user_id=${encodeURIComponent(uid)}` +
    `&client_id=${encodeURIComponent(cid)}`;

  logInfo('sessionApi listSessions', { url, userId: uid, clientId: cid });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    const raw = await response.text();
    logInfo('sessionApi listSessions raw response', { url, status: response.status, raw });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${raw}`);
    }

    // backend might return: [] OR {sessions:[...]} OR {data:[...]}
    const data = raw ? JSON.parse(raw) : {};
    const sessions = Array.isArray(data) ? data : (data.sessions || data.data || []);

    return Array.isArray(sessions) ? sessions : [];
  } catch (err) {
    logError('sessionApi listSessions network error', {
      url,
      error: err?.message || String(err),
    });
    throw err;
  }
}

/**
 * Rename an existing backend session (chat).
 */
export async function renameSession(sessionId, title) {
  if (!sessionId) {
    throw new Error('renameSession requires a sessionId');
  }

  const url = `${API_ENDPOINTS.UPDATE_SESSION}/${encodeURIComponent(sessionId)}`;

  // Only update chat_title field to avoid overwriting other session data
  const payload = {
    chat_title: title,
  };

  const data = await patchJson(url, payload);

  const newTitle = data?.chat_title ?? data?.title ?? title;
  const id = data?.session_id ?? data?.id ?? sessionId;

  return { ...data, id, title: newTitle };
}

/**
 * Delete an existing backend session (chat).
 */
export async function deleteSession(sessionId) {
  if (!sessionId) {
    throw new Error('deleteSession requires a sessionId');
  }
  const url = `${API_ENDPOINTS.UPDATE_SESSION}/${encodeURIComponent(sessionId)}`;
  const payload = { is_deleted: true, is_active: false, end_at: new Date().toISOString() };
  await patchJson(url, payload);
  return true;
}

/**
 * Persist chat/session state (rounds, metadata, status) to the backend.
 */
export async function saveSessionState({
  sessionId,
  tenantId,
  userId,
  rounds = [],
  lastQuery = null,
  chatTitle,
  status = 'active', // 'active' | 'closed'
  endAt,
  preserveTitle = false, // NEW: when true, don't override existing title
}) {
  if (!sessionId) {
    throw new Error('saveSessionState requires a sessionId');
  }

  const url = `${API_ENDPOINTS.UPDATE_SESSION}/${encodeURIComponent(sessionId)}`;

  const normalizedEndAt =
    endAt || (status === 'closed' ? new Date().toISOString() : undefined);

  const payload = {
    client_id: tenantId,
    user_id: userId,
    ...(preserveTitle ? {} : { chat_title: chatTitle || lastQuery || undefined }),
    metadata: {
      rounds,
      last_query: lastQuery,
      ...(status === 'closed' && normalizedEndAt ? { closed_at: normalizedEndAt } : {}),
    },
    is_active: true,
    is_deleted: false,
    end_at: normalizedEndAt,
  };

  // Remove undefined keys so we do not overwrite server defaults
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) delete payload[key];
  });

  return patchJson(url, payload);
}
