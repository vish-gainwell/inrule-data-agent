import { API_ENDPOINTS, resolveTenantId, resolveUserId } from '../config/apiConfig';
import { logInfo, logError } from '../utils/logger';

/**
 * Transform raw schema data into the format expected by the Sidebar.
 * Raw format from backend:
 * { database_name, server, tables: [{ table_name: "schema.table", columns: [{column_name, type, ...}] }] }
 * Expected format by Sidebar:
 * { databases: [{ db_name, tables: [{ table_name, columns: [{column_name, data_type, ...}] }] }] }
 */
function transformSchemaForUI(rawSchema) {
  if (!rawSchema || typeof rawSchema !== 'object') {
    return { databases: [] };
  }

  // rawSchema structure: { database_name, server, tables: [...] }
  const dbName = rawSchema.database_name || 'Database';
  const tables = Array.isArray(rawSchema.tables) ? rawSchema.tables : [];

  const transformedTables = tables.map((table) => ({
    table_name: table.table_name || 'Unknown',
    display_name: table.table_name || 'Unknown',
    columns: Array.isArray(table.columns)
      ? table.columns.map((col) => ({
          column_name: col.column_name || col.name || 'Unknown',
          data_type: col.type || 'unknown',
          is_nullable: col.nullable === 'yes' ? true : col.nullable === true,
          length: col.length,
          precision: col.precision,
          scale: col.scale,
        }))
      : [],
  }));

  return {
    databases: [
      {
        db_name: dbName,
        display_name: dbName,
        server: rawSchema.server,
        tables: transformedTables,
      },
    ],
  };
}

/**
 * Fetch tenant metadata (schema) for the given tenant.
 * @param {string} tenantName - The tenant name/ID
 * @param {Object} options - Optional configuration
 * @param {string} options.userId - User ID for logging/audit
 * @param {string} options.sessionId - Session ID for request tracking
 * @param {AbortSignal} options.signal - Abort signal for cancelling the request
 * @returns {Promise<Object>} - The transformed tenant schema data
 */
export const fetchTenantMetadata = async (tenantName, options = {}) => {
  const safeTenant = resolveTenantId(tenantName);
  const userId = options.userId || resolveUserId();
  const sessionId = options.sessionId;
  const signal = options.signal;

  // New endpoint for schema
  const url = `${API_ENDPOINTS.TENANT_METADATA}/${encodeURIComponent(safeTenant)}/schema`;

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (userId) headers['X-User-Id'] = userId;
  if (sessionId) headers['X-Session-Id'] = sessionId;

  logInfo('fetchTenantMetadata START', { url, safeTenant, userId });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal,
    });

    const raw = await response.text();

    logInfo('fetchTenantMetadata response received', {
      url,
      status: response.status,
      statusText: response.statusText,
      hasContent: !!raw,
      contentLength: raw?.length || 0,
    });

    if (!response.ok) {
      const errorMsg = raw || response.statusText || 'Unknown error';
      logError('fetchTenantMetadata HTTP error', {
        url,
        status: response.status,
        statusText: response.statusText,
        error: errorMsg.substring(0, 200),
      });
      throw new Error(`HTTP ${response.status}: ${errorMsg}`);
    }

    if (!raw) {
      logError('fetchTenantMetadata empty response', { url });
      return { databases: [] };
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      logError('fetchTenantMetadata JSON parse error', {
        error: err.message,
        rawLength: raw.length,
        rawPreview: raw.substring(0, 100),
      });
      throw new Error(`Invalid JSON response: ${err.message}`);
    }

    // backend might return: {schema_data:{...}} OR the schema object directly
    const rawSchemaData = data?.schema_data || data || null;

    logInfo('fetchTenantMetadata JSON parsed success', {
      safeTenant,
      hasSchemaData: !!rawSchemaData,
      rawDataKeys: rawSchemaData ? Object.keys(rawSchemaData).slice(0, 5) : null,
    });

    // Transform the raw schema into UI format
    const transformed = transformSchemaForUI(rawSchemaData);
    logInfo('fetchTenantMetadata transformed', {
      databaseCount: transformed.databases.length,
      tableCount: transformed.databases.reduce((sum, db) => sum + (db.tables?.length || 0), 0),
    });

    return transformed;
  } catch (err) {
    logError('fetchTenantMetadata network error', {
      url,
      error: err?.message || String(err),
    });
    throw err;
  }
};

/**
 * Fetch all available tenants
 * @param {Object} options - Optional configuration
 * @param {string} options.userId - User ID for logging
 * @param {string} options.sessionId - Session ID
 * @returns {Promise<Object>} - List of all tenants
 */
export const fetchAllTenants = async (options = {}) => {
  const userId = options.userId || resolveUserId();
  const sessionId = options.sessionId;
  const url = `${API_ENDPOINTS.TENANT_METADATA_ALL}`;

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (userId) headers['X-User-Id'] = userId;
  if (sessionId) headers['X-Session-Id'] = sessionId;

  logInfo('fetchAllTenants', { url });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const raw = await response.text();

    if (!response.ok) {
      const errorMsg = raw || response.statusText || 'Unknown error';
      logError('fetchAllTenants HTTP error', {
        status: response.status,
        error: errorMsg,
      });
      throw new Error(`HTTP ${response.status}: ${errorMsg}`);
    }

    if (!raw) return null;

    const data = JSON.parse(raw);
    return data || null;
  } catch (err) {
    logError('fetchAllTenants error', {
      error: err?.message || String(err),
    });
    throw err;
  }
};
