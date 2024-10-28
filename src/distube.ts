import DisTubeClient, { Events as DisTubeEvents, Queue } from "distube";

const INACTIVITY_SEC = 60;

const GOODBYE_URL = "https://soundcloud.com/chris-leveille-142418539/goodbye";

interface SongMetadata {
	isGoodbye: boolean;
}

export const createDistTubeEventHandlers = (distubeClient: DisTubeClient) => {
	distubeClient.on(DisTubeEvents.INIT_QUEUE, queue => {
		distubeClient.setVolume(queue, 25);
	});

	distubeClient.on(DisTubeEvents.ADD_SONG, async (queue, song) => {
		if (queue.songs.length <= 1) return;
		await queue.textChannel?.send(`✅ Queued Track:\n\`${song.name}\`\n\n${getNowPlayingAndNextUp(queue)}`);
	});

	distubeClient.on(DisTubeEvents.PLAY_SONG, async queue => {
		await queue.textChannel?.send(getNowPlayingAndNextUp(queue, true));
	});
	distubeClient.on(DisTubeEvents.FINISH_SONG, (queue, song) => {
		const metadata: SongMetadata = song?.metadata as SongMetadata;
		if (metadata?.isGoodbye) exitAfterGoodbye(distubeClient, queue);
	});
	distubeClient.on(DisTubeEvents.FINISH, queue => {
		playGoodbyeAfterTimeoutIfQueueEmpty(distubeClient, queue);
	});
	distubeClient.on(DisTubeEvents.DELETE_QUEUE, queue => {
		playGoodbyeAfterTimeoutIfQueueEmpty(distubeClient, queue);
	});
	distubeClient.on(DisTubeEvents.NO_RELATED, async queue => {
		await queue.textChannel?.send("No results found!");
	});
};

export const clearVideoQueue = (distubeClient: DisTubeClient, guild_id: string) => {
	const queue = distubeClient.getQueue(guild_id);
	if (queue) queue.stop();
};

export const getNowPlayingAndNextUp = (queue: Queue, showExtraInfo?: boolean) => {
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

export const isQueueEmpty = (distubeClient: DisTubeClient, guild_id: string) => {
	const queue = distubeClient.getQueue(guild_id);
	if (!queue || queue.songs.length === 0) return true;
	return false;
};

export const playGoodbyeAfterTimeoutIfQueueEmpty = (distubeClient: DisTubeClient, queue: Queue) => {
	setTimeout(async () => {
		const guildId = queue?.voiceChannel?.guildId;
		if (guildId && distubeClient.voices.get(guildId) && isQueueEmpty(distubeClient, guildId)) {
			try {
				await distubeClient.play(queue.voiceChannel, GOODBYE_URL, {
					metadata: { isGoodbye: true }
				});
			} catch (error) {
				console.error(error);
				distubeClient.voices.leave(guildId);
			}
		}
	}, INACTIVITY_SEC * 1000);
};

export const exitAfterGoodbye = (distubeClient: DisTubeClient, queue: Queue) => {
	const guildId = queue?.voiceChannel?.guildId;
	distubeClient.voices.leave(guildId);
};
