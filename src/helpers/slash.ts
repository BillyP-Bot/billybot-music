import { Client, Routes } from "discord.js";

import { commands } from "@commands";
import { DiscordApi } from "@helpers";

export const registerSlashCommands = async (client: Client) => {
	try {
		await DiscordApi.put(Routes.applicationCommands(client.user.id), {
			body: commands
		});
	} catch (error) {
		throw `Error registering slash commands: ${error}`;
	}
};
