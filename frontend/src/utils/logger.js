class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
  }

  log(type, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data
    };

    console.log(`[${logEntry.type}] ${logEntry.message}`, data || '');
    
    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Сохраняем логи в localStorage
    localStorage.setItem('app_logs', JSON.stringify(this.logs));
  }

  error(message, error = null) {
    this.log('ERROR', message, {
      message: error?.message,
      stack: error?.stack,
      response: error?.response?.data
    });
  }

  info(message, data = null) {
    this.log('INFO', message, data);
  }

  warn(message, data = null) {
    this.log('WARN', message, data);
  }

  debug(message, data = null) {
    this.log('DEBUG', message, data);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('app_logs');
  }
}

export const logger = new Logger();
export default logger; 