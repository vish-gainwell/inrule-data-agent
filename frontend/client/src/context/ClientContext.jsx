import React, { createContext, useContext, useState, useCallback } from "react";
import { DEFAULT_TENANT_ID } from "../config/apiConfig";

const ClientContext = createContext(null);

const normalizeSession = (value) => {
  if (!value) {
    return {
      id: null,
      title: "New Chat Session",
      isCustom: false,
    };
  }

  const title =
    (value.title && value.title.trim()) ||
    (value.name && value.name.trim()) ||
    "New Chat Session";

  return {
    id: value.id ?? value.session_id ?? null,
    session_id: value.session_id ?? value.id ?? null,
    title,
    isCustom: !!value.isCustom,
  };
};

export const ClientProvider = ({ children }) => {
  const [client, _setClient] = useState(DEFAULT_TENANT_ID);
  const [sessionState, setSessionState] = useState(
    normalizeSession({
      id: null,
      title: "New Chat Session",
      isCustom: false,
    })
  );

  const setClient = useCallback(
    (newClient, options = {}) => {
      const normalized = typeof newClient === "string" ? newClient : DEFAULT_TENANT_ID;
      const hasChanged = client !== normalized;
      
      // Log client changes for debugging
      if (hasChanged) {
        console.log('[ClientContext] Client changed', {
          from: client,
          to: normalized,
          options,
          source: options.source || 'unknown'
        });

        // Reset session state so other tabs don't reuse the previous tenant session
        setSessionState(
          normalizeSession({
            id: null,
            title: "New Chat Session",
            isCustom: false,
          })
        );

        try {
          sessionStorage.removeItem('gw_analyst_active_session_id');
        } catch {
          /* ignore */
        }
      }
      
      _setClient(normalized);
    },
    [client]
  );

  const setSession = useCallback(
    (updater, options = {}) => {
      setSessionState((prev) => {
        const nextRaw = typeof updater === "function" ? updater(prev) : updater;
        const next = normalizeSession(nextRaw);

        // Guard: prevent changing to a different session ID unless forced
        if (
          !options.force &&
          prev?.id &&
          next?.id &&
          prev.id !== next.id
        ) {
          console.warn('[ClientContext] Prevented unintended session ID change', {
            from: prev.id,
            to: next.id,
            prevTitle: prev.title,
            nextTitle: next.title,
            options,
            source: options.source || 'unknown'
          });
          return prev;
        }

        // Avoid state churn if nothing changed
        if (
          prev &&
          prev.id === next.id &&
          prev.title === next.title &&
          prev.isCustom === next.isCustom
        ) {
          return prev;
        }

        // Log session changes for debugging
        if (prev?.id !== next?.id || prev?.title !== next?.title) {
          console.log('[ClientContext] Session state changed', {
            prev: { id: prev?.id, title: prev?.title, isCustom: prev?.isCustom },
            next: { id: next?.id, title: next?.title, isCustom: next?.isCustom },
            options,
            source: options.source || 'unknown'
          });
        }

        return next;
      });
    },
    []
  );

  return (
    <ClientContext.Provider value={{ client, setClient, session: sessionState, setSession }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const ctx = useContext(ClientContext);
  if (!ctx) {
    throw new Error("useClient must be used within ClientProvider");
  }
  return ctx;
};
