import { API_ENDPOINTS } from "../config/apiConfig";
import { logInfo, logError } from "../utils/logger";

const normalizeValue = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const readClaim = (claims, keys = []) => {
  for (const key of keys) {
    const value = normalizeValue(claims?.[key]);
    if (value) return value;
  }
  return null;
};

export const buildAddUserPayload = (account) => {
  if (!account) return null;

  const claims = account.idTokenClaims || {};
  const email =
    readClaim(claims, ["email", "preferred_username", "upn"]) ||
    normalizeValue(account.username);

  const fullName =
    readClaim(claims, ["name"]) || normalizeValue(account.name) || email;

  return {
    email,
    name: fullName,
  };
};

export async function addUser(payload) {
  const userId = payload?.email;
  if (!userId) {
    throw new Error("addUser requires payload.email");
  }

  logInfo("userApi addUser request", {
    url: API_ENDPOINTS.ADD_USER,
    user_id: userId,
    email: payload.email,
  });

  const response = await fetch(API_ENDPOINTS.ADD_USER, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "user-id": userId,
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();

  if (!response.ok) {
      logError(
        "userApi addUser failed",
        { status: response.status, raw },
        { user_id: userId }
      );
    throw new Error(`HTTP ${response.status}: ${raw}`);
  }

  let data = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }
  }

  logInfo("userApi addUser success", {
    status: response.status,
    user_id: userId,
  });

  return data;
}

export async function addUserFromAuthAccount(account) {
  const payload = buildAddUserPayload(account);
  if (!payload?.email) {
    throw new Error("Unable to build add-user payload from auth account");
  }

  return addUser(payload);
}

export async function getUsers(userId) {
  if (!userId) {
    throw new Error("getUsers requires userId");
  }

  logInfo("userApi getUsers request", {
    url: API_ENDPOINTS.ADD_USER,
    user_id: userId,
  });

  const response = await fetch(API_ENDPOINTS.ADD_USER, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "user-id": userId,
    },
  });

  const raw = await response.text();
  if (!response.ok) {
    logError(
      "userApi getUsers failed",
      { status: response.status, raw },
      { user_id: userId }
    );
    throw new Error(`HTTP ${response.status}: ${raw}`);
  }

  let data = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = {};
    }
  }

  const users = Array.isArray(data?.users) ? data.users : [];
  const normalized = users
    .map((user) => ({
      email: normalizeValue(user?.email) || "",
      name: normalizeValue(user?.name) || "",
    }))
    .filter((user) => user.email && user.name);

  logInfo("userApi getUsers success", {
    user_id: userId,
    count: normalized.length,
  });

  return normalized;
}

export async function getUsersFromAuthAccount(account) {
  const payload = buildAddUserPayload(account);
  const userId = payload?.email;
  if (!userId) {
    throw new Error("Unable to resolve user id for getUsers");
  }
  return getUsers(userId);
}
