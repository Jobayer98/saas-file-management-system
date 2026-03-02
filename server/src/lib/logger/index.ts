import fs from 'fs';
import path from 'path';

const LOG_DIR = process.env.LOG_DIR || './logs';

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    console.log(logMessage, meta || '');
    
    const logFile = path.join(LOG_DIR, `${level}.log`);
    const logEntry = `${logMessage} ${meta ? JSON.stringify(meta) : ''}\n`;
    
    fs.appendFileSync(logFile, logEntry);
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: any) {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: any) {
    if (process.env.LOG_LEVEL === 'debug') {
      this.log('debug', message, meta);
    }
  }
}

export default new Logger();
