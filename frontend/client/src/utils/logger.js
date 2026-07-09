// src/utils/logger.js

// Format timestamp
const ts = () => new Date().toISOString();

// Generic logger
export const logInfo = (msg, ctx = {}) => {
    console.log(
        `%c[INFO] ${ts()}`,
        "color: #0a7dda; font-weight: bold;",
        { message: msg, ...ctx }
    );
};

// Warning logger
export const logWarn = (msg, ctx = {}) => {
    console.warn(
        `%c[WARN] ${ts()}`,
        "color: #d98c00; font-weight: bold;",
        { message: msg, ...ctx }
    );
};

// ❗ ERROR LOGGER (this was missing!)
export const logError = (msg, errorObj = {}, ctx = {}) => {
    console.error(
        `%c[ERROR] ${ts()}`,
        "color: #d40000; font-weight: bold;",
        { message: msg, error: errorObj, ...ctx }
    );
};

// Default export (optional)
export default {
    logInfo,
    logWarn,
    logError
};
