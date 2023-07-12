import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	TextChannel,
	VoiceBasedChannel
} from "discord.js";
import { Events } from "distube";
import YouTube from "youtube-sr";

import { CommandNames } from "@enums";
import { DisTube, getInteractionOptionValue, isValidURL } from "@helpers";
import { ISlashCommand } from "@types";

const INACTIVITY_SEC = 60;

export const playYoutubeCommand: ISlashCommand = {
	name: CommandNames.p,
	description: "Play a YouTube video in the current voice channel",
	options: [
		{
			name: "search",
			description: "Video URL or text to search YouTube for (plays first result)",
			type: ApplicationCommandOptionType.String,
			required: true
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		const searchTextOrUrl = getInteractionOptionValue<string>("search", int);
		const member = int.guild.members.cache.get(int.member.user.id);
		const voiceChannel = member.voice.channel;
		await int.reply(`Searching YouTube for \`${searchTextOrUrl}\`...`);
		await play(searchTextOrUrl, int.channel as TextChannel, voiceChannel);
	}
};

const play = async (
	searchTextOrUrl: string,
	textChannel: TextChannel,
	voiceChannel: VoiceBasedChannel
) => {
	try {
		const video = isValidURL(searchTextOrUrl)
			? await YouTube.getVideo(searchTextOrUrl)
			: await YouTube.searchOne(searchTextOrUrl);
		if (!video) throw "No results found!";
		DisTube.queue.enqueue(video, textChannel.guildId);
		if (DisTube.queue.length(textChannel.guildId) === 1) {
			await playNextVideoInQueue(textChannel, voiceChannel);
		} else {
			await textChannel.send(
				`✅ Queued Video:\n\`${video.title}\`\n\n` +
					getNowPlayingAndNextUp(textChannel.guildId)
			);
		}
	} catch (error) {
		switch (error.errorCode) {
			case "NO_RESULT":
				throw "No results found!";
			case "INVALID_TYPE":
				throw "User must be in a voice channel!";
			default:
				throw error;
		}
	}
};

const playNextVideoInQueue = async (textChannel: TextChannel, voiceChannel: VoiceBasedChannel) => {
	const video = DisTube.queue.front(textChannel.guildId);
	if (!video) return exitAfterTimeoutIfQueueEmpty(voiceChannel.guild.id);
	await DisTube.client.play(voiceChannel, video.url);
	await textChannel.send(getNowPlayingAndNextUp(textChannel.guildId));
	DisTube.client.once(Events.FINISH_SONG, async () => {
		DisTube.queue.dequeue(textChannel.guildId);
		await playNextVideoInQueue(textChannel, voiceChannel);
	});
};

export const skipCommand: ISlashCommand = {
	name: CommandNames.skip,
	description: "Skip the track that is currently playing",
	handler: async (int: ChatInputCommandInteraction) => {
		if (!DisTube.queue.front(int.guildId)) throw "No track is currently playing!";
		await int.reply("⏭️ Skipping track...");
		DisTube.client.seek(int.guild.id, DisTube.queue.front(int.guildId).duration);
	}
};

export const queueCommand: ISlashCommand = {
	name: CommandNames.queue,
	description: "List the track currently playing along with the upcoming tracks in the queue",
	handler: async (int: ChatInputCommandInteraction) => {
		if (DisTube.queue.length(int.guildId) === 0) throw "No tracks in the queue!";
		await int.reply(getNowPlayingAndNextUp(int.guildId));
	}
};

export const clearQueueCommand: ISlashCommand = {
	name: CommandNames.clearqueue,
	description: "Clears all tracks from the YouTube queue",
	handler: async (int: ChatInputCommandInteraction) => {
		if (DisTube.queue.length(int.guildId) === 0) throw "No tracks in the queue!";
		clearVideoQueue(int.guildId);
		await int.reply("Queue cleared!");
	}
};

export const clearVideoQueue = (guild_id: string) => {
	DisTube.queue.clear(guild_id);
};

const getNowPlayingAndNextUp = (guild_id: string) => {
	let text = `▶️ Now Playing:\n\`${DisTube.queue.front(guild_id).title}\`\n\n`;
	if (DisTube.queue.length(guild_id) > 1) {
		text += "🎶 Next Up:\n";
		text += DisTube.queue.list(guild_id).reduce((acc, { title }, i) => {
			return acc + (i > 0 ? `**${i}.** \`${title}\`\n` : "");
		}, "");
	}
	return text;
};

const exitAfterTimeoutIfQueueEmpty = (guild_id: string) => {
	setTimeout(() => {
		if (!DisTube.queue.front(guild_id)) DisTube.client.voices.collection.get(guild_id)?.leave();
	}, INACTIVITY_SEC * 1000);
};
