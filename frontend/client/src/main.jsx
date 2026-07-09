
// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthProvider.jsx";
import { initAuth } from "./auth/initMsal";

// Start MSAL auth BEFORE rendering the app to avoid race conditions
(async () => {
  try {
    await initAuth();
  } catch (err) {
    console.error("Auth init failed:", err);
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  );
})();
