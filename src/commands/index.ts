import { ISlashCommand } from "@types";

import {
	clearQueueCommand,
	clearVideoQueue,
	playYoutubeCommand,
	queueCommand,
	skipCommand
} from "./play-youtube-video";

export const commands: ISlashCommand[] = [
	clearQueueCommand,
	playYoutubeCommand,
	queueCommand,
	skipCommand
];

export const commandsLookup = commands.reduce((acc, command) => {
	acc[command.name] = command;
	return acc;
}, {} as Record<string, ISlashCommand>);

export { clearQueueCommand, clearVideoQueue, playYoutubeCommand, queueCommand, skipCommand };
