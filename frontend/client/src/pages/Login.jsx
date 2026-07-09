// src/pages/Login.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import logo from "../assets/gainwell_logo.png";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const Login = () => {
  const { account, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to go after login – original protected page or /analyst
  const from = location.state?.from?.pathname || "/data-agent";

  useEffect(() => {
    // For localhost, auto-navigate without waiting for account
    if (isLocalhost) {
      console.log("[Login] Localhost detected, navigating to analyst...");
      navigate(from, { replace: true });
      return;
    }

    // For production, wait for account
    if (account) {
      console.log("[Login] Account found, navigating to analyst...");
      navigate(from, { replace: true });
    }
  }, [account, from, navigate]);

  const handleClick = () => {
    console.log("[Login] Sign in button clicked");
    signIn();
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-md p-10 text-center max-w-md w-full">
        <img src={logo} alt="Gainwell" className="h-12 mx-auto mb-4" />

        <h2 className="text-xl font-semibold mb-2">
          Sign in to GW AI Analyst
        </h2>

        <p className="text-gray-600 mb-6">
          Use your Gainwell / Entra ID account to continue.
        </p>

        <button
          type="button"
          onClick={handleClick}
          className="bg-[#0067b8] text-white px-6 py-3 rounded hover:bg-[#005a9e] w-full"
        >
          Sign in with Microsoft
        </button>
      </div>
    </div>
  );
};

export default Login;
