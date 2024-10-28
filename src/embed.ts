import { EmbedBuilder } from "discord.js";

enum EmbedColor {
	red = "#ff6666",
	green = "#00e64d"
}

export class Embed {
	static success(description?: string, title?: string) {
		const embed = new EmbedBuilder();
		embed.setColor(EmbedColor.green);
		if (title) embed.setTitle(title);
		embed.setDescription(description);
		return embed;
	}

	static error(description?: string, title?: string) {
		const embed = new EmbedBuilder();
		embed.setColor(EmbedColor.red).setTitle(title ?? "Error");
		embed.setDescription(description);
		return embed;
	}
}
