import { DEFAULT_TENANT_ID } from "./apiConfig";
import { logInfo, logError } from "../utils/logger";

// Cache configuration
const CACHE_KEY = 'client_list_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Fallback list if API is unavailable
const FALLBACK_CLIENTS = [
  "MDWise", 
  "DemoClient", 
  "McLaren", 
  "McLaren RX", 
  "NV RAC", 
  "WV RAC", 
  "IL RAC", 
  "FL PI", 
  "SC RAC", 
  "CO RAC", 
  "NC RAC", 
  "AZ RAC",
  "Amerihealth",
  "TX RAC",
  "NM RAC",
  "MI RAC"
];

const rawClientList = import.meta.env.VITE_CLIENT_LIST || "";

const parseClientList = (raw) => {
  if (!raw) return [];
  const seen = new Set();
  return raw
    .split(",")
    .map((s) => s.trim())
    .map((s) => s.replace(/^["']|["']$/g, ""))
    .filter((val) => {
      if (!val) return false;
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
};

const parsedClients = parseClientList(rawClientList);

// Dynamic client list - starts with parsed/fallback, will be updated by fetchClientList
export let CLIENT_LIST =
  parsedClients.length > 0
    ? parsedClients
    : FALLBACK_CLIENTS;

// Flag to ensure client list is only fetched once per session
let clientListLoaded = false;

/**
 * Get cached client list from localStorage
 * @returns {Array|null} - Cached client list or null if invalid/expired
 */
const getCachedClientList = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    if (now - timestamp > CACHE_DURATION) {
      logInfo("Client list cache expired, will refetch");
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    logInfo("Using cached client list", { count: data.length, age: Math.round((now - timestamp) / 1000 / 60) + " minutes" });
    return data;
  } catch (err) {
    logError("Error reading client list cache", { error: err?.message });
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

/**
 * Cache client list to localStorage
 * @param {Array} clientList - Client list to cache
 */
const setCachedClientList = (clientList) => {
  try {
    const cacheData = {
      data: clientList,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    logInfo("Client list cached", { count: clientList.length });
  } catch (err) {
    logError("Error caching client list", { error: err?.message });
  }
};

/**
 * Fetch all available tenants/clients from the backend API
 * Uses localStorage cache to avoid repeated API calls
 * @param {Object} options - Optional configuration
 * @param {string} options.userId - User ID for API headers
 * @param {boolean} options.forceRefresh - Force refresh from API, ignore cache
 * @param {string} options.sessionId - Session ID for API headers
 * @returns {Promise<Array>} - Array of tenant names
 */
export const fetchClientList = async (options = {}) => {
  const { forceRefresh = false } = options;
  
  // If already loaded and not forcing refresh, return current list
  if (clientListLoaded && !forceRefresh) {
    logInfo("Client list already loaded, returning cached list", { count: CLIENT_LIST.length });
    return CLIENT_LIST;
  }
  
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = getCachedClientList();
    if (cached) {
      CLIENT_LIST = cached;
      clientListLoaded = true;
      return CLIENT_LIST;
    }
  }
  
  try {
    const { fetchAllTenants } = await import("../api/tenantMetadata.js");
    
    logInfo("fetchClientList START", { forceRefresh });
    
    const tenantsData = await fetchAllTenants(options);
    
    if (!tenantsData) {
      logInfo("fetchClientList - No data returned, using fallback");
      CLIENT_LIST = FALLBACK_CLIENTS;
      setCachedClientList(CLIENT_LIST);
      return CLIENT_LIST;
    }

    // Preserve exact order as returned by API (no deduplication to maintain order)
    const tenantNames = [];
    
    if (Array.isArray(tenantsData)) {
      // If response is an array of objects with 'name' or 'tenant_name' fields
      for (const tenant of tenantsData) {
        const name = tenant.name || tenant.tenant_name || tenant;
        if (name && typeof name === 'string') {
          tenantNames.push(name.trim());
        }
      }
    } else if (tenantsData.tenants && Array.isArray(tenantsData.tenants)) {
      // If response has a 'tenants' array property
      for (const tenant of tenantsData.tenants) {
        const name = tenant.name || tenant.tenant_name || tenant;
        if (name && typeof name === 'string') {
          tenantNames.push(name.trim());
        }
      }
    } else if (typeof tenantsData === 'object') {
      // If response is an object where keys are tenant names
      for (const key of Object.keys(tenantsData)) {
        if (key && typeof key === 'string') {
          tenantNames.push(key.trim());
        }
      }
    }

    if (tenantNames.length > 0) {
      CLIENT_LIST = tenantNames;
      logInfo("fetchClientList success", { count: tenantNames.length, tenants: tenantNames.slice(0, 5) });
      setCachedClientList(CLIENT_LIST);
      clientListLoaded = true;
      return CLIENT_LIST;
    } else {
      logInfo("fetchClientList - No tenants extracted, using fallback");
      CLIENT_LIST = FALLBACK_CLIENTS;
      setCachedClientList(CLIENT_LIST);
      clientListLoaded = true;
      return CLIENT_LIST;
    }
  } catch (err) {
    logError("fetchClientList error", { error: err?.message || String(err) });
    // Fall back to cached data if available, otherwise use default list
    const cached = getCachedClientList();
    if (cached) {
      CLIENT_LIST = cached;
      clientListLoaded = true;
      return CLIENT_LIST;
    }
    CLIENT_LIST = FALLBACK_CLIENTS;
    clientListLoaded = true;
    return CLIENT_LIST;
  }
};

/**
 * Clear the cached client list from localStorage
 */
export const clearClientListCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    clientListLoaded = false; // Allow re-fetching after cache clear
    logInfo("Client list cache cleared");
  } catch (err) {
    logError("Error clearing client list cache", { error: err?.message });
  }
};

export const buildClientOptions = (selectedTenant) => {
  const base = Array.isArray(CLIENT_LIST) ? CLIENT_LIST : [];
  const fallback = Array.isArray(FALLBACK_CLIENTS) ? FALLBACK_CLIENTS : [];
  const combined = [...base, ...fallback, selectedTenant].filter(Boolean);
  // Preserve API order first, then fallback additions; dedupe overall.
  const seen = new Set();
  const deduplicated = combined.filter((c) => {
    if (!c) return false;
    if (seen.has(c)) return false;
    seen.add(c);
    return true;
  });

  // Move selected tenant to front to prevent browser reordering
  if (selectedTenant && deduplicated.includes(selectedTenant)) {
    const selectedIndex = deduplicated.indexOf(selectedTenant);
    if (selectedIndex > 0) {
      const reordered = [selectedTenant, ...deduplicated.slice(0, selectedIndex), ...deduplicated.slice(selectedIndex + 1)];
      return reordered;
    }
  }

  return deduplicated;
};

export default CLIENT_LIST;
