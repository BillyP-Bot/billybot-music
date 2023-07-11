import {
	ApplicationCommandOption,
	ApplicationCommandType,
	ChatInputCommandInteraction,
	MessageReaction,
	Permissions
} from "discord.js";
import { DisTube } from "distube";
import { Video } from "youtube-sr";

import { Queue } from "@helpers";

export interface ISlashCommand {
	id?: string;
	name: string;
	description: string;
	options?: ISlashCommandOption[];
	type?: ApplicationCommandType;
	default_member_permissions?: Permissions;
	default_permission?: boolean;
	nsfw?: boolean;
	handler: (int: ChatInputCommandInteraction) => Promise<void>;
	reactHandler?: (react: MessageReaction, sender_id: string) => Promise<void>;
}

// use these instead of minValue, maxValue, etc.
export type ISlashCommandOption = ApplicationCommandOption & {
	min_value?: number;
	max_value?: number;
	min_length?: number;
	max_length?: number;
};

export interface IDisTube {
	client: DisTube;
	queue: Queue<Video>;
}
