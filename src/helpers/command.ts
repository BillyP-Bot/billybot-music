import { ChatInputCommandInteraction, Message } from "discord.js";

import { commandsLookup } from "@commands";
import { Embed } from "@helpers";

export const getInteractionOptionValue = <T>(
	optionName: string,
	int: ChatInputCommandInteraction,
	defaultValue?: T
) => {
	return (int.options.get(optionName)?.value ?? defaultValue) as T;
};

export const sendLegacyCommandDeprecationNotice = async (msg: Message) => {
	const commandName = msg.content.split(" ")[0].replace("!", "");
	if (!commandsLookup[commandName]) return;
	const description =
		"Commands prefixed with `!` are not supported!\n\nTry prefixing the command with `/` instead.";
	const embed = Embed.error(description, "Oops!");
	await msg.channel.send({ embeds: [embed] });
};
