import { Client, Events, GatewayIntentBits } from "discord.js";

import { clearVideoQueue, commandsLookup } from "@commands";
import {
	config,
	Embed,
	initDisTubeClient,
	registerSlashCommands,
	sendLegacyCommandDeprecationNotice
} from "@helpers";

process.on("unhandledRejection", (error) => {
	console.error({ error });
});

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates
	]
});

initDisTubeClient(client);

client.once(Events.ClientReady, async () => {
	try {
		await registerSlashCommands(client);
		console.log(`Logged in as ${client.user.tag}!`);
	} catch (error) {
		console.error({ error });
	}
});

client.on(Events.InteractionCreate, async (int) => {
	try {
		if (int.channel.name.includes("test") && config.IS_PROD) return;
		if (int.isChatInputCommand()) {
			const command = commandsLookup[int.commandName];
			if (command) return await command.handler(int);
			else throw "Command not supported yet! Check back soon.";
		}
	} catch (error) {
		console.error({ error });
		if (!int.isRepliable()) return;
		const embed = { embeds: [Embed.error(error)] };
		if (int.deferred || int.replied) await int.editReply(embed);
		else await int.reply(embed);
	}
});

client.on(Events.MessageCreate, async (msg) => {
	try {
		if (msg.author.bot) return;
		if (msg.content[0] === "!") return await sendLegacyCommandDeprecationNotice(msg);
	} catch (error) {
		console.error({ error });
		await msg.channel.send({ embeds: [Embed.error(error)] });
	}
});

client.on(Events.VoiceStateUpdate, (oldState) => {
	try {
		// when bot leaves voice channel
		if (oldState.member.user.bot && oldState.channelId) clearVideoQueue();
	} catch (error) {
		console.error({ error });
	}
});

client.login(config.BOT_TOKEN).catch((error) => {
	console.error({ error });
});
