import config from 'config';
import pino from 'pino';

import { LoggerOptions } from '../types/configTypes';
import { TargetOptions } from '../types/serviceTypes';

// Retrieve logger options from config
const loggerOptions: LoggerOptions = config.get('loggerOptions');

const targets: TargetOptions[] = [
    {
        // This target is used for logging everything above specified minimumLogLevel
        target: 'pino/file',
        level: loggerOptions.minimumLogLevel,
        options: {
            destination: './logs/app-all.log',
            mkdir: true,
            sync: false
        }
    },
    {
        // This target is used for logging errors separately
        target: 'pino/file',
        level: 'error',
        options: {
            destination: './logs/app-error.log',
            mkdir: true,
            sync: false
        }
    },
    {
        // This target is used for logging to the console
        target: 'pino/file',
        level: loggerOptions.minimumLogLevelConsole,
        options: {
            colorize: true,
            sync: false
        }
    }
];

// Check for Loki credentials and add Loki as a target if present
if (process.env.LOKI_AUTH_PASSWORD && process.env.LOKI_AUTH_USERNAME) {
    targets.push({
        target: 'pino-loki',
        level: loggerOptions.minimumLogLevel,
        options: {
            sync: false,
            batching: false,
            interval: 5,

            // Loki host and credentials are retrieved from environment variables
            host: process.env.LOKI_HOST || 'http://localhost:3100',
            basicAuth: {
                username: process.env.LOKI_AUTH_USERNAME || '',
                password: process.env.LOKI_AUTH_PASSWORD || ''
            }
        }
    });
}

const transport = pino.transport({ targets });

// Default properties for the logger, these will be added to every log entry
const defaultProperties = {
    environment: process.env.NODE_ENV || 'development'
};

const logLevelConfig = {
    level: loggerOptions.minimumLogLevel,
    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
    base: defaultProperties
};

const logger = pino(logLevelConfig, transport);
export default logger;