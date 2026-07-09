// client/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadYamlConfig(mode) {
  const configPath = path.resolve(__dirname, "config/app-config.yml");
  if (!fs.existsSync(configPath)) {
    throw new Error(`[Vite] Missing config file: ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = YAML.parse(raw) || {};
  const defaults = parsed.defaults || {};
  const environments = parsed.environments || {};
  const envOverrides = environments[mode];

  if (!envOverrides) {
    const available = Object.keys(environments).sort().join(", ");
    throw new Error(`[Vite] Unknown mode '${mode}'. Available: ${available}`);
  }

  return { ...defaults, ...envOverrides };
}

// Optional helper: only enable HTTPS if paths are provided via env
function buildHttpsConfig(env) {
  const keyPath = env.VITE_SSL_KEY_PATH;
  const certPath = env.VITE_SSL_CERT_PATH;

  if (!keyPath || !certPath) {
    console.log("[Vite] No VITE_SSL_KEY_PATH / VITE_SSL_CERT_PATH set. Using HTTP.");
    return undefined;
  }

  try {
    console.log("[Vite] Starting dev server with HTTPS certs from env paths.");
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  } catch (err) {
    console.warn(
      "[Vite] Failed to read SSL key/cert, falling back to HTTP:",
      err.message
    );
    return undefined;
  }
}

export default defineConfig(({ mode }) => {
  console.log("[Vite] Mode:", mode);
  console.log("[Vite] Loading config from:", path.resolve(__dirname, "config/app-config.yml"));

  const fileEnv = loadYamlConfig(mode);
  const runtimeOverrides = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith("VITE_") && String(value ?? "").trim() !== "") {
      runtimeOverrides[key] = String(value);
    }
  }
  const env = { ...fileEnv, ...runtimeOverrides };

  for (const [key, value] of Object.entries(fileEnv)) {
    if (key.startsWith("VITE_") && typeof value === "string" && /^\$\(.+\)$/.test(value)) {
      if (!(key in runtimeOverrides)) {
        console.warn(`[Vite] ${key} is a token placeholder and was not overridden at runtime.`);
      }
    }
  }

  console.log("[Vite] full env:", env);

  console.log("[Vite] VITE_API_BASE_URL:", env.VITE_API_BASE_URL || "");

  const hostname = env.VITE_PUBLIC_HOST || "localhost";
  const listenHost = env.VITE_LISTEN_HOST || "0.0.0.0";
  const port = Number(env.VITE_PORT) || 5173;
  const hmrHost = env.VITE_HMR_HOST || hostname;
  const hmrPort = Number(env.VITE_HMR_PORT) || port;
  const allowedHosts = (env.VITE_ALLOWED_HOSTS || hostname)
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

  const httpsConfig = buildHttpsConfig(env);
  const protocol = httpsConfig ? "https" : "http";
  const hmrProtocol = httpsConfig ? "wss" : "ws";

  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith("VITE_")) {
      process.env[key] = String(value ?? "");
    }
  }

  const define = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith("VITE_")) {
      define[`import.meta.env.${key}`] = JSON.stringify(value ?? "");
    }
  }

  return {
    plugins: [react()],
    server: {
      // https: httpsConfig,
      host: listenHost,
      port,
      origin: `${protocol}://${hostname}:${port}`,

      allowedHosts,

      hmr: {
        protocol: hmrProtocol,
        host: hmrHost,
        port: hmrPort,
        timeout: 30000,
      },

      // ⭐ Generic proxy that ignores self‑signed certs
      //proxy: {
      //  "/app": {
       //   target: "https://pi-sql-agent:5001",
       //   changeOrigin: true,
       //   secure: false, // ignore SSL cert errors
       // }
      //},
      //proxy: {
      //  "/new_session": {
      //    target: "https://pi-sql-agent:5001",
      //    changeOrigin: true,
      //    secure: false, // ignore SSL cert errors
      //  }
      //}
    },

    optimizeDeps: {
      include: ["@azure/msal-browser"],
    },
  };
});
