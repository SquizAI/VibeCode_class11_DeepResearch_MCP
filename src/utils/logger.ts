import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { env, paths } from '../config/env.js';

// Create logs directory if it doesn't exist
if (!fs.existsSync(paths.logs)) {
  fs.mkdirSync(paths.logs, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'deep-research-tool' },
  transports: [
    // Write all logs with importance level of 'error' or less to error.log
    new winston.transports.File({ 
      filename: path.join(paths.logs, 'error.log'), 
      level: 'error' 
    }),
    // Write all logs with importance level of 'info' or less to combined.log
    new winston.transports.File({ 
      filename: path.join(paths.logs, 'combined.log') 
    }),
  ],
});

// Add console transport for non-production environments
if (env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Create a stream object for Morgan integration (if needed)
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;
