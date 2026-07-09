import { LogLevel } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_MSAL_CLIENT_ID;
const tenantId = import.meta.env.VITE_MSAL_TENANT_ID;

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const fallbackProdBaseUrl = "https://pi-ai-analyst.enso.dev.pgwcloud.net";
const envProdBaseUrl = import.meta.env.VITE_APP_URL;
const localBaseUrl = window.location.origin;
const redirectUri = isLocalhost ? localBaseUrl : envProdBaseUrl || fallbackProdBaseUrl;

export const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: false,
  },

  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },

  system: {
    loggerOptions: {
      logLevel: LogLevel.Verbose,
      loggerCallback: (level, message, containsPii) => {
        if (!containsPii) console.log("[MSAL]", message);
      },
      piiLoggingEnabled: false,
    },
  },
};

export const loginRequest = {
  scopes: ["User.Read"],
};
