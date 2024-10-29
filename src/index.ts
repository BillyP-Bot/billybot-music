import { Client, Events, GatewayIntentBits } from "discord.js";
import DisTubeClient from "distube";
import * as fs from "fs";

import { SoundCloudPlugin } from "@distube/soundcloud";
import { SpotifyPlugin } from "@distube/spotify";
import { YouTubePlugin } from "@distube/youtube";

import { createCommands, registerCommands } from "./commands";
import { Config } from "./config";
import { createDistTubeEventHandlers } from "./distube";
import { Embed } from "./embed";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates
	]
});

const distubeClient = new DisTubeClient(client, {
	nsfw: true,
	plugins: [
		new YouTubePlugin({ cookies: JSON.parse(fs.readFileSync("cookies.json").toString()) }),
		new SoundCloudPlugin(),
		new SpotifyPlugin()
	]
});

const { commands, commandsLookup } = createCommands(distubeClient);

client.once(Events.ClientReady, async () => {
	try {
		createDistTubeEventHandlers(distubeClient);
		await registerCommands(client, commands);
		console.log(`Logged in as ${client.user.tag} in ${Config.IS_PROD ? "production" : "development"} mode!`);
	} catch (error) {
		console.error(error);
	}
});

client.on(Events.InteractionCreate, async int => {
	try {
		if (int.channel.name.includes("test") && Config.IS_PROD) return;
		if (!int.channel.name.includes("test") && !Config.IS_PROD) return;
		if (!int.isChatInputCommand()) return;

		const command = commandsLookup[int.commandName];
		if (!command?.handler) throw "Command not supported yet! Check back soon.";
		await command.handler(int);
	} catch (error) {
		console.error(error);
		if (!int.isRepliable()) return;
		if (!("message" in error)) return;
		const { message } = error;
		const embed = { embeds: [Embed.error(message)] };
		if (int.deferred || int.replied) await int.editReply(embed);
		else await int.reply(embed);
	}
});

client.login(Config.BOT_TOKEN).catch(error => {
	console.error(error);
});
