/**
 * Development-only logger utility
 *
 * Provides console.log-like functionality that only outputs in development mode.
 * In production builds (import.meta.env.PROD), all logging is silently suppressed.
 */

const isDev = import.meta.env.DEV;

/**
 * Log a message (only in development)
 * @param {...any} args - Arguments to log
 */
export const log = (...args) => {
  if (isDev) {
    console.log(...args);
  }
};

/**
 * Log a warning (only in development)
 * @param {...any} args - Arguments to log
 */
export const warn = (...args) => {
  if (isDev) {
    console.warn(...args);
  }
};

/**
 * Log an error (always logs - errors should be visible in production)
 * @param {...any} args - Arguments to log
 */
export const error = (...args) => {
  console.error(...args);
};

/**
 * Log debug info (only in development)
 * @param {...any} args - Arguments to log
 */
export const debug = (...args) => {
  if (isDev) {
    console.debug(...args);
  }
};

/**
 * Create a namespaced logger
 * @param {string} namespace - Prefix for all log messages
 * @returns {Object} Logger object with log, warn, error, debug methods
 */
export const createLogger = (namespace) => ({
  log: (...args) => log(`[${namespace}]`, ...args),
  warn: (...args) => warn(`[${namespace}]`, ...args),
  error: (...args) => error(`[${namespace}]`, ...args),
  debug: (...args) => debug(`[${namespace}]`, ...args),
});

export default { log, warn, error, debug, createLogger };
