import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  API_ENDPOINTS,
  DEFAULT_TENANT_ID,
  DEFAULT_USER_ID,
  resolveTenantId,
  resolveUserId,
} from '../../config/apiConfig';
import { renameSession, deleteSession } from '../../api/sessionApi';
import { useCancellableFetch } from '../../hooks/useCancellableFetch';
import {
  buildSessionState,
  formatWhen,
  safeTimestamp,
  deduplicateSessions,
} from '../../utils/sessionUtils';
import { extractDataArray, parseJsonResponse } from '../../utils/apiUtils';
import { isSessionDeleted } from '../../utils/analystHelpers';
import { useAuth } from '../../auth/AuthProvider';
import { useClient } from '../../context/ClientContext';
import { fetchAllTenants, fetchTenantMetadata } from '../../api/tenantMetadata';

const MAX_VISIBLE_SESSIONS = 25;
const normalizeTitle = (text) => (text || '').trim().slice(0, 120);
const TAB_KEYS = {
  ANALYST: 'analyst',
  CONCEPT: 'concept-development',
  MASTER_QUERY: 'master-query',
};
const CLIENT_STORAGE_KEYS = {
  [TAB_KEYS.ANALYST]: 'gw_sidebar_client_analyst',
  [TAB_KEYS.CONCEPT]: 'gw_sidebar_client_concept_development',
  [TAB_KEYS.MASTER_QUERY]: 'gw_sidebar_client_master_query',
};

const getTabKeyFromPath = (pathname = '') =>
  pathname.startsWith('/concept-development')
    ? TAB_KEYS.CONCEPT
    : pathname.startsWith('/master-query')
      ? TAB_KEYS.MASTER_QUERY
      : TAB_KEYS.ANALYST;

const readStoredClient = (storageKey, fallback = '') => {
  try {
    const value = localStorage.getItem(storageKey);
    return value && value.trim() ? value.trim() : fallback;
  } catch {
    return fallback;
  }
};

const writeStoredClient = (storageKey, value) => {
  try {
    localStorage.setItem(storageKey, value);
  } catch {
    /* ignore */
  }
};

const extractTenantNames = (payload) => {
  if (!payload) return [];
  const source = Array.isArray(payload) ? payload : [payload];
  const names = source
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (!item || typeof item !== 'object') return '';
      return (
        item.tenant_id ||
        item.name ||
        item.tenant_name ||
        item.tenant ||
        item.id ||
        item.client_id ||
        item.client ||
        ''
      )
        .toString()
        .trim();
    })
    .filter(Boolean);

  const seen = new Set();
  return names.filter((name) => {
    if (seen.has(name)) return false;
    seen.add(name);
    return true;
  });
};

const sortClientOptions = (options) =>
  [...options].sort((a, b) =>
    String(a).localeCompare(String(b), undefined, {
      sensitivity: 'base',
      numeric: true,
    })
  );

/**
 * ---------------------------------------------------------------------------
 * LOCAL MODE GUARD (minimal, single-file fix)
 * If VITE_SESSION_STORE=local OR VITE_API_BASE_URL is blank,
 * do NOT call backend for sessions/schema.
 * ---------------------------------------------------------------------------
 */
const SESSION_STORE = (import.meta.env.VITE_SESSION_STORE || 'api').trim(); // "api" | "local"
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim();
const LOCAL_MODE = SESSION_STORE === 'local' || !API_BASE_URL;

