import { ApplicationCommandOptionType, ChatInputCommandInteraction, Client, REST, Routes } from "discord.js";
import DisTubeClient from "distube";

import { Config } from "./config";
import { clearVideoQueue, getNowPlayingAndNextUp, isQueueEmpty } from "./distube";
import { Embed } from "./embed";
import type { ISlashCommand } from "./types";

const DiscordApi = new REST({ version: "10" }).setToken(Config.BOT_TOKEN);

export const createCommands = (distubeClient: DisTubeClient) => {
	const commands: ISlashCommand[] = [
		{
			name: "p",
			description: "Play audio from a URL in the current voice channel",
			options: [
				{
					name: "search",
					description: "URL or text to search for (plays top result)",
					type: ApplicationCommandOptionType.String,
					required: true
				}
			],
			handler: async (int: ChatInputCommandInteraction) => {
				const searchTextOrUrl = int.options.getString("search", true);
				const member = int.guild.members.cache.get(int.member.user.id);
				const voiceChannel = member?.voice?.channel;
				if (!voiceChannel) throw "You must be in a voice channel to use this command!";
				await int.reply(`Searching for \`${searchTextOrUrl}\`...`);
				try {
					await distubeClient.play(voiceChannel, searchTextOrUrl, {
						textChannel: int.channel,
						message: await int.fetchReply(),
						member
					});
				} catch (error) {
					console.error(error);
				}
			}
		},
		{
			name: "skip",
			description: "Skip the track that is currently playing",
			options: [
				{
					name: "to",
					description: "Position of a specific track in the queue to skip directly to",
					type: ApplicationCommandOptionType.Integer,
					min_value: 1,
					required: false
				}
			],
			handler: async (int: ChatInputCommandInteraction) => {
				if (isQueueEmpty(distubeClient, int.guildId)) throw "No tracks in the queue!";
				const skipTo = int.options.getInteger("to", false);
				const queue = distubeClient.getQueue(int.guildId);
				if (!skipTo && queue.songs.length === 1)
					return await Promise.all([int.reply("⏭️ Skipping track..."), queue.stop()]);
				if ((skipTo ?? 1) >= queue.songs.length) throw "Invalid track position!";
				await Promise.all([
					int.reply(skipTo ? `⏭️ Skipping to track ${skipTo}...` : "⏭️ Skipping track..."),
					distubeClient.jump(int.guildId, skipTo ?? 1)
				]);
			}
		},
		{
			name: "queue",
			description: "List the track currently playing along with the upcoming tracks in the queue",
			handler: async (int: ChatInputCommandInteraction) => {
				if (isQueueEmpty(distubeClient, int.guildId)) throw "No tracks in the queue!";
				const queue = distubeClient.getQueue(int.guildId);
				await int.reply(getNowPlayingAndNextUp(queue));
			}
		},
		{
			name: "clear",
			description: "Clear all tracks from the queue",
			handler: async (int: ChatInputCommandInteraction) => {
				if (isQueueEmpty(distubeClient, int.guildId)) throw "No tracks in the queue!";
				clearVideoQueue(distubeClient, int.guildId);
				await int.reply({ embeds: [Embed.success("✅ Queue cleared!")] });
			}
		},
		{
			name: "filter",
			description: "Apply a filter to the audio currently playing",
			options: [
				{
					name: "filter",
					description: "The audio filter to apply",
					type: ApplicationCommandOptionType.String,
					required: true,
					choices: [
						{
							name: "none",
							value: ""
						},
						{
							name: "bassboost",
							value: "bassboost"
						},
						{
							name: "echo",
							value: "echo"
						},
						{
							name: "karaoke",
							value: "karaoke"
						},
						{
							name: "nightcore",
							value: "nightcore"
						},
						{
							name: "vaporwave",
							value: "vaporwave"
						}
					]
				}
			],
			handler: async (int: ChatInputCommandInteraction) => {
				const member = int.guild.members.cache.get(int.member.user.id);
				const memberVoiceChannel = member?.voice?.channel;
				const botVoiceChannel = distubeClient.voices.get(int.guildId)?.channel;
				if (!memberVoiceChannel || !botVoiceChannel || memberVoiceChannel !== botVoiceChannel)
					throw "You must be in the same voice channel as the bot to use this command!";
				if (isQueueEmpty(distubeClient, int.guildId)) throw "No tracks in the queue!";
				const filter = int.options.getString("filter", true);
				const queue = distubeClient.getQueue(int.guildId);
				if (!filter) {
					if (queue.filters.names.length === 0) throw "No audio filters currently applied!";
					queue.filters.clear();
					int.reply({ embeds: [Embed.success("✅ Audio filter cleared!")] });
				} else {
					queue.filters.add(filter);
					int.reply({ embeds: [Embed.success(`✅ Audio filter applied: \`${filter}\``)] });
				}
			}
		}
	];

	const commandsLookup = commands.reduce(
		(acc, command) => {
			acc[command.name] = command;
			return acc;
		},
		{} as Record<string, ISlashCommand>
	);

	return { commands, commandsLookup };
};

export const registerCommands = async (client: Client, commands: ISlashCommand[]) => {
	try {
		await DiscordApi.put(Routes.applicationCommands(client.user.id), {
			body: commands
		});
	} catch (error) {
		throw `Error registering slash commands: ${error}`;
	}
};
