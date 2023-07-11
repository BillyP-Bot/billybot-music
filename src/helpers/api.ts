import { REST } from "discord.js";

import { config } from "./config";

export const DiscordApi = new REST({ version: "10" }).setToken(config.BOT_TOKEN);
