import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import ChatBubble from "../components/Chat/ChatBubble";
import InputBar from "../components/Chat/InputBar";
import ResultsTable from "../components/ResultsTable.jsx";
import {
  API_ENDPOINTS,
  DEFAULT_TENANT_ID,
  DEFAULT_USER_ID,
} from "../config/apiConfig";
import { generateQueries } from "../api/sqlClient";
import { getTypedBackendMessage } from "../api/queryParamsAdapter.js";
import {
  buildExecuteQueryRequest,
  normalizeExecuteQueryResponse,
} from "../api/executeQueryAdapter.js";
import {
  createSession,
  saveSessionState,
  ensureSessionCreated,
} from "../api/sessionApi";
import { useAuth } from "../auth/AuthProvider";
import { useClient } from "../context/ClientContext";
import {
  nowIso,
  normalizeTitle,
  createWelcomeMessage,
  normalizeSessionSummary,
  buildMessagesFromRounds,
  isSessionDeleted as isSessionDeletedUtil,
  isSessionInactive as isSessionInactiveUtil,
  parseJsonSafe,
  deriveRoundsFromOps,
  insertAfterLastOpId,
  buildExecutionMessage,
  deriveChatTitle as deriveChatTitleUtil,
} from "../utils/analystHelpers";

import { useQueryAnalyzer } from "../hooks/useQueryAnalyzer";
import { QueryHITLModal } from "../components/HITL/QueryHITLModal";
import { HITLChatMessage } from "../components/HITL/HITLChatMessage";

const ENABLE_UPDATE_SESSION = true;
const ENABLE_DEMO_QUERY_PARAMS = true;
const ENABLE_DEMO_HITL = false;
const ENABLE_DEMO_FAVORITES = false;
const LOCAL_SESSION_KEY = "gw_analyst_active_session_id";
const DEFAULT_SESSION_TITLE = "Untitled chat";
const SHOW_EXCLUSIONS_TOGGLE =
  (import.meta.env.VITE_SHOW_EXCLUSIONS_TOGGLE ?? "true").toLowerCase() ===
  "true";
const SHOW_HINDSIGHT_TOGGLE = import.meta.env.VITE_SHOW_HINDSIGHT === "true";

// TEMP SAFE LOGGER (prevents white screen)
const logInfo = (...args) => console.log("[INFO]", ...args);
const logError = (...args) => console.error("[ERROR]", ...args);

