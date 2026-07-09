import React, { createContext, useContext, useState, useCallback } from "react";
import { getSessionStore } from "../api/sessionStore";
const sessionStore = getSessionStore();

// then:
await sessionStore.createSession({ tenantId, userId, name });
await sessionStore.saveSessionState({ tenantId, userId, sessionId, messages });
const sessions = await sessionStore.listSessions({ tenantId, userId });

import { DEFAULT_TENANT_ID, DEFAULT_USER_ID } from "../config/apiConfig";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
    const [tenant, setTenant] = useState(DEFAULT_TENANT_ID || "MDWise");
    const [user] = useState({
        user_id: DEFAULT_USER_ID || "TestUser",
        display_name: "Test User",
    });

    const [session, setSession] = useState(null);

    const startNewSession = useCallback(
        async (overrideTenant) => {
            const tenantId = overrideTenant || tenant;

            const data = await createSession({
                userId: user.user_id,
                tenantId: tenantId,
                instance: "dev",
            });

            const normalized = {
                sessionId: data.session_id ?? data.sessionId ?? null,
                dbSessionId: data.db_session_id ?? data.dbSessionId ?? null,
                tenant: tenantId,
                createdAt: data.created_at ?? null,
            };

            setTenant(tenantId);
            setSession(normalized);
            return normalized;
        },
        [tenant, user]
    );

    return (
        <SessionContext.Provider
            value={{ user, tenant, session, setTenant, startNewSession }}
        >
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const ctx = useContext(SessionContext);
    if (!ctx) {
        throw new Error("useSession must be used within SessionProvider");
    }
    return ctx;
}
