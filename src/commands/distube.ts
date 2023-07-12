import { ApplicationCommandOptionType, ChatInputCommandInteraction, Client } from "discord.js";
import DisTubeClient, { Events, Queue } from "distube";
import YouTube from "youtube-sr";

import { CommandNames } from "@enums";
import { Embed, getInteractionOptionValue, isValidURL } from "@helpers";
import { ISlashCommand } from "@types";

const INACTIVITY_SEC = 60;

let DisTube: DisTubeClient;

export const initDisTubeClient = (client: Client) => {
	if (DisTube) return;
	DisTube = new DisTubeClient(client, {
		leaveOnStop: false,
		leaveOnEmpty: true,
		leaveOnFinish: false,
		nsfw: true
	});
	DisTube.on(Events.INIT_QUEUE, (queue) => {
		DisTube.setVolume(queue, 70);
	});
	DisTube.on(Events.ADD_SONG, async (queue, video) => {
		if (queue.songs.length <= 1) return;
		await queue.textChannel?.send(
			`✅ Queued Video:\n${video.name}\n\n${getNowPlayingAndNextUp(queue)}`
		);
	});
	DisTube.on(Events.PLAY_SONG, async (queue) => {
		await queue.textChannel?.send(getNowPlayingAndNextUp(queue, true));
	});
	DisTube.on(Events.FINISH, (queue) => {
		exitAfterTimeoutIfQueueEmpty(queue);
	});
	DisTube.on(Events.DELETE_QUEUE, (queue) => {
		exitAfterTimeoutIfQueueEmpty(queue);
	});
	DisTube.on(Events.ERROR, (_textChannel, error) => {
		console.error({ error });
	});
};

export const playCommand: ISlashCommand = {
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
		const voiceChannel = int.guild.members.cache.get(int.member.user.id)?.voice?.channel;
		if (!voiceChannel) throw "You must be in a voice channel to use this command!";
		await int.reply(`Searching YouTube for \`${searchTextOrUrl}\`...`);
		try {
			const video = isValidURL(searchTextOrUrl)
				? await YouTube.getVideo(searchTextOrUrl)
				: await YouTube.searchOne(searchTextOrUrl);
			if (!video) throw "No results found!";
			await DisTube.play(voiceChannel, searchTextOrUrl, {
				position: 0,
				textChannel: int.channel
			});
		} catch (error) {
			await int.channel.send({ embeds: [Embed.error("Error playing video!")] });
			console.error({ error });
		}
	}
};

export const skipCommand: ISlashCommand = {
	name: CommandNames.skip,
	description: "Skip the track that is currently playing",
	handler: async (int: ChatInputCommandInteraction) => {
		if (isQueueEmpty(int.guildId)) throw "No tracks in the queue!";
		const queue = DisTube.getQueue(int.guildId);
		const action =
			queue.songs.length > 1 ? () => DisTube.skip(int.guildId) : () => queue.stop();
		await Promise.all([int.reply("⏭️ Skipping track..."), action()]);
	}
};

export const queueCommand: ISlashCommand = {
	name: CommandNames.queue,
	description: "List the track currently playing along with the upcoming tracks in the queue",
	handler: async (int: ChatInputCommandInteraction) => {
		if (isQueueEmpty(int.guildId)) throw "No tracks in the queue!";
		const queue = DisTube.getQueue(int.guildId);
		await int.reply(getNowPlayingAndNextUp(queue));
	}
};

export const clearQueueCommand: ISlashCommand = {
	name: CommandNames.clearqueue,
	description: "Clears all tracks from the YouTube queue",
	handler: async (int: ChatInputCommandInteraction) => {
		if (isQueueEmpty(int.guildId)) throw "No tracks in the queue!";
		clearVideoQueue(int.guildId);
		await int.reply({ embeds: [Embed.success("Queue cleared!")] });
	}
};

export const clearVideoQueue = (guild_id: string) => {
	const queue = DisTube.getQueue(guild_id);
	if (queue) queue.stop();
};

const getNowPlayingAndNextUp = (queue: Queue, showLink?: boolean) => {
	const current = queue.songs[0];
	let text = `▶️ Now Playing:\n\`${current.name}\`${
		showLink ? `\n${current.url}\n${current.formattedDuration}` : ""
	}\n\n`;
	if (queue.songs.length > 1) {
		text += "🎶 Next Up:\n";
		text += queue.songs.reduce((acc, { name }, i) => {
			return acc + (i > 0 ? `**${i}.** \`${name}\`\n` : "");
		}, "");
	}
	return text;
};

const isQueueEmpty = (guild_id: string) => {
	const queue = DisTube.getQueue(guild_id);
	if (!queue || queue.songs.length === 0) return true;
	return false;
};

const exitAfterTimeoutIfQueueEmpty = (queue: Queue) => {
	setTimeout(() => {
		const guildId = queue?.voiceChannel?.guildId;
		if (guildId && DisTube.voices.get(guildId) && isQueueEmpty(guildId))
			DisTube.voices.leave(guildId);
	}, INACTIVITY_SEC * 1000);
};
