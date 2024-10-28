import "dotenv/config";

export const Config = {
	IS_PROD: process.env.NODE_ENV === "production",
	BOT_TOKEN: process.env.BOT_TOKEN
};

if (!Config.BOT_TOKEN) throw Error("BOT_TOKEN env var has not been set");
