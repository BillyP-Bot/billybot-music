export const Config = {
	IS_PROD: Bun.env.NODE_ENV === "production",
	BOT_TOKEN: Bun.env.BOT_TOKEN || undefined
};

if (Config.BOT_TOKEN === undefined) throw Error("BOT_TOKEN not specified");
