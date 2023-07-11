import "dotenv/config";

export const config = {
	IS_PROD: process.env.NODE_ENV == "production" ? true : false,
	BOT_TOKEN: process.env.BOT_TOKEN || undefined
};

if (config.BOT_TOKEN === undefined) throw Error("BOT_TOKEN not specified");
