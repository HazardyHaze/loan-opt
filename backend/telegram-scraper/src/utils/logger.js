// src/utils/logger.js
class Logger {
    static log(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...meta
        };
        
        console.log(`${timestamp} [${level.toUpperCase()}] ${message}`);
        
        // For errors, show stack trace
        if (level === 'error' && meta.error && meta.error.stack) {
            console.error(meta.error.stack);
        }
        
        return logEntry;
    }

    static info(message, meta = {}) {
        return this.log('info', message, meta);
    }

    static error(message, meta = {}) {
        return this.log('error', message, meta);
    }

    static warn(message, meta = {}) {
        return this.log('warn', message, meta);
    }

    static debug(message, meta = {}) {
        if (process.env.LOG_LEVEL === 'debug') {
            return this.log('debug', message, meta);
        }
    }
}

module.exports = Logger;