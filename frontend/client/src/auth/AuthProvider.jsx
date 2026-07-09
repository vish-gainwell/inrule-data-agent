import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { EventType, InteractionStatus } from "@azure/msal-browser";
import { msalInstance, ensureMsalInitialized } from "./initMsal";
import { loginRequest } from "./authConfig";
import { clearClientListCache } from "../config/clientContext";
import {
  addUserFromAuthAccount,
  buildAddUserPayload,
  getUsersFromAuthAccount,
} from "../api/userApi";

const AuthContext = createContext(null);

console.log("Rams log testing....");

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const AuthProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [users, setUsers] = useState([]);
  const syncedUserIdsRef = useRef(new Set());
  const [interactionStatus, setInteractionStatus] = useState(
    InteractionStatus.None
  );

  useEffect(() => {
    if (isLocalhost) {
      const fakeAccount = {
        username: "local.dev@gainwelltechnologies.com",
        name: "Local Dev User",
        homeAccountId: "local-dev",
        localAccountId: "local-dev",
        environment: "localhost",
      };
      console.log("[AuthProvider] Local dev: setting fake account", fakeAccount);
      setAccount(fakeAccount);
      return;
    }



    const current =
      msalInstance.getActiveAccount() ||
      msalInstance.getAllAccounts()[0] ||
      null;
    setAccount(current);
    if (current) {
      console.log("[MSAL] Provider initial account:", current.username);
    }
  }, []);

  useEffect(() => {
    if (!account) return;

    const payload = buildAddUserPayload(account);
    const userId = payload?.email;
    if (!userId || syncedUserIdsRef.current.has(userId)) return;

    syncedUserIdsRef.current.add(userId);

    (async () => {
      let postFailed = false;
      try {
        await addUserFromAuthAccount(account);
      } catch (err) {
        postFailed = true;
        console.warn("[AuthProvider] POST /users failed", err);
      }

      try {
        const fetchedUsers = await getUsersFromAuthAccount(account);
        setUsers(fetchedUsers);
      } catch (err) {
        syncedUserIdsRef.current.delete(userId);
        console.warn("[AuthProvider] GET /users failed", err);
      }

      if (postFailed) {
        console.warn("[AuthProvider] Continuing with fetched users despite POST failure");
      }
    })();
  }, [account]);

  useEffect(() => {
    if (isLocalhost) {
      return;
    }

    const callbackId = msalInstance.addEventCallback((event) => {
      switch (event.eventType) {
        case EventType.HANDLE_REDIRECT_START:
          setInteractionStatus(InteractionStatus.HandleRedirect);
          break;
        case EventType.HANDLE_REDIRECT_END:
          setInteractionStatus(InteractionStatus.None);
          break;
        case EventType.LOGIN_START:
          setInteractionStatus(InteractionStatus.Login);
          break;
        case EventType.LOGIN_SUCCESS:
          setInteractionStatus(InteractionStatus.None);
          if (event.payload?.account) {
            msalInstance.setActiveAccount(event.payload.account);
            setAccount(event.payload.account);
            sessionStorage.removeItem("msal.loginStarted");
            console.log(
              "[MSAL] LOGIN_SUCCESS:",
              event.payload.account.username
            );
          }
          break;
        case EventType.LOGIN_FAILURE:
          setInteractionStatus(InteractionStatus.None);
          sessionStorage.removeItem("msal.loginStarted");
          console.warn("[MSAL] LOGIN_FAILURE:", event.error);
          break;
        default:
          break;
      }
    });

    return () => {
      if (callbackId) msalInstance.removeEventCallback(callbackId);
    };
  }, []);

  const signIn = async () => {
    console.log("[AuthProvider] signIn called", {
      interactionStatus,
      isLocalhost,
    });

    // ⬇⬇⬇ LOCAL DEV FAKE LOGIN ⬇⬇⬇
    if (isLocalhost) {
      const fakeAccount = {
        username: "local.dev@gainwelltechnologies.com",
        name: "Local Dev User",
        homeAccountId: "local-dev",
        localAccountId: "local-dev",
        environment: "localhost",
      };
      console.log("[AuthProvider] Local dev: faking login", fakeAccount);
      setAccount(fakeAccount);
      return;
    }
    // ⬆⬆⬆ LOCAL DEV FAKE LOGIN ⬆⬆⬆

    await ensureMsalInitialized();

    // If already signed in, don't start another interaction
    const active =
      msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
    if (active) {
      console.log("[MSAL] Already signed in as:", active.username);
      setAccount(active);
      return;
    }

    // Clear any stale flag; we won't use this as a guard anymore
    sessionStorage.removeItem("msal.loginStarted");
    sessionStorage.setItem("msal.loginStarted", "1");

    // Try silent first; fallback to redirect
    try {
      const sso = await msalInstance.ssoSilent({ scopes: loginRequest.scopes });
      if (sso?.account) {
        msalInstance.setActiveAccount(sso.account);
        setAccount(sso.account);
        sessionStorage.removeItem("msal.loginStarted");
        console.log("[MSAL] ssoSilent succeeded:", sso.account.username);
        return;
      }
    } catch (e) {
      console.warn("[MSAL] ssoSilent failed; redirecting:", e);
    }

    await msalInstance.loginRedirect({ ...loginRequest });
  };

  const signOut = async () => {
    if (isLocalhost) {
      console.log("[AuthProvider] Local dev: fake sign-out");
      setAccount(null);
      clearClientListCache();
      return;
    }

    await ensureMsalInitialized();
    const current =
      msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
    if (!current) {
      console.warn("[MSAL] signOut called but no account is cached");
      return;
    }
    clearClientListCache();
    await msalInstance.logoutRedirect({ account: current });
  };

  return (
    <AuthContext.Provider value={{ account, users, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
