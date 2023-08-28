import { Events } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';

import loggerModule from '../../services/logger';

module.exports = {
    name: Events.Error,
    isDebug: false,
    once: false,
    execute: async (error: Error) => {
        const executionId = uuidv4();
        const logger = loggerModule.child({
            source: 'error.js',
            module: 'event',
            name: 'clientError',
            executionId: executionId
        });

        logger.error(error);
    }
};