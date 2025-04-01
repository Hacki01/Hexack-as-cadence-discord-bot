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

        // First load the default extractors
        await player.extractors.loadMulti([YoutubeiExtractor, SoundCloudExtractor, SpotifyExtractor]);


        // Load the Youtubei extractor with authentication if provided
        await player.extractors.register(YoutubeiExtractor, {
            authentication: process.env.YT_EXTRACTOR_AUTH || '',
        });

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
