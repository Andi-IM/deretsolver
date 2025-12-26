/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor() {
    this.level = LOG_LEVELS.INFO; // Default level
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

  consoleTransport(level, message, meta) {
    const timestamp = new Date().toISOString();
    const formattedMeta = meta ? JSON.stringify(meta) : '';
    const output = `[${timestamp}] [${level}] ${message} ${formattedMeta}`;

    switch (level) {
      case 'DEBUG':
        console.debug(output);
        break;
      case 'INFO':
        console.info(output);
        break;
      case 'WARN':
        console.warn(output);
        break;
      case 'ERROR':
        console.error(output);
        break;
      default:
        console.log(output);
    }
  }

  async firebaseTransport(level, message, meta) {
    // Only log WARN and ERROR to Firebase to save quota/noise
    if (level === 'ERROR' || level === 'WARN') {
      try {
        // Lazy load Firebase (doesn't block critical path)
        const { getFirebaseAnalytics } = await import('./firebase');
        const analytics = getFirebaseAnalytics();

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
    }
  }

  log(level, message, meta) {
    const currentLevelValue = LOG_LEVELS[level];
    if (currentLevelValue >= this.level) {
      // Execute all transports
      this.transports.forEach((transport) => {
        // Bind 'this' if strictly needed, but here simple calls work or arrow functions in constructor
        // To be safe with 'this' context if methods were detached, we call them carefully.
        // Since they are methods on this class, we can call them if they are in the array.
        // However, safely:
        if (transport === this.consoleTransport) this.consoleTransport(level, message, meta);
        if (transport === this.firebaseTransport) this.firebaseTransport(level, message, meta);
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
}

const logger = new Logger();

// Uncomment to enable Firebase logging by default
// logger.addTransport(logger.firebaseTransport.bind(logger));

export default logger;
