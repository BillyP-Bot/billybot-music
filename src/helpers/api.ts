import { REST } from "discord.js";

import { Config } from "./config";

export const DiscordApi = new REST({ version: "10" }).setToken(Config.BOT_TOKEN);