// Auto-title: first query + "(+N more)" until renamed
const deriveAutoTitleFromRounds = (rounds) => {
  if (!Array.isArray(rounds) || rounds.length === 0) return undefined;
  const first =
    rounds.find((r) => (r?.user_query || "").trim())?.user_query || "";
  const base = first.trim().slice(0, 120);
  if (!base) return undefined;

  const extra = Math.max(0, rounds.length - 1);
  return extra > 0 ? `${base} (+${extra} more)` : base;
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const Analyst = ({ isActive = true }) => {
  // Auth + global client/session context
  const { account } = useAuth() || {};
  const { client, setClient, session, setSession } = useClient();

  // Local user context
  const [userContext, setUserContext] = useState({
    userId: account?.username || DEFAULT_USER_ID,
    tenantId: client || DEFAULT_TENANT_ID,
    instanceId: "dev",
  });

  const [sessionDetails, setSessionDetails] = useState(null);

  // Initialize HITL hook
  const {
    hitlState,
    isLoading: hitlLoading,
    error: hitlError,
    analyzeQuery,
    respondToHitl,
    closeHitl,
  } = useQueryAnalyzer();

  // Keep userId updated when auth changes
  useEffect(() => {
    if (account?.username) {
      setUserContext((prev) => ({ ...prev, userId: account.username }));
    }
  }, [account?.username]);

  // Chat state
  const [messages, setMessages] = useState([
    createWelcomeMessage(client || DEFAULT_TENANT_ID),
  ]);
  const [rounds, setRounds] = useState([]);
  const roundsRef = useRef([]);
  useEffect(() => {
    roundsRef.current = rounds;
  }, [rounds]);

  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [lastError, setLastError] = useState(null);

  const [lastSql, setLastSql] = useState(null);
  const [lastExecution, setLastExecution] = useState(null);
  const [favoritePromptStates, setFavoritePromptStates] = useState({});

  // Query Analyzer (re-added)
  const [queryAnalyzer, setQueryAnalyzer] = useState(null);
  const [lastClientExclusionsUi, setLastClientExclusionsUi] = useState(null);

  // Session info (backend)
  const [sessionInfo, setSessionInfo] = useState(null);

  // UI toggles
  const [isHindsightEnabled, setIsHindsightEnabled] = useState(false);

  // For reopen / creation sequencing
  const reopenSeqRef = useRef(0);
  const ensureSessionPromiseRef = useRef(null);
  const sessionCreateSeqRef = useRef(0);
  const ensuredSessionIdsRef = useRef(new Set());

  // Hydration/persist controls
  const lastPersistKeyRef = useRef(null);
  const isHydratingSessionRef = useRef(false);

  // Serialize persist operations to avoid race conditions
  const persistQueueRef = useRef(Promise.resolve());

  // Reopen session on boot if URL/sessionStorage had it
  const bootSessionIdRef = useRef(null);
  const wasActiveRef = useRef(isActive);

  // Auto-scroll to bottom
  const endOfChatRef = useRef(null);
  const activeRequestRef = useRef(null);
  const activeRequestSeqRef = useRef(0);
  const requestScopeRef = useRef(0);
  const cancelRequestedRef = useRef(false);

  useEffect(() => {
    if (scrollLockRef.current > 0) {
      return;
    }
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------------------------------------------------------------------
  // Helpers: dispatch events to refresh Sidebar
  // ---------------------------------------------------------------------------
  const dispatchSessionsUpdated = useCallback(
    ({ tenantId, sessionId } = {}) => {
      try {
        window.dispatchEvent(
          new CustomEvent("gw:sessions-updated", {
            detail: { tenantId: tenantId || userContext.tenantId, sessionId },
          }),
        );
      } catch {
        /* ignore */
      }
    },
    [userContext.tenantId],
  );

  const dispatchActiveSessionChanged = useCallback(
    ({ tenantId, sessionId } = {}) => {
      if (!sessionId) return;
      try {
        window.dispatchEvent(
          new CustomEvent("gw:active-session-changed", {
            detail: { tenantId: tenantId || userContext.tenantId, sessionId },
          }),
        );
      } catch {
        /* ignore */
      }
    },
    [userContext.tenantId],
  );

  const createOperationId = useCallback((prefix = "op") => {
    if (window.crypto?.randomUUID) {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }, []);

  const getFavoritePromptKey = useCallback(
    (message) =>
      message?.op_id ||
      message?.id ||
      message?.generated_sql ||
      message?.content ||
      "favorite",
    [],
  );

  const normalizeFavoriteValue = useCallback((value) => {
    if (value == null) return "";
    return String(value).replace(/\r\n/g, "\n").trim();
  }, []);

  const buildFavoritePromptStates = useCallback(
    ({ favoritePrompts = [], rounds = [], messages = [] } = {}) => {
      const savedPromptTexts = new Set();

      favoritePrompts.forEach((prompt) => {
        if (prompt?.is_active === false) return;
        const promptText = normalizeFavoriteValue(prompt?.prompt_text);
        if (promptText) savedPromptTexts.add(promptText);
      });

      const isSavedFavorite = ({ promptText, userQuery }) => {
        const normalizedText = normalizeFavoriteValue(promptText);
        const normalizedUserQuery = normalizeFavoriteValue(userQuery);
        return (
          (normalizedText && savedPromptTexts.has(normalizedText)) ||
          (normalizedUserQuery && savedPromptTexts.has(normalizedUserQuery))
        );
      };

      const states = {};
      rounds.forEach((round) => {
        if (
          isSavedFavorite({
            promptText:
              round?.validate_sql ||
              round?.validated_sql ||
              round?.generated_sql,
            userQuery: round?.user_query,
          })
        ) {
          states[round.op_id || normalizeFavoriteValue(round?.generated_sql)] =
            "saved";
        }
      });

      messages.forEach((message) => {
        if (!message?.isSql) return;
        if (
          isSavedFavorite({
            promptText: message?.generated_sql || message?.content,
            userQuery: message?.user_query,
          })
        ) {
          states[getFavoritePromptKey(message)] = "saved";
        }
      });

      return states;
    },
    [getFavoritePromptKey, normalizeFavoriteValue],
  );

  const beginCancelableRequest = useCallback(({ opId, sessionId, type }) => {
    const controller = new AbortController();
    const requestId = ++activeRequestSeqRef.current;
    activeRequestRef.current = {
      controller,
      opId,
      sessionId,
      type,
      requestId,
    };
    setHasActiveRequest(true);
    return { controller, requestId };
  }, []);

  const updateActiveRequest = useCallback((requestId, updates) => {
    if (activeRequestRef.current?.requestId === requestId) {
      activeRequestRef.current = {
        ...activeRequestRef.current,
        ...updates,
      };
    }
  }, []);

  const finishCancelableRequest = useCallback((requestId) => {
    if (activeRequestRef.current?.requestId === requestId) {
      activeRequestRef.current = null;
      setHasActiveRequest(false);
      setIsLoading(false);
    }
  }, []);

  const startRequestScope = useCallback(() => {
    requestScopeRef.current += 1;
    return requestScopeRef.current;
  }, []);

  const isCurrentRequestScope = useCallback(
    (requestScopeId) => requestScopeRef.current === requestScopeId,
    [],
  );

  const resetActiveRequestState = useCallback(() => {
    requestScopeRef.current += 1;
    cancelRequestedRef.current = true;
    activeRequestRef.current?.controller?.abort();
    activeRequestRef.current = null;
    setHasActiveRequest(false);
    setIsLoading(false);
    setIsCancelling(false);
  }, []);

  const cancelActiveRequest = useCallback(async () => {
    cancelRequestedRef.current = true;
    requestScopeRef.current += 1;
    const activeRequest = activeRequestRef.current;
    if (!activeRequest) {
      setIsLoading(false);
      setHasActiveRequest(false);
      setLastError(null);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 6,
          role: "system",
          user_query: null,
          generated_sql: null,
          execution_summary: null,
          content: "Request stopped.",
          timestamp: nowIso(),
        },
      ]);
      return;
    }
    if (isCancelling) return;

    activeRequest.controller?.abort();
    activeRequestRef.current = null;
    setHasActiveRequest(false);
    setIsLoading(false);
    setLastError(null);

    const stoppedMessage = {
      id: Date.now() + 6,
      role: "system",
      user_query: null,
      generated_sql: null,
      execution_summary: null,
      content:
        activeRequest.type === "execute_query"
          ? "Query execution stopped."
          : "Request stopped.",
      timestamp: nowIso(),
      op_id: activeRequest.opId,
    };

    setMessages((prev) => {
      if (activeRequest.type === "execute_query" && activeRequest.opId) {
        return insertAfterLastOpId(prev, activeRequest.opId, stoppedMessage);
      }
      return [...prev, stoppedMessage];
    });

    if (!activeRequest.opId) return;

    setIsCancelling(true);
    try {
      const response = await fetch(API_ENDPOINTS.CANCEL_SQL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Session-Id": activeRequest.sessionId || "",
          "X-Tenant-Id": userContext.tenantId || "",
          "X-User-Id": userContext.userId || "",
        },
        body: JSON.stringify({
          op_id: activeRequest.opId,
          reason: "User requested cancellation",
        }),
      });

      const raw = await response.text();
      if (!response.ok) {
        console.warn("[Analyst] cancel_query failed", response.status, raw);
      }
    } catch (err) {
      console.warn("[Analyst] cancel_query exception", err);
    } finally {
      setIsCancelling(false);
    }
  }, [isCancelling, userContext.tenantId, userContext.userId]);

  // ---------------------------------------------------------------------------
  // Initial load: tenant/session from URL or sessionStorage
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const tenantParam = url.searchParams.get("tenant");
      const sessionParam = url.searchParams.get("session");

      // Tenant from URL
      if (tenantParam && tenantParam !== userContext.tenantId) {
        setClient?.(tenantParam);
        setUserContext((prev) => ({ ...prev, tenantId: tenantParam }));
        setMessages([createWelcomeMessage(tenantParam)]);
        setRounds([]);
        setSessionInfo(null);
        setLastSql(null);
        setLastExecution(null);
        setLastError(null);
        setFavoritePromptStates({});
        setQueryAnalyzer(null);
      }

      // Session from URL wins
      if (sessionParam) {
        logInfo("Found session in URL on load", {
          sessionId: sessionParam,
          tenantId: tenantParam,
        });

        setSessionInfo({
          session_id: sessionParam,
          db_session_id: sessionParam,
        });
        bootSessionIdRef.current = sessionParam;

        try {
          sessionStorage.setItem(LOCAL_SESSION_KEY, sessionParam);
        } catch {
          /* ignore */
        }
        return;
      }

      // Otherwise sessionStorage
      try {
        const stored = sessionStorage.getItem(LOCAL_SESSION_KEY);
        if (stored) {
          logInfo("Reusing stored session from sessionStorage", {
            sessionId: stored,
          });
          setSessionInfo({ session_id: stored, db_session_id: stored });
          bootSessionIdRef.current = stored;
        } else {
          logInfo("No URL or stored session; will create on first use");
        }
      } catch (e) {
        console.warn("[Analyst] Failed to read session from storage", e);
      }
    } catch (e) {
      console.warn("[Analyst] Failed to parse URL for tenant/session", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Create session (single-flight)
  // ---------------------------------------------------------------------------
  const startSessionCreation = useCallback(
    async ({ resetTitle = false, chat_title } = {}) => {
      const seq = ++sessionCreateSeqRef.current;
      const created = await createSession({
        userId: userContext.userId,
        tenantId: userContext.tenantId,
        instance: userContext.instanceId,
        name: DEFAULT_SESSION_TITLE,
        chat_title,
      });

      const normalized = {
        session_id: created?.session_id ?? created?.sessionId ?? null,
        db_session_id:
          created?.db_session_id ??
          created?.dbSessionId ??
          created?.session_id ??
          created?.sessionId ??
          null,
      };

      if (!normalized.session_id) {
        throw new Error("Session create did not return a session_id");
      }

      logInfo("Created new session", {
        sessionId: normalized.session_id,
        tenantId: userContext.tenantId,
        userId: userContext.userId,
      });

      try {
        sessionStorage.setItem(LOCAL_SESSION_KEY, normalized.session_id);
      } catch {
        /* ignore */
      }

      // Update URL
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("tenant", userContext.tenantId);
        url.searchParams.set("session", normalized.session_id);
        window.history.replaceState({}, "", url.toString());
      } catch {
        /* ignore */
      }

      if (seq === sessionCreateSeqRef.current) {
        setSessionInfo(normalized);

        setSession?.(
          (prev) => ({
            ...(prev || {}),
            id: normalized.session_id ?? prev?.id ?? null,
            title: resetTitle
              ? DEFAULT_SESSION_TITLE
              : prev?.title || DEFAULT_SESSION_TITLE,
            isCustom: resetTitle ? false : prev?.isCustom || false,
          }),
          { source: "Analyst.startSessionCreation" },
        );

        dispatchActiveSessionChanged({
          tenantId: userContext.tenantId,
          sessionId: normalized.session_id,
        });
        dispatchSessionsUpdated({
          tenantId: userContext.tenantId,
          sessionId: normalized.session_id,
        });
      }

      return normalized;
    },
    [
      dispatchActiveSessionChanged,
      dispatchSessionsUpdated,
      setSession,
      userContext.instanceId,
      userContext.tenantId,
      userContext.userId,
    ],
  );

  // ---------------------------------------------------------------------------
  // Ensure backend session exists (lazy; supports URL/storage session id)
  // ---------------------------------------------------------------------------

  const ensureSession = useCallback(
    async (extra = {}) => {
      // If we already have a session_id (e.g., from URL/sessionStorage), ensure it exists once
      if (sessionInfo?.session_id) {
        const id = sessionInfo.session_id;

        if (!ensuredSessionIdsRef.current.has(id)) {
          logInfo("ensureSession: ensuring existing session id", {
            sessionId: id,
            tenantId: userContext.tenantId,
            userId: userContext.userId,
            source: "url-or-storage",
          });

          await ensureSessionCreated({
            sessionId: id,
            userId: userContext.userId,
            tenantId: userContext.tenantId,
            instance: userContext.instanceId,
            ...extra,
          });

          ensuredSessionIdsRef.current.add(id);
        }

        return sessionInfo;
      }

      // If a creation is already in-flight, reuse it
      if (ensureSessionPromiseRef.current) {
        return ensureSessionPromiseRef.current;
      }

      ensureSessionPromiseRef.current = (async () => {
        try {
          return await startSessionCreation({ ...extra });
        } finally {
          ensureSessionPromiseRef.current = null;
        }
      })();

      return ensureSessionPromiseRef.current;
    },
    [
      sessionInfo,
      startSessionCreation,
      userContext.instanceId,
      userContext.tenantId,
      userContext.userId,
    ],
  );

  // Do NOT auto-create a session on mount or sidebar open.
  // Sessions are created lazily on first query or via New Chat.

  // ---------------------------------------------------------------------------
  // Resolve session title (auto until renamed)
  // ---------------------------------------------------------------------------
  const resolveSessionTitle = useCallback(
    (roundsForTitle) => {
      const ctxTitle = (session?.title || "").trim();
      if (session?.isCustom && ctxTitle) return ctxTitle;

      const auto = deriveAutoTitleFromRounds(roundsForTitle);
      return auto || ctxTitle || DEFAULT_SESSION_TITLE;
    },
    [session?.isCustom, session?.title],
  );

  // Keep context title updated (auto mode only)
  useEffect(() => {
    if (session?.isCustom) return;
    const auto = deriveAutoTitleFromRounds(rounds);
    if (!auto) return;

    setSession?.((prev) => {
      if (prev?.isCustom) return prev;
      if (prev?.title === auto) return prev;
      return {
        ...(prev || {}),
        id: prev?.id ?? sessionInfo?.session_id ?? null,
        title: auto,
        isCustom: false,
      };
    });
  }, [rounds, session?.isCustom, sessionInfo?.session_id, setSession]);

  const deriveChatTitle = useCallback(
    (lastQuery) => deriveChatTitleUtil(lastQuery),
    [],
  );

  // ---------------------------------------------------------------------------
  // Persist session rounds/status to backend (serialized)
  // ---------------------------------------------------------------------------
  const persistSessionState = useCallback(
    async ({
      roundsOverride,
      closeSession = false,
      reason,
      overrideSessionId,
    } = {}) => {
      const run = async () => {
        // Skip persistence while hydrating a session view
        if (isHydratingSessionRef.current && !closeSession) return;

        const activeRounds = Array.isArray(roundsOverride)
          ? roundsOverride
          : roundsRef.current || [];
        const hasRounds =
          Array.isArray(activeRounds) && activeRounds.length > 0;

        const lastRound = hasRounds
          ? activeRounds[activeRounds.length - 1]
          : null;
        const lastQueryText = lastRound?.user_query || null;

        // Skip no-op persists unless it's an "action" update (sql/results)
        const persistKey = JSON.stringify({
          sessionId: overrideSessionId || sessionInfo?.session_id || null,
          lastQuery: lastQueryText,
          roundsCount: hasRounds ? activeRounds.length : 0,
          lastSql: lastSql || null,
        });

        const isAction =
          reason === "update" &&
          (lastRound?.generated_sql ||
            lastRound?.validated_sql ||
            lastExecution);

        // If this is a plain user message (no SQL/results yet), skip update persists entirely
        if (reason === "update" && !isAction) {
          logInfo("Persist skipped: user-only update with no SQL/results");
          return;
        }

        if (reason === "post-llm") {
          const sessionId = sessionStorage.getItem(LOCAL_SESSION_KEY);

          await saveSessionState({
            sessionId: sessionId,
            tenantId: userContext.tenantId,
            userId: userContext.userId,
            rounds: activeRounds,
            lastQuery: lastQueryText,
          });
        }

        if (
          !closeSession &&
          persistKey === lastPersistKeyRef.current &&
          !isAction
        ) {
          logInfo("Persist skipped: no changes detected");
          return;
        }

        try {
          if (!hasRounds && !sessionInfo?.session_id) {
            logInfo("Persist skipped: no session and no rounds");
            return;
          }

          // Do not create a brand-new session only to immediately close it
          if (closeSession && !sessionInfo?.session_id) {
            logInfo(
              "Persist skipped: finalize requested but no active session_id",
            );
            return;
          }

          // For update operations, require an existing session
          if (reason === "update" && !sessionInfo?.session_id) {
            logInfo(
              "Persist skipped: update requested but no active session_id",
            );
            return;
          }

          const ensured = overrideSessionId
            ? {
                session_id: overrideSessionId,
                db_session_id: overrideSessionId,
              }
            : sessionInfo?.session_id
              ? {
                  session_id: sessionInfo.session_id,
                  db_session_id:
                    sessionInfo.db_session_id || sessionInfo.session_id,
                }
              : await ensureSession();

          if (!ensured?.session_id) return;

          // If persisting under override id, ensure it exists first
          if (overrideSessionId) {
            await ensureSessionCreated({
              sessionId: overrideSessionId,
              userId: userContext.userId,
              tenantId: userContext.tenantId,
              instance: userContext.instanceId,
            });
          }

          logInfo("Persisting session to backend", {
            sessionId: ensured.session_id,
            reason,
          });

          await saveSessionState({
            sessionId: ensured.session_id,
            tenantId: userContext.tenantId,
            userId: userContext.userId,
            rounds: activeRounds,
            lastQuery: lastQueryText,
            chatTitle: resolveSessionTitle(activeRounds),
            status: closeSession ? "closed" : "active",
            endAt: closeSession ? new Date().toISOString() : undefined,
            // preserveTitle: sessionInfo?.titleManuallySet || false,
            preserveTitle: true,
          });

          // Refresh sidebar list after update/finalize
          if (window.gwSidebarLoadSessions) {
            try {
              window.gwSidebarLoadSessions();
            } catch {
              /* ignore */
            }
          }

          lastPersistKeyRef.current = persistKey;
          dispatchSessionsUpdated({
            tenantId: userContext.tenantId,
            sessionId: ensured.session_id,
          });
        } catch (err) {
          logError("Failed to persist session", {
            reason,
            error: err?.message || String(err),
          });
        }
      };

      persistQueueRef.current = persistQueueRef.current
        .then(() => run())
        .catch((err) => {
          logError("Persist queue error", {
            error: err?.message || String(err),
          });
        });

      await persistQueueRef.current;
    },
    [
      dispatchSessionsUpdated,
      ensureSession,
      lastExecution,
      lastSql,
      resolveSessionTitle,
      sessionInfo,
      userContext.instanceId,
      userContext.tenantId,
      userContext.userId,
    ],
  );

  const applyRoundsUpdate = useCallback(
    (updater, { reason } = {}) => {
      setRounds((prev) => {
        const next =
          typeof updater === "function" ? updater(prev || []) : updater || [];
        if (Array.isArray(next)) {
          // void persistSessionState({
          //   roundsOverride: next,
          //   closeSession: false,
          //   reason: reason || 'update',
          // });
        }
        return next;
      });
    },
    [persistSessionState],
  );

  // Finalize current session (best-effort) before starting a new one / unload
  const finalizeCurrentSession = useCallback(async () => {
    if (!ENABLE_UPDATE_SESSION) return;
    if (isHydratingSessionRef.current) return;
    if (!roundsRef.current || roundsRef.current.length === 0) return;
    // await persistSessionState({ closeSession: true, reason: 'finalize' });
  }, [persistSessionState]);

  // Persist session when the user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      finalizeCurrentSession();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Avoid calling finalize here; cleanup runs on re-renders in StrictMode
    };
  }, [finalizeCurrentSession]);

  // ---------------------------------------------------------------------------
  // Tenant change (no auto session create)
  // ---------------------------------------------------------------------------
  const tenantIdRef = useRef(userContext.tenantId);
  useEffect(() => {
    tenantIdRef.current = userContext.tenantId;
  }, [userContext.tenantId]);

  const applyTenantChange = useCallback(
    async (newTenant) => {
      if (!newTenant) return;

      // If same tenant, just adjust welcome text
      if (newTenant === tenantIdRef.current) {
        setMessages((prev) => {
          if (!prev.length) return [createWelcomeMessage(newTenant)];
          const [first, ...rest] = prev;
          return [
            { ...first, content: createWelcomeMessage(newTenant).content },
            ...rest,
          ];
        });
        return;
      }

      resetActiveRequestState();

      // Close existing session best-effort (only if exists)
      await finalizeCurrentSession();

      setUserContext((prev) => ({ ...prev, tenantId: newTenant }));
      setLastError(null);
      setLastSql(null);
      setLastExecution(null);
      setFavoritePromptStates({});
      setQueryAnalyzer(null);
      setMessages([createWelcomeMessage(newTenant)]);
      setRounds([]);
      setSessionInfo(null);
      setSessionDetails(null);

      setSession?.(
        { id: null, title: DEFAULT_SESSION_TITLE, isCustom: false },
        { source: "Analyst.applyTenantChange" },
      );

      try {
        sessionStorage.removeItem(LOCAL_SESSION_KEY);
      } catch {
        /* ignore */
      }

      try {
        const url = new URL(window.location.href);
        url.searchParams.set("tenant", newTenant);
        url.searchParams.delete("session");
        window.history.replaceState({}, "", url.toString());
      } catch {
        /* ignore */
      }

      dispatchSessionsUpdated({ tenantId: newTenant });
    },
    [
      dispatchSessionsUpdated,
      finalizeCurrentSession,
      resetActiveRequestState,
      setSession,
    ],
  );

  useEffect(() => {
    if (!isActive) {
      wasActiveRef.current = false;
      return;
    }
    if (!wasActiveRef.current) {
      wasActiveRef.current = true;
      return;
    }
    if (client) void applyTenantChange(client);
  }, [client, isActive, applyTenantChange]);

  useEffect(() => {
    if (!isActive || !sessionInfo?.session_id) return;

    setSession?.(
      {
        id: sessionInfo.session_id,
        title:
          normalizeTitle(sessionInfo.chat_title) ||
          session?.title ||
          DEFAULT_SESSION_TITLE,
        isCustom: !!sessionInfo.titleManuallySet || !!session?.isCustom,
      },
      { force: true, source: "Analyst.restoreCachedActiveSession" },
    );

    try {
      sessionStorage.setItem(LOCAL_SESSION_KEY, sessionInfo.session_id);
    } catch {
      /* ignore */
    }
  }, [
    isActive,
    session?.isCustom,
    session?.title,
    sessionInfo?.chat_title,
    sessionInfo?.session_id,
    sessionInfo?.titleManuallySet,
    setSession,
  ]);

  const handleDeleteSession = (sessionId) => {
    console.log("In handleDeleteSession", sessionId);

    if (
      sessionId === "all_chat_history" ||
      sessionId === sessionInfo.session_id
    ) {
      setSessionInfo(null);
    }
  };

  const handleNewChatNew = useCallback(async (targetTenant) => {
    const tenant = targetTenant || userContext.tenantId;
    resetActiveRequestState();
    await finalizeCurrentSession();
    setSessionDetails(null);
    setLastError(null);
    setLastSql(null);
    setLastExecution(null);
    setFavoritePromptStates({});
    setQueryAnalyzer(null);
    setMessages([createWelcomeMessage(tenant)]);
    setRounds([]);
    setSessionInfo(null);
    setSession?.(
      { id: null, title: DEFAULT_SESSION_TITLE, isCustom: false },
      { source: "Analyst.handleNewChat.reset" },
    );

    const url = new URL(window.location.href);
    url.searchParams.delete("session");
    window.history.replaceState({}, "", url.toString());
    sessionStorage.removeItem(LOCAL_SESSION_KEY);
  });

  // ---------------------------------------------------------------------------
  // New Chat → finalize + reset UI + create exactly one new session
  // ---------------------------------------------------------------------------
  const handleNewChat = useCallback(
    async (targetTenant) => {
      const tenant = targetTenant || userContext.tenantId;
      resetActiveRequestState();

      // If tenant differs, switch tenant (this closes current and resets)
      if (tenant && tenant !== userContext.tenantId) {
        await applyTenantChange(tenant);
      } else {
        await finalizeCurrentSession();

        setLastError(null);
        setLastSql(null);
        setLastExecution(null);
        setFavoritePromptStates({});
        setQueryAnalyzer(null);
        setMessages([createWelcomeMessage(tenant)]);
        setRounds([]);
        setSessionInfo(null);
        setSession?.(
          { id: null, title: DEFAULT_SESSION_TITLE, isCustom: false },
          { source: "Analyst.handleNewChat.reset" },
        );
      }

      try {
        const normalized = await startSessionCreation({ resetTitle: true });

        setSessionInfo(normalized);
        setSession?.(
          {
            id: normalized.session_id,
            title: DEFAULT_SESSION_TITLE,
            isCustom: false,
          },
          { source: "Analyst.handleNewChat.created" },
        );

        dispatchActiveSessionChanged({
          tenantId: tenant,
          sessionId: normalized.session_id,
        });
        dispatchSessionsUpdated({
          tenantId: tenant,
          sessionId: normalized.session_id,
        });

        // Persist initial “empty chat” once (so it shows up immediately)
        // await persistSessionState({
        //   roundsOverride: [],
        //   closeSession: false,
        //   reason: 'new-chat-created',
        //   overrideSessionId: normalized.session_id,
        // });

        return normalized;
      } catch (err) {
        logError("Failed to start new chat session", {
          endpoint: "/new_session",
          userId: userContext.userId,
          tenantId: tenant,
          error: err?.message || String(err),
        });
        setLastError("Could not start a new chat session. Please try again.");
        return null;
      }
    },
    [
      applyTenantChange,
      dispatchActiveSessionChanged,
      dispatchSessionsUpdated,
      finalizeCurrentSession,
      persistSessionState,
      resetActiveRequestState,
      setSession,
      startSessionCreation,
      userContext.tenantId,
      userContext.userId,
    ],
  );

  // Expose bridges for Sidebar
  useEffect(() => {
    window.gwAnalystNewChat = handleNewChatNew;
    window.gwAnalystDeleteSession = handleDeleteSession;
    return () => {
      if (window.gwAnalystNewChat === handleNewChatNew)
        delete window.gwAnalystNewChat;
    };
  }, [handleNewChatNew, handleDeleteSession]);

  useEffect(() => {
    window.gwAnalystFinalizeSession = finalizeCurrentSession;
    return () => {
      if (window.gwAnalystFinalizeSession === finalizeCurrentSession)
        delete window.gwAnalystFinalizeSession;
    };
  }, [finalizeCurrentSession]);

  // Handle title updates from other components (like Sidebar rename)
  useEffect(() => {
    window.gwAnalystTitleUpdated = (sid, newTitle) => {
      if (sessionInfo?.session_id === sid) {
        setSessionInfo((prev) => ({
          ...(prev || {}),
          chat_title: newTitle,
          titleManuallySet: true,
        }));
        setSession?.((prev) => ({
          ...(prev || {}),
          title: normalizeTitle(newTitle),
          isCustom: true,
        }));
      }
    };

    return () => {
      if (window.gwAnalystTitleUpdated) delete window.gwAnalystTitleUpdated;
    };
  }, [sessionInfo?.session_id, setSession]);

  // ---------------------------------------------------------------------------
  // Reopen session (Sidebar calls this)
  // ---------------------------------------------------------------------------
  const handleReopenSession = useCallback(
    async (sid, hintTitle = null, hintIsCustom = false) => {
      if (!sid) return;

      resetActiveRequestState();
      const seq = ++reopenSeqRef.current;
      setIsLoading(true);
      setLastError(null);

      // Immediately mark current session context + placeholders to avoid mixing
      setSessionInfo({ session_id: sid, db_session_id: sid });
      setSessionDetails({ session_id: sid, db_session_id: sid });
      setSession?.(
        {
          id: sid,
          title: hintTitle || DEFAULT_SESSION_TITLE,
          isCustom: !!hintIsCustom,
        },
        { source: "Analyst.handleReopenSession.preload" },
      );

      setMessages([createWelcomeMessage(userContext.tenantId)]);
      setRounds([]);
      setLastSql(null);
      setLastExecution(null);
      setFavoritePromptStates({});

      isHydratingSessionRef.current = true;

      try {
        const url = `${API_ENDPOINTS.SESSION_DATA}/${encodeURIComponent(sid)}`;

        logInfo("Fetching session data", { url, sid });

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-Tenant-Id": userContext.tenantId,
          },
        });

        const raw = await response.text();
        if (!response.ok)
          throw new Error(
            `HTTP ${response.status}: ${JSON.parse(raw).message}`,
          );

        const data = parseJsonSafe(raw, {});
        const sessionPayload =
          data?.data?.session || data?.session || data?.data || {};

        const meta = (() => {
          const v = sessionPayload?.metadata;
          if (!v) return {};
          if (typeof v === "object") return v;
          try {
            return JSON.parse(v);
          } catch {
            return {};
          }
        })();

        const ops = Array.isArray(data?.data?.operations)
          ? data.data.operations
          : Array.isArray(data?.operations)
            ? data.operations
            : [];

        const favoritePrompts = Array.isArray(data?.data?.favorite_prompts)
          ? data.data.favorite_prompts
          : Array.isArray(data?.favorite_prompts)
            ? data.favorite_prompts
            : [];

        const opsRounds = deriveRoundsFromOps(ops);

        // Rounds might be stored in metadata, or in session payload
        const metadataRounds =
          (meta && Array.isArray(meta.rounds) && meta.rounds) ||
          sessionPayload?.rounds ||
          sessionPayload?.messages ||
          [];

        const chosenRounds = opsRounds.length
          ? opsRounds
          : Array.isArray(metadataRounds)
            ? metadataRounds
            : [];

        const newMessages = buildMessagesFromRounds(
          chosenRounds,
          userContext.tenantId,
        );
        const loadedFavoriteStates = buildFavoritePromptStates({
          favoritePrompts,
          rounds: chosenRounds,
          messages: newMessages,
        });

        const lastRound = chosenRounds.length
          ? chosenRounds[chosenRounds.length - 1]
          : null;
        const lastRoundWithSql = [...chosenRounds]
          .reverse()
          .find(
            (round) =>
              round?.validate_sql ||
              round?.validated_sql ||
              round?.generated_sql,
          );
        const lastQueryText = lastRound?.user_query || "";

        const lastSqlFromHistory =
          lastRoundWithSql?.validate_sql ||
          lastRoundWithSql?.validated_sql ||
          lastRoundWithSql?.generated_sql ||
          null;

        const toExecution = (payload, isPreview) => {
          if (!payload || typeof payload !== "object") return null;
          const columns = Array.isArray(payload.columns)
            ? payload.columns
            : Array.isArray(payload.column_names)
              ? payload.column_names
              : null;
          const rows = Array.isArray(payload.rows)
            ? payload.rows
            : Array.isArray(payload.data)
              ? payload.data
              : null;
          if (!columns || !rows) return null;
          return { isPreview, columns, rows };
        };

        const lastColumns = Array.isArray(lastRound?.columns)
          ? lastRound.columns
          : null;
        const lastRows = Array.isArray(lastRound?.sql_result)
          ? lastRound.sql_result
          : null;

        const executionFromRound =
          toExecution(lastRound?.execute_data, false) ||
          toExecution(lastRound?.preview_data, true) ||
          (lastColumns && lastRows
            ? { isPreview: false, columns: lastColumns, rows: lastRows }
            : null);

        const newSessionInfo = {
          session_id: sessionPayload.session_id || sessionPayload.id || sid,
          db_session_id:
            sessionPayload.db_session_id ||
            sessionPayload.dbSessionId ||
            sessionPayload.session_id ||
            sessionPayload.id ||
            sid,
        };

        const providedTitle =
          sessionPayload?.chat_title ||
          meta?.chat_title ||
          sessionPayload?.title ||
          sessionPayload?.name ||
          null;

        const derivedTitle = deriveChatTitle(lastQueryText);
        const resolvedTitle =
          (providedTitle && String(providedTitle).trim()) ||
          hintTitle ||
          derivedTitle ||
          DEFAULT_SESSION_TITLE;

        const isCustomTitle =
          !!(providedTitle && String(providedTitle).trim()) || !!hintIsCustom;

        if (seq === reopenSeqRef.current) {
          setRounds(chosenRounds);
          setMessages(newMessages);
          setFavoritePromptStates(loadedFavoriteStates);
          setSessionInfo(newSessionInfo);

          setLastSql(lastSqlFromHistory);

          if (executionFromRound) {
            setLastExecution(executionFromRound);
          } else if (lastColumns && lastRows) {
            setLastExecution({
              isPreview: lastRound?.is_preview ?? false,
              columns: lastColumns,
              rows: lastRows,
            });
          } else {
            setLastExecution(null);
          }

          setSession?.(
            {
              id: newSessionInfo.session_id,
              title: normalizeTitle(resolvedTitle),
              isCustom: !!isCustomTitle,
            },
            { source: "Analyst.handleReopenSession.loaded" },
          );

          try {
            sessionStorage.setItem(
              LOCAL_SESSION_KEY,
              newSessionInfo.session_id,
            );
          } catch {
            /* ignore */
          }

          try {
            const u = new URL(window.location.href);
            u.searchParams.set("tenant", userContext.tenantId);
            u.searchParams.set("session", newSessionInfo.session_id);
            window.history.replaceState({}, "", u.toString());
          } catch {
            /* ignore */
          }

          dispatchActiveSessionChanged({
            tenantId: userContext.tenantId,
            sessionId: newSessionInfo.session_id,
          });
          dispatchSessionsUpdated({
            tenantId: userContext.tenantId,
            sessionId: newSessionInfo.session_id,
          });
        }
      } catch (err) {
        if (seq === reopenSeqRef.current) {
          logError("Error fetching session data", err);
          setLastError(`Failed to load session: ${err.message || String(err)}`);
        }
      } finally {
        if (seq === reopenSeqRef.current) {
          isHydratingSessionRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [
      dispatchActiveSessionChanged,
      dispatchSessionsUpdated,
      buildFavoritePromptStates,
      deriveChatTitle,
      resetActiveRequestState,
      setSession,
      userContext.tenantId,
    ],
  );

  useEffect(() => {
    if (
      bootSessionIdRef.current &&
      sessionInfo?.session_id === bootSessionIdRef.current &&
      rounds.length === 0 &&
      !isLoading
    ) {
      handleReopenSession(sessionInfo.session_id);
      bootSessionIdRef.current = null;
    }
  }, [handleReopenSession, isLoading, rounds.length, sessionInfo?.session_id]);

  useEffect(() => {
    window.gwAnalystReopenSession = handleReopenSession;
    return () => {
      if (window.gwAnalystReopenSession === handleReopenSession)
        delete window.gwAnalystReopenSession;
    };
  }, [handleReopenSession]);

  // ---------------------------------------------------------------------------
  // 1) Natural language → SQL (/generate_query) + HITL / guardrails
  // ---------------------------------------------------------------------------
  const handleSendMessage = async (
    text,
    client_exclusions_ui,
    skipGuardrails = false,
  ) => {
    const trimmed = text?.trim();
    if (!trimmed) return;
    const requestScopeId = startRequestScope();

    if (ENABLE_DEMO_QUERY_PARAMS) {
      if (isLoading) return;

      const opId = createOperationId("queries");
      setLastClientExclusionsUi(null);
      setLastError(null);
      setLastExecution(null);
      setQueryAnalyzer(null);
      setIsLoading(true);
      cancelRequestedRef.current = false;

      const userMessage = {
        id: Date.now(),
        role: "user",
        user_query: trimmed,
        generated_sql: null,
        execution_summary: null,
        content: trimmed,
        timestamp: nowIso(),
        op_id: opId,
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const data = await generateQueries({
          criteriaJson: trimmed,
        });

        if (
          cancelRequestedRef.current ||
          !isCurrentRequestScope(requestScopeId)
        )
          return;

        const totalQueries = data.steps.reduce(
          (count, step) => count + step.queries.length,
          0,
        );
        if (totalQueries > 0) {
          setLastSql(
            data.steps
              .flatMap((step) => step.queries)
              .filter(Boolean)
              .join("\n\n"),
          );
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "system",
            isGeneratedQueries: true,
            title: "Generated Data Queries",
            editId: data.editId,
            steps: data.steps,
            rawResponse: data.raw,
            user_query: trimmed,
            generated_sql: null,
            execution_summary: null,
            content: `${totalQueries} SQL quer${totalQueries === 1 ? "y" : "ies"} generated for edit ${data.editId || "unknown"}.`,
            timestamp: nowIso(),
            op_id: opId,
          },
        ]);
      } catch (err) {
        if (err?.name === "AbortError") return;
        logError("Error in /generate_queries", err);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            role: "system",
            isError: true,
            user_query: trimmed,
            generated_sql: null,
            execution_summary: null,
            content:
              err.message ||
              "Unable to generate queries from the Criteria Analyzer JSON.",
            timestamp: nowIso(),
            op_id: opId,
          },
        ]);
      } finally {
        if (isCurrentRequestScope(requestScopeId)) setIsLoading(false);
      }

      return;
    }

    setLastClientExclusionsUi(
      SHOW_EXCLUSIONS_TOGGLE ? (client_exclusions_ui ?? null) : null,
    );

    const userMessage = {
      id: Date.now(),
      role: "user",
      user_query: trimmed,
      generated_sql: null,
      execution_summary: null,
      content: trimmed,
      timestamp: nowIso(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const newRound = {
      user_query: trimmed,
      generated_sql: null,
      validated_sql: null,
      faithfulness_summary_reason: null,
      faithfulness_recommendation: null,
      execution_summary: null,
      sql_result: null,
      columns: null,
      timestamp: userMessage.timestamp,
    };

    applyRoundsUpdate((prev) => [...(prev || []), newRound], {
      reason: "user-message",
    });

    // Rerun helper
    const lower = trimmed.toLowerCase();
    const isRerunRequest =
      !!lastSql &&
      (lower === "rerun last query" ||
        lower === "re-run last query" ||
        lower === "run last query again" ||
        lower === "rerun last sql");

    if (isRerunRequest) {
      executeQuery(false);
      return;
    }

    setLastError(null);
    setLastExecution(null);
    setQueryAnalyzer(null);
    setIsLoading(true);
    cancelRequestedRef.current = false;
    let requestId = null;

    try {
      var sess;

      if (sessionDetails) {
        sess = sessionDetails;
      } else {
        sess = await ensureSession({ chat_title: trimmed });
        setSessionDetails(sess);
      }
      const sessionId = sess.session_id;
      const dbSessionId = sess.db_session_id || sessionId;
      if (cancelRequestedRef.current || !isCurrentRequestScope(requestScopeId))
        return;

      if (!skipGuardrails) {
        logInfo("Running guardrails check", {
          endpoint: "/query_analyzer",
          sessionId,
          userId: userContext.userId,
          tenantId: userContext.tenantId,
          query: trimmed,
        });

        const guardResult = await analyzeQuery(
          trimmed,
          sessionId,
          userContext.userId,
          userContext.tenantId,
        );
        if (
          cancelRequestedRef.current ||
          !isCurrentRequestScope(requestScopeId)
        )
          return;

        if (guardResult?.human_intervention_required) {
          setIsLoading(false);
          logInfo("Human-In-The-Loop intervention triggered", {
            interventionType: guardResult.intervention_type,
            originalQuery: trimmed,
          });

          const hitlMessage = {
            id: Date.now() + 1,
            role: "agent",
            type: "hitl_intervention",
            content: `I found a validation issue with your query. Please review the suggestions below.`,
            interventionType: guardResult.intervention_type,
            interventionDetails: guardResult.intervention_details,
            originalQuery: trimmed,
            timestamp: nowIso(),
          };

          setMessages((prev) => [...prev, hitlMessage]);
          return;
        }
      } else {
        logInfo("Skipping guardrails check - user already approved via HITL", {
          sessionId,
          query: trimmed,
        });
      }
      if (cancelRequestedRef.current || !isCurrentRequestScope(requestScopeId))
        return;

      const payload = {
        query: trimmed,
        user_id: userContext.userId,
        session_id: sessionId,
        db_session_id: dbSessionId,
        op_id: createOperationId("generate"),
        ...(SHOW_EXCLUSIONS_TOGGLE ? { client_exclusions_ui } : {}),
      };
      if (SHOW_HINDSIGHT_TOGGLE && isHindsightEnabled) {
        payload.enable_hindsight = true;
      }

      logInfo("Calling /generate_query", { sessionId, payload });
      const { controller, requestId: activeRequestId } = beginCancelableRequest(
        {
          opId: payload.op_id,
          sessionId,
          type: "generate_query",
        },
      );
      requestId = activeRequestId;

      const response = await fetch(API_ENDPOINTS.GENERATE_SQL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Tenant-Id": userContext.tenantId,
          "X-Session-Id": sessionId,
          "X-User-Id": userContext.userId,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const raw = await response.text();
      if (!isCurrentRequestScope(requestScopeId)) return;
      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${JSON.parse(raw).message}`);

      const data = parseJsonSafe(raw, {});
      const sqlText =
        data.generated_sql ||
        data.sql ||
        data.validated_sql ||
        "No SQL returned from API.";
      const op_id = data?.session_info?.op_id || payload.op_id;
      updateActiveRequest(requestId, { opId: op_id });

      setLastSql(sqlText);

      // Update the last round with SQL
      let updatedRounds = null;
      setRounds((prev) => {
        if (!prev?.length) return prev || [];
        const next = [...prev];
        const last = { ...next[next.length - 1] };
        last.generated_sql = sqlText;
        last.op_id = op_id;
        last.validated_sql = data.sql || sqlText;
        last.faithfulness_summary_reason =
          data.faithfulness_summary_reason || null;
        last.faithfulness_recommendation =
          data.faithfulness_recommendation || null;
        next[next.length - 1] = last;
        updatedRounds = next;
        return next;
      });

      // Optional: if backend provides a chat_title, set it as custom
      if (data?.chat_title && String(data.chat_title).trim()) {
        setSession?.(
          (prev) => ({
            ...(prev || {}),
            id: prev?.id ?? sessionId,
            title: normalizeTitle(String(data.chat_title).trim()),
            isCustom: true,
          }),
          { source: "Analyst.handleSendMessage.serverChatTitle" },
        );
      }

      const systemMessage = {
        id: Date.now() + 1,
        role: "system",
        user_query: trimmed,
        generated_sql: sqlText,
        op_id: op_id,
        faithfulness_summary_reason: data.faithfulness_summary_reason || null,
        faithfulness_recommendation: data.faithfulness_recommendation || null,
        execution_summary: null,
        content: sqlText,
        isSql: true,
        timestamp: nowIso(),
      };

      const validationMessage = {
        id: Date.now() + 2,
        role: "system",
        kind: "validation",
        isValidation: true,
        op_id: op_id,
        content: "Query is valid and ready to run.",
        timestamp: nowIso(),
      };

      setMessages((prev) => [...prev, systemMessage, validationMessage]);

      // Explicit save once LLM returns
      const roundsToPersist = updatedRounds || roundsRef.current || [];
      // await persistSessionState({ roundsOverride: roundsToPersist, closeSession: false, reason: 'post-llm' });

      // Query analyzer (lightweight panel)
      try {
        const qaResp = await fetch(API_ENDPOINTS.QUERY_ANALYZER, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Tenant-Id": userContext.tenantId,
            "X-Session-Id": sessionId,
            "X-User-Id": userContext.userId,
          },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: userContext.userId,
            query: sqlText,
          }),
          signal: controller.signal,
        });

        const qaRaw = await qaResp.text();
        if (qaResp.ok) {
          const qaData = parseJsonSafe(qaRaw, {});
          setQueryAnalyzer(qaData);
        } else {
          console.warn("[Analyst] query_analyzer failed", qaResp.status, qaRaw);
        }
      } catch (e) {
        if (e?.name === "AbortError") return;
        console.warn("[Analyst] query_analyzer exception", e);
      }
    } catch (err) {
      if (err?.name === "AbortError") {
        logInfo("generate_query cancelled by user");
        return;
      }
      logError("Error in /generate_query", err);

      setLastError(`Generate Query failed: ${err.message || String(err)}`);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 5,
          role: "system",
          user_query: null,
          generated_sql: null,
          execution_summary: null,
          content: "There was an error generating SQL. Please try again.",
          timestamp: nowIso(),
        },
      ]);
    } finally {
      if (requestId) finishCancelableRequest(requestId);
      else if (isCurrentRequestScope(requestScopeId)) setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 2) Execute SQL (preview/full) via /execute_query
  // ---------------------------------------------------------------------------
  const executeQuery = async (isPreview, message) => {
    const sqlToRun = message?.generated_sql || message?.content || lastSql;
    if (!sqlToRun) return;
    const requestScopeId = startRequestScope();

    setIsLoading(true);
    setLastError(null);
    cancelRequestedRef.current = false;
    let requestId = null;

    try {
      lockAutoScroll();

      const isDirectSqlExecution = Boolean(
        message?.isGeneratedQuerySql ||
          message?.isPartASql ||
          (message?.isSql && sqlToRun),
      );

      if (isDirectSqlExecution) {
        const op_id =
          message?.op_id ||
          createOperationId(
            message?.isPartASql ? "execute-parta" : "execute-generated-sql",
          );
        const response = await fetch(API_ENDPOINTS.EXECUTE_SQL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            buildExecuteQueryRequest({
              sql: sqlToRun,
              params: message?.params || {},
            }),
          ),
        });

        const raw = await response.text();
        if (!isCurrentRequestScope(requestScopeId)) return;
        const data = parseJsonSafe(raw, {});
        const typedMessage = getTypedBackendMessage(data);

        if (!response.ok) {
          throw new Error(
            typedMessage ||
              data?.detail ||
              data?.error ||
              data?.message ||
              `HTTP ${response.status}: ${raw}`,
          );
        }

        if (typedMessage || Array.isArray(data.blocking_errors)) {
          const content =
            typedMessage ||
            data.blocking_errors
              .map((finding) => finding?.message || finding?.code)
              .filter(Boolean)
              .join(" ");
          setLastError(content);
          setMessages((prev) =>
            insertAfterLastOpId(prev, op_id, {
              id: Date.now() + 4,
              role: "system",
              user_query: null,
              generated_sql: sqlToRun,
              execution_summary: null,
              content,
              timestamp: nowIso(),
              op_id,
            }),
          );
          return;
        }

        const { columns, rows } = normalizeExecuteQueryResponse(data);
        setLastExecution({ isPreview, columns, rows });

        const executionMessage = buildExecutionMessage({
          rowsLength: rows.length,
          lastSql: sqlToRun,
          isPreview,
          resultsData: { isPreview, columns, rows },
          opId: op_id,
          nowIso,
        });
        setMessages((prev) => insertAfterLastOpId(prev, op_id, executionMessage));
        unlockAutoScrollNextFrame();
        return;
      }

      var sess;

      if (sessionDetails) {
        sess = sessionDetails;
      } else {
        sess = await ensureSession();
        setSessionDetails(sess);
      }
      const sessionId = sess.session_id;
      const dbSessionId = sess.db_session_id || sessionId;
      if (cancelRequestedRef.current || !isCurrentRequestScope(requestScopeId))
        return;

      const op_id =
        message?.op_id ||
        roundsRef.current?.[roundsRef.current.length - 1]?.op_id ||
        createOperationId("execute");
      const payload = {
        op_id: op_id,
        query: sqlToRun,
        user_id: userContext.userId,
        is_preview: isPreview,
        session_id: sessionId,
        db_session_id: dbSessionId,
        ...(SHOW_EXCLUSIONS_TOGGLE
          ? {
              client_exclusions_ui:
                lastClientExclusionsUi ??
                queryAnalyzer?.client_exclusions_ui ??
                null,
            }
          : {}),
      };
      if (SHOW_HINDSIGHT_TOGGLE && isHindsightEnabled) {
        payload.enable_hindsight = true;
      }

      logInfo("Calling /execute_query", { sessionId, payload });
      const { controller, requestId: activeRequestId } = beginCancelableRequest(
        {
          opId: op_id,
          sessionId,
          type: "execute_query",
        },
      );
      requestId = activeRequestId;

      const response = await fetch(API_ENDPOINTS.EXECUTE_SQL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Tenant-Id": userContext.tenantId,
          "X-Session-Id": sessionId,
          "X-User-Id": userContext.userId,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const raw = await response.text();
      if (!isCurrentRequestScope(requestScopeId)) return;
      if (!response.ok)
        throw new Error(`HTTP ${response.status}:  ${JSON.parse(raw).message}`);

      const data = parseJsonSafe(raw, {});

      if (!Array.isArray(data.columns) || !Array.isArray(data.sql_result)) {
        setLastError("execute_query returned results in an unexpected format.");
        return;
      }

      const columns = data.columns;
      const rows = data.sql_result;

      // Update last round
      let updatedRounds = null;
      setRounds((prev) => {
        if (!prev?.length) return prev || [];
        const next = [...prev];
        const targetIndex = op_id
          ? next.findIndex((round) => round?.op_id === op_id)
          : -1;
        const updateIndex = targetIndex >= 0 ? targetIndex : next.length - 1;
        const target = { ...next[updateIndex] };
        target.columns = columns;
        target.sql_result = rows;
        target.execution_summary = {
          rows_returned: rows.length,
          mode: isPreview ? "preview" : "full",
        };
        next[updateIndex] = target;
        updatedRounds = next;
        return next;
      });

      setLastExecution({ isPreview, columns, rows });

      // setMessages((prev) => [
      //   ...prev,
      //   {
      //     id: Date.now() + 3,
      //     role: 'system',
      //     user_query: null,
      //     generated_sql: lastSql,
      //     execution_summary: {
      //       rows_returned: rows.length,
      //       mode: isPreview ? 'preview' : 'full',
      //     },
      //     content: isPreview
      //       ? `Preview executed (${rows.length} rows).`
      //       : `Full query executed (${rows.length} rows).`,
      //     timestamp: nowIso(),
      //   },
      // ]);
      unlockAutoScrollNextFrame();
      lockAutoScroll();
      const newMessage = buildExecutionMessage({
        rowsLength: rows.length,
        lastSql: sqlToRun,
        isPreview,
        resultsData: { isPreview, columns, rows },
        opId: op_id, // <-- pass the op_id you received
        nowIso,
      });
      setMessages((prev) => insertAfterLastOpId(prev, op_id, newMessage));

      unlockAutoScrollNextFrame();

      // Save after execution
      const roundsToPersist = updatedRounds || roundsRef.current || [];
      // await persistSessionState({ roundsOverride: roundsToPersist, closeSession: false, reason: 'post-execute' });
    } catch (err) {
      if (err?.name === "AbortError") {
        logInfo("execute_query cancelled by user");
        unlockAutoScrollNextFrame();
        return;
      }
      logError("Error in /execute_query", err);
      setLastError(`execute_query failed: ${err.message || String(err)}`);

      setMessages((prev) =>
        insertAfterLastOpId(prev, message?.op_id, {
          id: Date.now() + 4,
          role: "system",
          user_query: null,
          generated_sql: sqlToRun,
          execution_summary: null,
          content: "There was an error executing the query. Please try again.",
          timestamp: nowIso(),
          op_id: message?.op_id,
        }),
      );

      unlockAutoScrollNextFrame();
    } finally {
      if (requestId) finishCancelableRequest(requestId);
      else if (isCurrentRequestScope(requestScopeId)) setIsLoading(false);
    }
  };

  const handleSaveFavoritePrompt = useCallback(
    async (message) => {
      if (!ENABLE_DEMO_FAVORITES) return;

      const sourcePrompt = String(message?.user_query || "").trim();
      if (!sourcePrompt) return;

      const favoriteKey = getFavoritePromptKey(message);
      setFavoritePromptStates((prev) => ({ ...prev, [favoriteKey]: "saving" }));
      setLastError(null);

      try {
        const sess = sessionDetails || (await ensureSession());
        if (!sessionDetails) {
          setSessionDetails(sess);
        }

        const sessionId = sess.session_id;
        const opId =
          message?.op_id ||
          roundsRef.current?.[roundsRef.current.length - 1]?.op_id ||
          createOperationId("favorite");
        const promptName = sourcePrompt;

        const response = await fetch(API_ENDPOINTS.FAVORITE_PROMPTS_SAVE, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Tenant-Id": userContext.tenantId || "",
            "X-User-Id": userContext.userId || "",
            "X-Session-Id": sessionId || "",
          },
          body: JSON.stringify({
            tenant_id: userContext.tenantId || "",
            session_id: sessionId,
            op_id: opId,
            prompt_name: promptName || "Favorite query",
            prompt_text: promptName || "Favorite query",
            prompt_category: "Data Agent",
          }),
        });

        const raw = await response.text();
        if (!response.ok) {
          const data = parseJsonSafe(raw, {});
          throw new Error(data?.message || `HTTP ${response.status}`);
        }

        setFavoritePromptStates((prev) => ({
          ...prev,
          [favoriteKey]: "saved",
        }));
      } catch (err) {
        logError("Error in /favorite_prompts/save", err);
        setFavoritePromptStates((prev) => ({
          ...prev,
          [favoriteKey]: "error",
        }));
        setLastError(`Save favorite failed: ${err.message || String(err)}`);
      }
    },
    [
      createOperationId,
      ensureSession,
      getFavoritePromptKey,
      sessionDetails,
      userContext.tenantId,
      userContext.userId,
    ],
  );

  const scrollLockRef = useRef(0);

  function lockAutoScroll() {
    scrollLockRef.current += 1;
  }

  function unlockAutoScrollNextFrame() {
    const release = () => {
      scrollLockRef.current = Math.max(0, scrollLockRef.current - 1);
    };
    // Release after the next paint so the effect that fires for this commit is still suppressed
    if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
      requestAnimationFrame(() => setTimeout(release, 500));
    } else {
      setTimeout(release, 0);
    }
  }
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const displaySessionTitle = resolveSessionTitle(rounds);
  const showRequestControls = isLoading && hasActiveRequest;
  const showLoadingIndicator = isLoading;

  return (
    <div
      id="view-analyst"
      className="flex flex-col h-full main-tab-content active"
    >
      <header className="flex items-center justify-between h-16 px-6 border-b border-gray-300 bg-white">
        <div className="flex items-center text-sm flex-1">
          <span className="text-xs text-secondary mr-1">Session:</span>
          <span className="font-semibold">{displaySessionTitle}</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-secondary">Mode:</span>
            <span
              className="px-3 py-1.5 rounded text-xs font-semibold border bg-primary text-softblack border-primary"
              title="Paste full Criteria Analyzer JSON; calls POST /generate_queries"
            >
              Criteria JSON → Queries
            </span>
          </div>
          {SHOW_HINDSIGHT_TOGGLE && (
            <div className="ml-4 flex items-center">
              <button
                type="button"
                role="switch"
                aria-checked={isHindsightEnabled}
                onClick={() => setIsHindsightEnabled((prev) => !prev)}
                className="px-2 py-2 bg-primary text-softblack rounded-lg hover:bg-primary flex items-center gap-2 min-w-[110px] cursor-pointer"
                title={isHindsightEnabled ? "RAG On" : "RAG Off"}
              >
                <div
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                    isHindsightEnabled ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      isHindsightEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </div>
                <span className="text-xs font-medium text-white">RAG</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-new-chat"
            type="button"
            onClick={() => handleNewChat()}
            className="hidden"
          >
            New Chat
          </button>
        </div>
      </header>

      <main className="chat-transcript flex-1 overflow-y-auto px-6 pt-2 pb-4">
        {messages.map((msg) => {
          if (ENABLE_DEMO_HITL && msg.type === "hitl_intervention") {
            return (
              <HITLChatMessage
                key={msg.id}
                interventionDetails={msg.interventionDetails}
                originalQuery={msg.originalQuery}
                onProceed={async () => {
                  await respondToHitl(
                    "proceed",
                    null,
                    sessionInfo?.session_id,
                    userContext.userId,
                    userContext.tenantId,
                  );
                  handleSendMessage(msg.originalQuery, true, true);
                }}
                onModify={async (modifiedQuery) => {
                  await respondToHitl(
                    "modify",
                    modifiedQuery,
                    sessionInfo?.session_id,
                    userContext.userId,
                    userContext.tenantId,
                  );
                  handleSendMessage(modifiedQuery, true, false);
                }}
                onCancel={async () => {
                  await respondToHitl(
                    "cancel",
                    null,
                    sessionInfo?.session_id,
                    userContext.userId,
                    userContext.tenantId,
                  );
                  closeHitl();
                  setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                }}
                isLoading={isLoading}
              />
            );
          }

          return (
            <ChatBubble
              key={msg.id}
              message={msg}
              executeQuery={executeQuery}
              onFavorite={handleSaveFavoritePrompt}
              favoriteState={favoritePromptStates[getFavoritePromptKey(msg)]}
              isLoading={showRequestControls}
            />
          );
        })}

        {/* {lastSql && (
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              className="px-3 py-1 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50"
              onClick={() => executeQuery(true)}
              disabled={isLoading}
            >
              Preview (10 rows)
            </button>
            <button
              type="button"
              className="px-3 py-1 text-sm rounded border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
              onClick={() => executeQuery(false)}
              disabled={isLoading}
            >
              Run full query
            </button>
          </div>
        )} */}

        {/* {queryAnalyzer && (
          <div className="mt-3 p-3 border border-gray-200 rounded bg-gray-50 text-xs text-gray-700">
            <div className="font-semibold mb-1">Query Analyzer</div>
            <pre className="whitespace-pre-wrap overflow-auto max-h-40">
              {JSON.stringify(queryAnalyzer, null, 2)}
            </pre>
          </div>
        )} */}

        {/* <ResultsTable execution={lastExecution} /> */}

        {showLoadingIndicator && (
          <div className="chat-bubble loading mt-3 flex items-center gap-3">
            <span>Working… ⏳</span>
            {showRequestControls && (
              <button
                type="button"
                className="px-3 py-1 text-xs rounded border border-red-500 text-red-600 bg-white hover:bg-red-50 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                onClick={cancelActiveRequest}
                disabled={isCancelling}
              >
                {isCancelling ? "Stopping..." : "Stop"}
              </button>
            )}
          </div>
        )}

        <div ref={endOfChatRef} />
      </main>

      {/* HITL Modal */}
      {ENABLE_DEMO_HITL && (
        <QueryHITLModal
          isOpen={hitlState.isVisible}
          interventionType={hitlState.interventionType}
          interventionDetails={hitlState.interventionDetails}
          originalQuery={hitlState.originalQuery}
          isLoading={hitlLoading}
          error={hitlError}
          sessionId={sessionInfo?.session_id}
          tenantId={userContext.tenantId}
          userId={userContext.userId}
          onProceed={async () => {
            await respondToHitl(
              "proceed",
              null,
              sessionInfo?.session_id,
              userContext.userId,
              userContext.tenantId,
            );
            closeHitl();
            handleSendMessage(hitlState.originalQuery, true, true);
          }}
          onModify={async (modifiedQuery) => {
            await respondToHitl(
              "modify",
              modifiedQuery,
              sessionInfo?.session_id,
              userContext.userId,
              userContext.tenantId,
            );
            closeHitl();
            handleSendMessage(modifiedQuery, true, false);
          }}
          onCancel={async () => {
            await respondToHitl(
              "cancel",
              null,
              sessionInfo?.session_id,
              userContext.userId,
              userContext.tenantId,
            );
            closeHitl();
          }}
          onOriginal={async () => {
            await respondToHitl(
              "original",
              null,
              sessionInfo?.session_id,
              userContext.userId,
              userContext.tenantId,
            );
            closeHitl();
            handleSendMessage(hitlState.originalQuery, true, true);
          }}
        />
      )}

      {/* Error Banner - Visible at top */}
      {lastError && (
        <div
          style={{
            background: "#fee",
            borderBottom: "2px solid #f44",
            color: "#c00",
            padding: "12px 16px",
            fontSize: "0.95rem",
            fontWeight: "500",
            position: "sticky",
            top: 0,
            zIndex: 999,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <strong>⚠️ Error:</strong> {lastError}
          <button
            onClick={() => setLastError(null)}
            style={{
              background: "none",
              border: "none",
              color: "#c00",
              cursor: "pointer",
              float: "right",
              fontSize: "1.2rem",
              padding: "0",
            }}
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <InputBar
        onSend={handleSendMessage}
        onStop={cancelActiveRequest}
        disableSubmit={isLoading}
        isLoading={showRequestControls}
        placeholder={
          "Paste Criteria Analyzer JSON with edit_id and steps, then send..."
        }
      />
    </div>
  );
};

export default Analyst;
