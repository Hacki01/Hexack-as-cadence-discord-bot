import { Player  } from 'discord-player';
import { SoundCloudExtractor, SpotifyExtractor } from '@discord-player/extractor';
import { loggerService, type Logger } from '../services/logger';
import type { CreatePlayerParams } from '../../types/playerTypes';
import { YoutubeiExtractor } from 'discord-player-youtubei';

export const createPlayer = async ({ client, executionId }: CreatePlayerParams): Promise<Player> => {
    const logger: Logger = loggerService.child({
        module: 'utilFactory',
        name: 'createPlayer',
        executionId: executionId,
        shardId: client.shard?.ids[0]
    });

    try {
        logger.debug('Creating discord-player player...');

        const player: Player = new Player(client, {
            skipFFmpeg: false,
        });

        function getAuthArrayFromEnv(): string[] {
            return Object.keys(process.env)
                .filter((v) => v.startsWith('YT_EXTRACTOR_AUTH'))
                .map((k) => process.env[k])
                .filter((v) => v !== undefined);
        }

        // First load the default extractors
        await player.extractors.loadMulti([YoutubeiExtractor, SoundCloudExtractor, SpotifyExtractor]);

        // make player accessible from anywhere in the application
        // primarily to be able to use it in broadcastEval and other sharding methods
        // @ts-ignore
        global.player = player;

        logger.trace(`discord-player loaded dependencies:\n${player.scanDeps()}`);

        return player;
    } catch (error) {
        logger.error(error, 'Failed to create discord-player player');
        throw error;
    }
};
