/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */

/**
 * Logger with Dependency Injection for Testability
 * =================================================
 * Key testability features:
 * 1. Console abstraction - inject mock console for testing
 * 2. Transport abstraction - easy to test custom transports
 * 3. State reset - allows isolation between tests
 */

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

/**
 * Default console implementation - can be replaced for testing
 */
export const defaultConsole = {
  debug: (...args) => console.debug(...args),
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
  log: (...args) => console.log(...args),
};

/**
 * Creates a console transport function
 * @param {Object} consoleImpl - Console implementation (injectable for testing)
 * @returns {Function} Transport function
 */
export function createConsoleTransport(consoleImpl = defaultConsole) {
  return (level, message, meta) => {
    const timestamp = new Date().toISOString();
    const formattedMeta = meta ? JSON.stringify(meta) : '';
    const output = `[${timestamp}] [${level}] ${message} ${formattedMeta}`;

    switch (level) {
      case 'DEBUG':
        consoleImpl.debug(output);
        break;
      case 'INFO':
        consoleImpl.info(output);
        break;
      case 'WARN':
        consoleImpl.warn(output);
        break;
      case 'ERROR':
        consoleImpl.error(output);
        break;
      default:
        consoleImpl.log(output);
    }
  };
}

/**
 * Creates a Firebase analytics transport (for server-side logging)
 * @param {Function} firebaseGetter - Function to get Firebase analytics (injectable)
 * @returns {Function} Transport function
 */
export function createFirebaseTransport(firebaseGetter = null) {
  return async (level, message, meta) => {
    // Only log WARN and ERROR to Firebase
    if (level !== 'ERROR' && level !== 'WARN') return;

    try {
      const getAnalytics =
        firebaseGetter ||
        (async () => {
          const { getFirebaseAnalytics } = await import('./firebase');
          return getFirebaseAnalytics();
        });

      const analytics = await getAnalytics();
      if (analytics) {
        const { logEvent } = await import('firebase/analytics');
        logEvent(analytics, 'app_log', {
          level,
          message: String(message),
          ...meta,
        });
      }
    } catch (e) {
      console.warn('Failed to send log to Firebase', e);
    }
  };
}

class Logger {
  /**
   * Create a Logger instance
   * @param {Object} options - Configuration options
   * @param {Object} options.console - Console implementation (for testing)
   * @param {number} options.level - Initial log level
   */
  constructor(options = {}) {
    const { console: consoleImpl = defaultConsole, level = LOG_LEVELS.INFO } = options;

    this.level = level;
    this.consoleImpl = consoleImpl;
    this.consoleTransport = createConsoleTransport(consoleImpl);
    this.transports = [this.consoleTransport];
  }

  /**
   * Set the minimum log level
   * @param {string} level - One of 'DEBUG', 'INFO', 'WARN', 'ERROR'
   */
  setLevel(level) {
    const upperLevel = level.toUpperCase();
    if (Object.keys(LOG_LEVELS).includes(upperLevel)) {
      this.level = LOG_LEVELS[upperLevel];
    }
  }

  /**
   * Get current log level name
   * @returns {string}
   */
  getLevel() {
    return Object.keys(LOG_LEVELS).find((key) => LOG_LEVELS[key] === this.level) || 'INFO';
  }

  /**
   * Main log method
   */
  log(level, message, meta) {
    const currentLevelValue = LOG_LEVELS[level];
    if (currentLevelValue >= this.level) {
      this.transports.forEach((transport) => {
        transport(level, message, meta);
      });
    }
  }

  debug(message, meta) {
    this.log('DEBUG', message, meta);
  }

  info(message, meta) {
    this.log('INFO', message, meta);
  }

  warn(message, meta) {
    this.log('WARN', message, meta);
  }

  error(message, meta) {
    this.log('ERROR', message, meta);
  }

  /**
   * Add a custom transport function
   * @param {Function} transportFn
   */
  addTransport(transportFn) {
    this.transports.push(transportFn);
  }

  /**
   * Remove a transport
   * @param {Function} transportFn
   */
  removeTransport(transportFn) {
    this.transports = this.transports.filter((t) => t !== transportFn);
  }

  /**
   * Clear all transports (for testing)
   */
  clearTransports() {
    this.transports = [];
  }

  /**
   * Reset to default state (for testing)
   */
  reset() {
    this.level = LOG_LEVELS.INFO;
    this.transports = [this.consoleTransport];
  }
}

// Export the Logger class for creating custom instances
export { Logger };

// Default singleton instance
const logger = new Logger();

export default logger;
