// src/api/sessionStore.js
import { createSession as apiCreate, saveSessionState as apiSave, listSessions as apiList } from "./sessionApi";

// Simple local “DB” (works offline). Use IndexedDB via localforage if you want it more robust.
// This version uses localStorage for minimal dependencies.

const LS_KEY = (tenantId, userId) => `gw_sessions__${tenantId}__${userId}`;

function loadAll(tenantId, userId) {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY(tenantId, userId)) || "[]");
    } catch {
        return [];
    }
}

function saveAll(tenantId, userId, sessions) {
    localStorage.setItem(LS_KEY(tenantId, userId), JSON.stringify(sessions));
}

function newId() {
    return crypto?.randomUUID?.() ?? `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const LocalStore = {
    async listSessions({ tenantId, userId }) {
        return loadAll(tenantId, userId);
    },

    async createSession({ tenantId, userId, name = "New Chat Session" }) {
        const sessions = loadAll(tenantId, userId);
        const session_id = newId();
        const now = new Date().toISOString();
        const s = {
            session_id,
            tenant_id: tenantId,
            user_id: userId,
            name,
            created_at: now,
            updated_at: now,
            messages: [], // store full conversation here
        };
        sessions.unshift(s);
        saveAll(tenantId, userId, sessions);
        return s;
    },

    async saveSessionState({ tenantId, userId, sessionId, messages, name }) {
        const sessions = loadAll(tenantId, userId);
        const idx = sessions.findIndex(s => s.session_id === sessionId);
        if (idx === -1) throw new Error("Session not found (local)");
        const now = new Date().toISOString();
        sessions[idx] = {
            ...sessions[idx],
            name: name ?? sessions[idx].name,
            messages: Array.isArray(messages) ? messages : sessions[idx].messages,
            updated_at: now,
        };
        saveAll(tenantId, userId, sessions);
        return sessions[idx];
    },
};

const ApiStore = {
    async listSessions(args) { return apiList(args); },
    async createSession(args) { return apiCreate(args); },
    async saveSessionState(args) { return apiSave(args); },
};

export function getSessionStore() {
    const mode = (import.meta.env.VITE_SESSION_STORE || "api").toLowerCase();
    return mode === "local" ? LocalStore : ApiStore;
}
