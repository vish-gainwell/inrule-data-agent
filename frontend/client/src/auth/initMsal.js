
// src/auth/initMsal.js
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./authConfig";

// Check if API is pointing to localhost (not just frontend hostname)
const isLocalBackend = import.meta.env.VITE_API_BASE_URL?.includes("localhost") ||
                       import.meta.env.VITE_API_BASE_URL?.includes("127.0.0.1");

// Single global MSAL instance for the whole app
export const msalInstance = new PublicClientApplication(msalConfig);

/**
 * Ensure MSAL is initialized (v3+ supports async initialize; v2 ignores).
 */
export async function ensureMsalInitialized() {
  if (typeof msalInstance.initialize === "function") {
    await msalInstance.initialize();
  }
}

/**
 * Initialize auth on app startup:
 * - initialize MSAL
 * - handle redirect response (if we're returning from AAD)
 * - set active account if found
 * - if no account, guard against duplicate and trigger loginRedirect() ONCE
 */
export async function initAuth() {
  // Skip MSAL redirect only if backend is on localhost
  if (isLocalBackend) {
    console.log("[MSAL] Local backend detected - skipping MSAL auth");
    return null;
  }

  // Initialize
  await ensureMsalInitialized();

  // Process any redirect result
  const redirectResponse = await msalInstance.handleRedirectPromise().catch((err) => {
    console.error("[MSAL] handleRedirectPromise error:", err);
    return null;
  });

  if (redirectResponse?.account) {
    msalInstance.setActiveAccount(redirectResponse.account);
    sessionStorage.removeItem("msal.loginStarted");
    console.log("[MSAL] Redirect completed for:", redirectResponse.account.username);
    return redirectResponse.account;
  }

  // If an account already exists in cache, set it active
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
    sessionStorage.removeItem("msal.loginStarted");
    console.log("[MSAL] Using existing session:", accounts[0].username);
    return accounts[0];
  }

  // No session; avoid duplicate redirects (StrictMode/hot reload)
  const alreadyStarted = sessionStorage.getItem("msal.loginStarted");
  if (!alreadyStarted) {
    sessionStorage.setItem("msal.loginStarted", "1");

    // Try silent SSO first (if tenant policy allows)
    try {
      const sso = await msalInstance.ssoSilent({ scopes: loginRequest.scopes });
      if (sso?.account) {
        msalInstance.setActiveAccount(sso.account);
        sessionStorage.removeItem("msal.loginStarted");
        console.log("[MSAL] ssoSilent succeeded:", sso.account.username);
        return sso.account;
      }
    } catch (e) {
      console.warn("[MSAL] ssoSilent failed; falling back to redirect:", e);
    }

    // Interactive redirect (browser navigates away here)
    await msalInstance.loginRedirect({ ...loginRequest });
  }

  return null;
}
