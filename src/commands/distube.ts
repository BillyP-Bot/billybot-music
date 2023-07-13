import { ApplicationCommandOptionType, ChatInputCommandInteraction, Client } from "discord.js";
import DisTubeClient, { Events, Queue } from "distube";

import { SoundCloudPlugin } from "@distube/soundcloud";
import { SpotifyPlugin } from "@distube/spotify";
import { YtDlpPlugin } from "@distube/yt-dlp";
import { CommandNames } from "@enums";
import { Embed, getInteractionOptionValue } from "@helpers";
import { ISlashCommand } from "@types";

const INACTIVITY_SEC = 60;

let DisTube: DisTubeClient;

export const initDisTubeClient = (client: Client) => {
	if (DisTube) return;
	DisTube = new DisTubeClient(client, {
		leaveOnStop: false,
		leaveOnEmpty: true,
		leaveOnFinish: false,
		nsfw: true,
		plugins: [
			new SpotifyPlugin({
				emitEventsAfterFetching: true
			}),
			new SoundCloudPlugin(),
			new YtDlpPlugin()
		]
	});
	DisTube.on(Events.INIT_QUEUE, (queue) => {
		DisTube.setVolume(queue, 30);
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
	DisTube.on(Events.SEARCH_NO_RESULT, async (message) => {
		await message.channel.send("No results found}!");
	});
	DisTube.on(Events.ERROR, async (channel, error) => {
		await channel.send(`Error: ${error}`);
		console.error({ error });
	});
};

export const playCommand: ISlashCommand = {
	name: CommandNames.p,
	description: "Play audio from YouTube, Spotify, or SoundCloud in the current voice channel",
	options: [
		{
			name: "search",
			description: "Video URL or text to search for (plays first result)",
			type: ApplicationCommandOptionType.String,
			required: true
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		const searchTextOrUrl = getInteractionOptionValue<string>("search", int);
		const voiceChannel = int.guild.members.cache.get(int.member.user.id)?.voice?.channel;
		if (!voiceChannel) throw "You must be in a voice channel to use this command!";
		await int.reply(`Searching for \`${searchTextOrUrl}\`...`);
		try {
			await DisTube.play(voiceChannel, searchTextOrUrl, {
				position: 0,
				textChannel: int.channel,
				message: await int.fetchReply()
			});
		} catch (error) {
			await int.channel.send({ embeds: [Embed.error(error.message)] });
			console.error({ error });
		}
	}
};

export const skipCommand: ISlashCommand = {
	name: CommandNames.skip,
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
		if (isQueueEmpty(int.guildId)) throw "No tracks in the queue!";
		const jumpTo = getInteractionOptionValue<number>("to", int);
		const queue = DisTube.getQueue(int.guildId);
		if (!jumpTo && queue.songs.length === 1)
			return await Promise.all([int.reply("⏭️ Skipping track..."), queue.stop()]);
		if ((jumpTo ?? 1) >= queue.songs.length) throw "Invalid track position!";
		await Promise.all([
			int.reply(jumpTo ? `⏭️ Skipping to track ${jumpTo}...` : "⏭️ Skipping track..."),
			DisTube.jump(int.guildId, jumpTo ?? 1)
		]);
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
		await int.reply({ embeds: [Embed.success("✅ Queue cleared!")] });
	}
};

export const filterCommand: ISlashCommand = {
	name: CommandNames.filter,
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
		if (isQueueEmpty(int.guildId)) throw "No tracks in the queue!";
		const filter = getInteractionOptionValue<string>("filter", int);
		const queue = DisTube.getQueue(int.guildId);
		if (!filter) {
			if (queue.filters.names.length === 0) throw "No audio filters applied!";
			queue.filters.clear();
			int.reply({ embeds: [Embed.success("✅ Audio filter cleared!")] });
		} else {
			if (queue.filters.names.length > 0) queue.filters.clear();
			queue.filters.add(filter);
			int.reply({ embeds: [Embed.success(`✅ Audio filter applied: \`${filter}\``)] });
		}
	}
};

export const clearVideoQueue = (guild_id: string) => {
	const queue = DisTube.getQueue(guild_id);
	if (queue) queue.stop();
};

const getNowPlayingAndNextUp = (queue: Queue, showExtraInfo?: boolean) => {
	const current = queue.songs[0];
	let text = `▶️ Now Playing:\n\`${current.name}\`${
		showExtraInfo ? `\n⏱️ \`${current.formattedDuration}\`\n${current.url}` : ""
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
