import { ISlashCommand } from "@types";

import {
	clearQueueCommand,
	clearVideoQueue,
	initDisTubeClient,
	playCommand,
	queueCommand,
	skipCommand
} from "./distube";

export const commands: ISlashCommand[] = [
	clearQueueCommand,
	playCommand,
	queueCommand,
	skipCommand
];

export const commandsLookup = commands.reduce((acc, command) => {
	acc[command.name] = command;
	return acc;
}, {} as Record<string, ISlashCommand>);

export {
	clearQueueCommand,
	clearVideoQueue,
	initDisTubeClient,
	playCommand,
	queueCommand,
	skipCommand
};
