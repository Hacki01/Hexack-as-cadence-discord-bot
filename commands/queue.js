const { SlashCommandBuilder } = require('@discordjs/builders');
const { useQueue } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show list of tracks added to queue.')
        .addNumberOption((option) =>
            option
                .setName('page')
                .setDescription('Page number of the queue')
                .setMinValue(1)
        ),
    run: async ({ interaction }) => {
        if (!interaction.member.voice.channel) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `You need to be in a voice channel to use this command.`
                        )
                        .setColor('#c70057')
                ]
            });
        }

        const queue = useQueue(interaction.guild.id);
        let queueString = '';

        if (!queue) {
            queueString = 'There are no tracks in the queue.';
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                        .setDescription(`**Queue**\n${queueString}`)
                        .setColor('#4c73df')
                ]
            });
        }

        const totalPages = Math.ceil(queue.tracks.data.length / 10) || 1;
        const page = (interaction.options.getNumber('page') || 1) - 1;

        if (page > totalPages - 1) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `Invalid page number. There are only a total of ${totalPages} pages of tracks.`
                        )
                        .setColor('#c70057')
                ]
            });
        }

        if (queue.tracks.data.length === 0) {
            queueString = 'There are no tracks in the queue.';
        } else {
            queueString = queue.tracks.data
                .slice(page * 10, page * 10 + 10)
                .map((track, index) => {
                    return `**${page * 10 + index + 1}.** \`[${
                        track.duration
                    }]\` [${track.title}](${track.url})`;
                })
                .join('\n');
        }

        let currentTrack = queue.currentTrack;

        if (!currentTrack) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                        .setDescription(`**Queue**\n${queueString}`)
                        .setFooter({
                            text: `Page ${page + 1} of ${totalPages}`
                        })
                        .setColor('#4c73df')
                ]
            });
        } else {
            let bar = queue.node.createProgressBar({
                queue: false,
                length: 13
            });

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                        .setDescription(
                            `**Currently playing**\n` +
                                (currentTrack
                                    ? `**[${currentTrack.title}](${currentTrack.url})**`
                                    : 'None') +
                                `\nRequested by: <@${currentTrack.requestedBy.id}>` +
                                `\n ${bar}` +
                                `\n\n**Queue**\n${queueString}`
                        )
                        .setThumbnail(queue.currentTrack.thumbnail)
                        .setFooter({
                            text: `Page ${page + 1} of ${totalPages}`
                        })
                        .setColor('#4c73df')
                ]
            });
        }
    }
};