// LocalStorage helpers (sessions only)
const lsKey = (userId, clientId) => `gw_sessions:${clientId}:${userId}`;
const loadLocalSessions = (userId, clientId) => {
  try {
    const raw = localStorage.getItem(lsKey(userId, clientId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const saveLocalSessions = (userId, clientId, sessions) => {
  try {
    localStorage.setItem(lsKey(userId, clientId), JSON.stringify(sessions || []));
  } catch {
    /* ignore */
  }
};

const Sidebar = ({ onNewSession, currentClient = DEFAULT_TENANT_ID, onClientChange }) => {
  const location = useLocation();
  const { account } = useAuth() || {};
  const { setClient, setSession, session: activeSession } = useClient();
  const activeTabKey = useMemo(() => getTabKeyFromPath(location.pathname), [location.pathname]);
  const defaultClient = resolveTenantId(DEFAULT_TENANT_ID) || 'MDWise';

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedTables, setExpandedTables] = useState({});
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);

  // Schema state
  const [expandedDatabases, setExpandedDatabases] = useState({});
  const [tenantSchema, setTenantSchema] = useState(null);
  const [isSchemaLoading, setIsSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState(null);

  const [tenantOptionsByTab, setTenantOptionsByTab] = useState({
    [TAB_KEYS.ANALYST]: [],
    [TAB_KEYS.CONCEPT]: [],
    [TAB_KEYS.MASTER_QUERY]: [],
  });
  const [selectedClientByTab, setSelectedClientByTab] = useState(() => {
    const analystClient = readStoredClient(CLIENT_STORAGE_KEYS[TAB_KEYS.ANALYST], defaultClient);
    const conceptClient = readStoredClient(CLIENT_STORAGE_KEYS[TAB_KEYS.CONCEPT], '');
    const masterQueryClient = readStoredClient(CLIENT_STORAGE_KEYS[TAB_KEYS.MASTER_QUERY], '');
    return {
      [TAB_KEYS.ANALYST]: analystClient,
      [TAB_KEYS.CONCEPT]: conceptClient,
      [TAB_KEYS.MASTER_QUERY]: masterQueryClient,
    };
  });
  const [selectedClient, setSelectedClient] = useState(
    () => selectedClientByTab[activeTabKey] || defaultClient
  );
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);

  const requestSeqRef = useRef(0);
  const schemaRequestSeqRef = useRef(0);

  // Event refresh (dev)
  const refreshTimerRef = useRef(null);
  const selectedClientRef = useRef(selectedClient);
  useEffect(() => {
    selectedClientRef.current = selectedClient;
  }, [selectedClient]);

  const syncGlobalClient = useCallback(
    (value, source) => {
      if (onClientChange) {
        onClientChange(value);
        return;
      }
      if (setClient) {
        setClient(value, { source });
      }
    },
    [onClientChange, setClient]
  );

  const clientOptions = useMemo(() => {
    const active = Array.isArray(tenantOptionsByTab[activeTabKey])
      ? tenantOptionsByTab[activeTabKey]
      : [];
    const combined = active.length ? [...active] : [selectedClient].filter(Boolean);
    const seen = new Set();
    const deduplicated = combined.filter((name) => {
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
    return sortClientOptions(deduplicated);
  }, [activeTabKey, selectedClient, tenantOptionsByTab]);

  //Handled to update chat summarised title in chat window
  useEffect(() => {
    console.log("In sidebar activeSession :: ", activeSession);
    console.log("In sidebar sessions :: ", sessions);

    if (activeSession?.session_id) {
      const matchedSession = sessions.find(
        (session) => session.session_id === activeSession.session_id
      );

      if (matchedSession) {
        const nextTitle = matchedSession.chat_title;
        const sessionId = activeSession.session_id;
        if (window.gwAnalystTitleUpdated) {
          window.gwAnalystTitleUpdated(sessionId, nextTitle);
        }
        console.log("Updated Title:", nextTitle);
      } else {
        console.warn("No matching session found for:", activeSession.session_id);
      }
    }
  }, [sessions, activeSession]);

  useEffect(() => {
    const available = Array.isArray(tenantOptionsByTab[activeTabKey])
      ? tenantOptionsByTab[activeTabKey]
      : [];
    const stored = resolveTenantId(selectedClientByTab[activeTabKey], '');
    const isStoredValid = stored && (!available.length || available.includes(stored));
    const nextClient = isStoredValid ? stored : resolveTenantId(available[0], defaultClient);

    if (selectedClientByTab[activeTabKey] !== nextClient) {
      setSelectedClientByTab((prev) => ({ ...prev, [activeTabKey]: nextClient }));
      writeStoredClient(CLIENT_STORAGE_KEYS[activeTabKey], nextClient);
    }

    setSelectedClient(nextClient);

    if (resolveTenantId(currentClient, defaultClient) !== nextClient) {
      syncGlobalClient(nextClient, 'Sidebar.useEffect.activeTabSync');
    }
  }, [activeTabKey, currentClient, defaultClient, selectedClientByTab, syncGlobalClient, tenantOptionsByTab]);


  // Fetch available clients/tenants from API on component mount
  useEffect(() => {
    const fallbackClient = resolveTenantId(currentClient, defaultClient);
    if (LOCAL_MODE) {
      console.log('[Sidebar] LOCAL_MODE enabled — using default client options');
      setTenantOptionsByTab({
        [TAB_KEYS.ANALYST]: [fallbackClient].filter(Boolean),
        [TAB_KEYS.CONCEPT]: [fallbackClient].filter(Boolean),
        [TAB_KEYS.MASTER_QUERY]: [fallbackClient].filter(Boolean),
      });
      return;
    }

    fetchAllTenants()
      .then((payload) => {
        const analystTenants = extractTenantNames(
          payload?.tenants ?? payload?.tenant ?? (Array.isArray(payload) ? payload : [])
        );
        const conceptTenants = extractTenantNames(
          payload?.cd_tenant ?? payload?.cd_tenants ?? payload?.concept_development_tenants ?? []
        );
        const masterQueryTenants = extractTenantNames(
          payload?.mq_tenants ?? payload?.mq_tenant ?? payload?.master_query_tenants ?? []
        );

        const analystOptions = analystTenants.length ? analystTenants : [fallbackClient].filter(Boolean);
        const conceptOptions = conceptTenants.length ? conceptTenants : analystOptions;
        const masterQueryOptions = masterQueryTenants.length ? masterQueryTenants : analystOptions;

        setTenantOptionsByTab({
          [TAB_KEYS.ANALYST]: analystOptions,
          [TAB_KEYS.CONCEPT]: conceptOptions,
          [TAB_KEYS.MASTER_QUERY]: masterQueryOptions,
        });
        setSelectedClientByTab((prev) => {
          const next = { ...prev };
          if (
            !next[TAB_KEYS.ANALYST] ||
            !analystOptions.includes(next[TAB_KEYS.ANALYST])
          ) {
            next[TAB_KEYS.ANALYST] = analystOptions[0] || fallbackClient;
            writeStoredClient(CLIENT_STORAGE_KEYS[TAB_KEYS.ANALYST], next[TAB_KEYS.ANALYST]);
          }
          if (
            !next[TAB_KEYS.CONCEPT] ||
            !conceptOptions.includes(next[TAB_KEYS.CONCEPT])
          ) {
            next[TAB_KEYS.CONCEPT] =
              conceptOptions[0] || next[TAB_KEYS.ANALYST] || fallbackClient;
            writeStoredClient(CLIENT_STORAGE_KEYS[TAB_KEYS.CONCEPT], next[TAB_KEYS.CONCEPT]);
          }
          if (
            !next[TAB_KEYS.MASTER_QUERY] ||
            !masterQueryOptions.includes(next[TAB_KEYS.MASTER_QUERY])
          ) {
            next[TAB_KEYS.MASTER_QUERY] =
              masterQueryOptions[0] || next[TAB_KEYS.ANALYST] || fallbackClient;
            writeStoredClient(
              CLIENT_STORAGE_KEYS[TAB_KEYS.MASTER_QUERY],
              next[TAB_KEYS.MASTER_QUERY]
            );
          }
          return next;
        });

        // eslint-disable-next-line no-console
        console.log('[Sidebar] Client lists fetched', {
          analystCount: analystOptions.length,
          conceptCount: conceptOptions.length,
          masterQueryCount: masterQueryOptions.length,
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[Sidebar] Failed to fetch tenant lists', err);
      });
  }, []);

  // DB Schema toggles
  const toggleDatabase = (dbKey) => {
    setExpandedDatabases((prev) => ({
      ...prev,
      [dbKey]: !prev[dbKey],
    }));
  };

  const toggleTable = (tableKey) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableKey]: !prev[tableKey],
    }));
  };

  const handleClientChange = (e) => {
    const value = e.target.value;
    setSelectedClient(value);
    setSelectedClientByTab((prev) => ({ ...prev, [activeTabKey]: value }));
    writeStoredClient(CLIENT_STORAGE_KEYS[activeTabKey], value);

    syncGlobalClient(value, 'Sidebar.handleClientChange');
  };

  // ----------------------------------------------------------------------------
  // Tenant schema loader
  // ----------------------------------------------------------------------------
  const performLoadTenantSchema = async (abortSignal, tenantName = selectedClient) => {
    const seq = ++schemaRequestSeqRef.current;
    const clientId = resolveTenantId(tenantName);

    setIsSchemaLoading(true);
    setSchemaError(null);

    try {
      // LOCAL MODE: return stub schema (no network)
      if (LOCAL_MODE) {
        console.log('[Sidebar] LOCAL_MODE — using stub tenant schema', { clientId });
        const stub = {
          client_id: clientId,
          databases: [], // renderSchemaList expects .databases array
        };

        if (seq === schemaRequestSeqRef.current) {
          setTenantSchema(stub);
          setExpandedDatabases({});
          setExpandedTables({});
        }
        return;
      }

      // eslint-disable-next-line no-console
      console.log('[Sidebar] Loading tenant metadata', { clientId });

      const metadata = await fetchTenantMetadata(clientId, { signal: abortSignal });

      if (seq === schemaRequestSeqRef.current) {
        setTenantSchema(metadata);
        setExpandedDatabases({});
        setExpandedTables({});
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Sidebar] Error loading tenant metadata', err);
      if (seq === schemaRequestSeqRef.current) {
        setSchemaError(err.message || String(err));
        setTenantSchema(null);
      }
    } finally {
      if (seq === schemaRequestSeqRef.current) {
        setIsSchemaLoading(false);
      }
    }
  };

  const loadTenantSchema = useCancellableFetch(performLoadTenantSchema);

  // ----------------------------------------------------------------------------
  // Sessions loader
  // ----------------------------------------------------------------------------
  const performLoadSessions = useCallback(
    async (abortSignal, clientOverride) => {
      const seq = ++requestSeqRef.current;
      setIsLoadingSessions(true);
      setSessionsError(null);

      try {
        const userId = resolveUserId(account, DEFAULT_USER_ID);
        const clientId = resolveTenantId(clientOverride ?? selectedClientRef.current);

        // LOCAL MODE: load sessions from localStorage (no network)
        if (LOCAL_MODE) {
          console.log('[Sidebar] LOCAL_MODE — loading sessions from localStorage', { userId, clientId });
          const localSessions = loadLocalSessions(userId, clientId);

          // keep behavior similar: filter deleted, sort, dedupe
          const filtered = localSessions.filter((s) => !isSessionDeleted(s));
          const sorted = [...filtered].sort((a, b) => safeTimestamp(b) - safeTimestamp(a));
          const deduped = deduplicateSessions(sorted);

          if (seq === requestSeqRef.current) setSessions(deduped);
          return;
        }

        // eslint-disable-next-line no-console
        console.log('[Sidebar] Loading sessions for', { userId, clientId });

        const url = `${API_ENDPOINTS.CHAT_HISTORY}?user_id=${encodeURIComponent(
          userId
        )}&client_id=${encodeURIComponent(clientId)}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: abortSignal,
        });

        const raw = await response.text();
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${raw}`);

        const data = parseJsonResponse(raw, {});
        const list = extractDataArray(data);

        const filtered = list.filter((s) => !isSessionDeleted(s));

        // Sort by timestamp desc and deduplicate
        const sorted = [...filtered].sort((a, b) => safeTimestamp(b) - safeTimestamp(a));
        const deduped = deduplicateSessions(sorted);

        if (seq === requestSeqRef.current) {
          setSessions(deduped);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[Sidebar] Error loading sessions', err);
        if (seq === requestSeqRef.current) {
          setSessionsError(err.message || String(err));
          setSessions([]);
        }
      } finally {
        if (seq === requestSeqRef.current) setIsLoadingSessions(false);
      }
    },
    [account]
  );

  const loadSessions = useCancellableFetch(performLoadSessions);

  // Clear session and schema data when client changes (immediate, not debounced)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[Sidebar] Client changed, clearing previous data', { selectedClient });

    setSessions([]);
    setSessionsError(null);

    setTenantSchema(null);
    setSchemaError(null);

    setExpandedDatabases({});
    setExpandedTables({});
  }, [selectedClient]);

  // Load sessions + schema when client changes
  useEffect(() => {
    loadSessions();
    loadTenantSchema(selectedClient);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient, account?.username]);

  // Expose a global hook so other components (Analyst) can request a refresh
  useEffect(() => {
    window.gwSidebarLoadSessions = loadSessions;
    return () => {
      if (window.gwSidebarLoadSessions === loadSessions) {
        delete window.gwSidebarLoadSessions;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Event-driven refresh from Analyst (dev)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const onSessionsUpdated = (e) => {
      const detailTenant = e?.detail?.tenantId;
      const myTenant = resolveTenantId(selectedClientRef.current);

      if (detailTenant && resolveTenantId(detailTenant) !== myTenant) return;

      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => {
        loadSessions();
      }, 150);
    };

    const onActiveSessionChanged = (e) => {
      const sid = e?.detail?.sessionId;
      if (!sid) return;

      // 🔒 Do not clobber a custom title on background refresh
      if (setSession) {
        setSession(
          (prev) => {
            const same = prev?.id && String(prev.id) === String(sid);
            if (same && prev?.isCustom) return prev;

            return {
              ...(prev || {}),
              id: sid,
              title: prev?.title || 'Untitled chat',
              isCustom: prev?.isCustom || false,
            };
          },
          { onlyIfSameId: false }
        );
      }

      onSessionsUpdated(e);
    };

    window.addEventListener('gw:sessions-updated', onSessionsUpdated);
    window.addEventListener('gw:active-session-changed', onActiveSessionChanged);

    return () => {
      window.removeEventListener('gw:sessions-updated', onSessionsUpdated);
      window.removeEventListener('gw:active-session-changed', onActiveSessionChanged);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [loadSessions, setSession]);

  // Safety refresh when active session changes (kept, but not relied on)
  useEffect(() => {
    if (!activeSession?.id) return;

    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      loadSessions();
    }, 250);

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [activeSession?.id, loadSessions]);

  const triggerNewChat = async (targetClient) => {
    if (isCreatingNewChat) return;
    setIsCreatingNewChat(true);

    try {
      // eslint-disable-next-line no-console
      console.log('[Sidebar] New chat requested', { targetClient });

      if (onNewSession) {
        const created = await onNewSession(targetClient);
        const sid = created?.session_id || created?.sessionId || null;

        if (setSession) {
          setSession(
            {
              id: sid,
              title: 'Untitled chat',
              isCustom: false,
            },
            { onlyIfSameId: false }
          );
        }

        // LOCAL MODE: if a session was created client-side, optionally insert a stub into local history
        if (LOCAL_MODE && sid) {
          const userId = resolveUserId(account, DEFAULT_USER_ID);
          const clientId = resolveTenantId(targetClient ?? selectedClientRef.current);
          const existing = loadLocalSessions(userId, clientId);
          const now = new Date().toISOString();
          const stub = {
            session_id: sid,
            chat_title: 'Untitled chat',
            last_query: '',
            last_updated_at: now,
            created_at: now,
          };
          // keep most recent first
          const next = [stub, ...existing];
          saveLocalSessions(userId, clientId, next);
        }

        setTimeout(() => loadSessions(), 150);
        return;
      }

      if (window.gwAnalystNewChat) {
        await window.gwAnalystNewChat(targetClient);
        setTimeout(() => loadSessions(), 150);
        return;
      }

      const btn = document.getElementById('btn-new-chat');
      if (btn) btn.click();
      setTimeout(() => loadSessions(), 150);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[Sidebar] triggerNewChat failed', e);
    } finally {
      setIsCreatingNewChat(false);
    }
  };

  const handleNewChat = async () => {
    const targetClient = selectedClient;
    await triggerNewChat(targetClient);
  };

  const handleOpenSession = (session) => {
    const sessionId = session.session_id || session.id;
    if (!sessionId) return;

    // eslint-disable-next-line no-console
    console.log('[Sidebar] Open session click', { sessionId });

    if (setSession) {
      const lastQuery =
        session.last_query || (session.metadata && session.metadata.last_query) || '';
      const titleSource = session.chat_title || session.title || session.name || lastQuery;

      const { title, isCustom } = buildSessionState(titleSource, lastQuery);

      setSession(
        { id: sessionId, title, isCustom },
        { onlyIfSameId: false, force: true, source: 'Sidebar.handleOpenSession' }
      );
    }

    if (window.gwAnalystReopenSession) {
      window.gwAnalystReopenSession(sessionId);
    } else {
      // eslint-disable-next-line no-console
      console.warn('[Sidebar] gwAnalystReopenSession is not available on window');
    }
  };

  const handleRenameSession = async (e, session) => {
    e.stopPropagation();
    const sessionId = session.session_id || session.id;
    if (!sessionId) return;

    const currentTitle = session.chat_title || session.last_query || 'Untitled chat';
    const newTitle = window.prompt('Rename chat:', currentTitle);
    if (!newTitle || newTitle.trim() === currentTitle) return;

    try {
      const updated = await renameSession(sessionId, newTitle.trim());
      const nextTitle = updated.title ?? newTitle.trim();

      // eslint-disable-next-line no-console
      console.log('[Sidebar] Renamed session', { sessionId, nextTitle });

      setSessions((prev) =>
        prev.map((s) => {
          const id = s.session_id || s.id;
          if (id !== sessionId) return s;
          return { ...s, chat_title: nextTitle, title: nextTitle };
        })
      );

      if (LOCAL_MODE) {
        const userId = resolveUserId(account, DEFAULT_USER_ID);
        const clientId = resolveTenantId(selectedClientRef.current);
        const existing = loadLocalSessions(userId, clientId);
        const next = existing.map((s) => {
          const id = s.session_id || s.id;
          if (String(id) !== String(sessionId)) return s;
          return { ...s, chat_title: nextTitle, title: nextTitle, last_updated_at: new Date().toISOString() };
        });
        saveLocalSessions(userId, clientId, next);
      }

      if (setSession) {
        setSession(
          (prev) => {
            if (!prev || (prev.id !== sessionId && prev.session_id !== sessionId)) return prev;
            return {
              ...prev,
              id: sessionId,
              title: normalizeTitle(nextTitle),
              isCustom: true,
            };
          },
          { onlyIfSameId: true, force: true, source: 'Sidebar.handleRenameSession' }
        );
      }

      if (window.gwAnalystTitleUpdated) {
        window.gwAnalystTitleUpdated(sessionId, nextTitle);
      }

      await loadSessions();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Sidebar] Error renaming session', err);
    }
  };

  const handleDeleteSession = async (e, session) => {
    e.stopPropagation();
    const sessionId = session.session_id || session.id;
    if (!sessionId) return;

    const ok = window.confirm('Delete this chat? This cannot be undone.');
    if (!ok) return;

    try {
      await deleteSession(sessionId);
      window.gwAnalystDeleteSession(sessionId);

      if (LOCAL_MODE) {
        const userId = resolveUserId(account, DEFAULT_USER_ID);
        const clientId = resolveTenantId(selectedClientRef.current);
        const existing = loadLocalSessions(userId, clientId);
        const next = existing.filter((s) => String(s.session_id || s.id) !== String(sessionId));
        saveLocalSessions(userId, clientId, next);
      }

      if (setSession && activeSession?.id === sessionId) {
        setSession(
          { id: null, title: 'Untitled chat', isCustom: false },
          { force: true, source: 'Sidebar.handleDeleteSession' }
        );
      }

      setSessions((prev) =>
        prev.filter((s) => {
          const id = s.session_id || s.id;
          return id !== sessionId;
        })
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Sidebar] Error deleting session', err);
    }

    loadSessions();
  };

  const handleClearAllSessions = async () => {
    if (!sessions.length) return;

    const ok = window.confirm(
      `Delete all ${sessions.length} chats for this client? This cannot be undone.`
    );
    if (!ok) return;

    window.gwAnalystDeleteSession("all_chat_history");
    if (setSession) {
      setSession({ id: null, title: 'Untitled chat', isCustom: false }, { force: true });
    }

    try {
      sessionStorage.removeItem('gw_analyst_active_session_id');
    } catch {
      /* ignore */
    }

    if (LOCAL_MODE) {
      const userId = resolveUserId(account, DEFAULT_USER_ID);
      const clientId = resolveTenantId(selectedClientRef.current);
      saveLocalSessions(userId, clientId, []);
      setSessions([]);
      return;
    }

    try {
      const ids = sessions.map((s) => s.session_id || s.id).filter(Boolean);

      const results = await Promise.allSettled(ids.map((id) => deleteSession(id)));
      // eslint-disable-next-line no-console
      console.log('[Sidebar] Clear all result:', results);

      setSessions((prev) =>
        prev.filter((s) => {
          const id = s.session_id || s.id;
          const pos = ids.indexOf(id);
          if (pos === -1) return true;
          const res = results[pos];
          return !res || res.status === 'rejected';
        })
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Sidebar] Error clearing all sessions', err);
    }

    await loadSessions();
  };

  const renderSchemaList = () => {
    if (isSchemaLoading) {
      return <div className="text-xs text-secondary">Loading schema...</div>;
    }

    if (schemaError) {
      return <div className="text-xs text-red-600">Could not load schema: {schemaError}</div>;
    }

    const databases = Array.isArray(tenantSchema?.databases) ? tenantSchema.databases : [];

    if (!databases.length) {
      return (
        <div className="text-xs text-secondary">
          {LOCAL_MODE ? 'Schema stub (local mode).' : 'No schema found for this tenant.'}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <ul className="space-y-2 min-w-max">
          {databases.map((db, dbIdx) => {
            const dbKey = db.db_name || db.database_id || `db-${dbIdx}`;
            const dbDisplayName = db.display_name || db.db_name || 'Database';
            const schemaName = db.schema_name || db.schema || null;
            const dbExpanded = expandedDatabases[dbKey] ?? true;
            const tables = Array.isArray(db.tables) ? db.tables : [];

            return (
              <li key={dbKey} className="border border-gray-200 rounded-md p-2">
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded"
                  onClick={() => toggleDatabase(dbKey)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold font-mono" title={dbDisplayName}>
                      {dbDisplayName}
                    </span>
                    {schemaName && (
                      <span className="text-[11px] text-secondary" title={schemaName}>
                        Schema: {schemaName}
                      </span>
                    )}
                    {db.description && (
                      <span className="text-[11px] text-secondary" title={db.description}>
                        {db.description}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-secondary text-xs ml-2 transform transition-transform duration-200 ${dbExpanded ? 'rotate-90' : ''
                      }`}
                  >
                    &#9658;
                  </span>
                </div>

                {dbExpanded && (
                  <ul className="mt-1 space-y-1">
                    {tables.map((table, tableIdx) => {
                      const tableName = table.table_name || table.display_name || `table-${tableIdx}`;
                      const tableDisplayName = table.display_name || table.table_name || 'Table';
                      const tableKey = `${dbKey}::${tableName}`;
                      const tableExpanded = expandedTables[tableKey] ?? false;
                      const columns = Array.isArray(table.columns) ? table.columns : [];

                      return (
                        <li key={tableKey}>
                          <div
                            className="flex items-start cursor-pointer hover:bg-gray-100 p-1 rounded"
                            onClick={() => toggleTable(tableKey)}
                          >
                            <span
                              className={`text-secondary text-xs mr-2 transform transition-transform duration-200 ${tableExpanded ? 'rotate-90' : ''
                                }`}
                            >
                              &#9658;
                            </span>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold font-mono" title={tableDisplayName}>
                                {tableDisplayName}
                              </span>
                              {table.description && (
                                <span className="text-[11px] text-secondary" title={table.description}>
                                  {table.description}
                                </span>
                              )}
                            </div>
                          </div>

                          {tableExpanded && (
                            <ul className="pl-6 mt-1 space-y-1">
                              {columns.length > 0 ? (
                                columns.map((col, colIdx) => {
                                  const colKey = col.column_id || col.column_name || `col-${colIdx}`;
                                  const typeParts = [];
                                  if (col.data_type) typeParts.push(col.data_type);
                                  if (col.is_nullable === false) typeParts.push('NOT NULL');

                                  return (
                                    <li
                                      key={`${tableKey}::${colKey}`}
                                      className="text-xs font-mono text-gray-700 whitespace-nowrap"
                                    >
                                      <div className="flex flex-col">
                                        <span
                                          title={`${col.column_name || 'column'}${typeParts.length ? ` (${typeParts.join(' ')})` : ''
                                            }`}
                                        >
                                          {col.column_name || 'column'}
                                          {typeParts.length ? ` (${typeParts.join(' ')})` : ''}
                                        </span>
                                        {col.description && (
                                          <span className="text-[10px] text-secondary" title={col.description}>
                                            {col.description}
                                          </span>
                                        )}
                                      </div>
                                    </li>
                                  );
                                })
                              ) : (
                                <li className="text-xs text-secondary">No columns found.</li>
                              )}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                    {tables.length === 0 && (
                      <li className="text-xs text-secondary px-1">No tables found.</li>
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <nav
      className={`flex flex-col flex-shrink-0 bg-gray-50 border-r border-gray-300 transition-all duration-300 ease-in-out h-screen ${isCollapsed ? 'w-20' : 'w-72'
        }`}
    >
      <div className="h-16 flex items-center justify-end px-4 border-b border-gray-300 flex-shrink-0">
        <button
          type="button"
          className="p-2 rounded-full cursor-pointer hover:bg-gray-200 text-gray-600"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <div
        className={`${isCollapsed ? 'block' : 'hidden'} flex flex-col items-center pt-4 w-full space-y-4`}
      >
        <div className="p-3 rounded-lg hover:bg-gray-200 cursor-pointer text-secondary" title="Chat History">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
            <path d="M3 5h18v2H3z" />
          </svg>
        </div>
        <div className="p-3 rounded-lg hover:bg-gray-200 cursor-pointer text-secondary" title="Schema">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
        </div>
      </div>

      <div className={`${isCollapsed ? 'hidden' : 'block'} flex-1 overflow-hidden p-4`}>
        <div className="space-y-3 h-full flex flex-col overflow-hidden">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-2 mt-2">Client Context</label>
            <select
              className="w-full p-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-primary"
              value={selectedClient}
              onChange={handleClientChange}
            >
              {clientOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 py-2 text-xs font-semibold border border-primary text-primary rounded bg-white hover:bg-blue-50 transition-colors disabled:opacity-60"
              onClick={handleNewChat}
              disabled={isLoadingSessions || isCreatingNewChat}
              title={isCreatingNewChat ? 'Creating…' : 'New Chat'}
            >
              + New Chat
            </button>
            <button
              type="button"
              className="px-2 py-2 text-xs font-semibold border border-gray-300 text-gray-600 rounded bg-white hover:bg-gray-100 transition-colors"
              onClick={handleClearAllSessions}
              disabled={isLoadingSessions || sessions.length === 0}
              title="Delete all chats for this client"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 border border-gray-200 rounded-md p-3 flex flex-col overflow-hidden">
              <label className="block text-xs font-semibold text-secondary mb-2">Chat History</label>

              <div className="text-xs text-secondary mb-2">
                {isLoadingSessions && <div>Loading chats…</div>}
                {!isLoadingSessions && sessionsError && <div className="text-red-600">Could not load chats.</div>}
                {!isLoadingSessions && !sessionsError && sessions.length === 0 && (
                  <div>{LOCAL_MODE ? 'No local chats yet.' : 'No past chats found.'}</div>
                )}
              </div>

              {sessions.length > 0 && (
                <ul className="space-y-1 overflow-y-auto pr-1 flex-1">
                  {sessions.slice(0, MAX_VISIBLE_SESSIONS).map((s) => {
                    const sessionId = s.session_id || s.id;

                    const lastQuery = s.last_query || (s.metadata && s.metadata.last_query) || '';

                    const title = s.chat_title || s.title || s.name || lastQuery || 'Untitled chat';

                    const when =
                      s.last_updated_at ||
                      s.last_updated ||
                      s.updated_at ||
                      s.created_at ||
                      s.timestamp;

                    const isActive = !!activeSession?.id && String(activeSession.id) === String(sessionId);

                    return (
                      <li
                        key={sessionId}
                        className={`p-2 rounded text-sm cursor-pointer flex justify-between items-center text-softblack ${isActive ? 'bg-blue-100' : 'hover:bg-gray-200'
                          }`}
                        onClick={() => handleOpenSession(s)}
                        title={lastQuery || title}
                      >
                        <span className="truncate">{title}</span>

                        <div className="flex items-center gap-1 ml-2">
                          {when && <span className="text-xs text-secondary">{formatWhen(when)}</span>}
                          <button
                            type="button"
                            aria-label="Rename chat"
                            className="p-1 rounded-full hover:bg-gray-300 text-xs"
                            title="Rename chat"
                            onClick={(e) => handleRenameSession(e, s)}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            aria-label="Delete chat"
                            className="p-1 rounded-full hover:bg-gray-300 text-xs"
                            title="Delete chat"
                            onClick={(e) => handleDeleteSession(e, s)}
                          >
                            🗑
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex-1 min-h-0 border border-gray-200 rounded-md p-3 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-secondary">Database Schema</label>
                <button
                  type="button"
                  className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 text-gray-700"
                  onClick={() => setIsSchemaModalOpen(true)}
                  title="Pop out schema"
                  aria-label="Pop out schema"
                >
                  {/* Pop-out / open-in-new icon */}
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 3h7v7" />
                    <path d="M10 14L21 3" />
                    <path d="M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                  </svg>
                </button>

              </div>

              <div className="overflow-y-auto overflow-x-auto pr-1 flex-1">{renderSchemaList()}</div>
            </div>
          </div>
        </div>
      </div>

      {isSchemaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-sm font-semibold text-softblack">Database Schema</h3>
              <button
                type="button"
                className="text-xs px-2 py-1 border border-gray-300 rounded bg-white hover:bg-gray-100"
                onClick={() => setIsSchemaModalOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">{renderSchemaList()}</div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Sidebar;
