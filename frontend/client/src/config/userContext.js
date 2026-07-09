// src/config/userContext.js
import { DEFAULT_TENANT_ID, DEFAULT_USER_ID } from './apiConfig';

export const DEFAULT_INSTANCE_ID = 'dev';

export function getDefaultUserContext() {
    return {
        userId: DEFAULT_USER_ID,
        tenantId: DEFAULT_TENANT_ID,
        instanceId: DEFAULT_INSTANCE_ID,
    };
}
