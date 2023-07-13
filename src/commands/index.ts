import { ISlashCommand } from "@types";

import {
	clearQueueCommand,
	clearVideoQueue,
	filterCommand,
	initDisTubeClient,
	playCommand,
	queueCommand,
	skipCommand
} from "./distube";

export const commands: ISlashCommand[] = [
	clearQueueCommand,
	filterCommand,
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
	filterCommand,
	initDisTubeClient,
	playCommand,
	queueCommand,
	skipCommand
};
