import os
import shutil

import discord
from discord.ext import commands

from config import config
from musicbot.audiocontroller import AudioController
from musicbot.settings import Settings
from musicbot.utils import guild_to_audiocontroller, guild_to_settings

intents = discord.Intents.default()
intents.messages = True
intents.message_content = True

initial_extensions = ['musicbot.commands.music',
                      'musicbot.commands.general', 'musicbot.plugins.button']
bot = commands.Bot(command_prefix=config.BOT_PREFIX,
                   pm_help=True, case_insensitive=True, intents=intents)


if __name__ == '__main__':
    config.ABSOLUTE_PATH = os.path.dirname(os.path.abspath(__file__))
    config.COOKIE_PATH = config.ABSOLUTE_PATH + config.COOKIE_PATH
    
    # Copy cookies_init.txt to cookies.txt if cookies.txt doesn't exist
    if not os.path.exists(config.COOKIE_PATH):
        shutil.copyfile(config.ABSOLUTE_PATH + config.COOKIE_INIT_PATH, config.COOKIE_PATH)

    SETTINGS_INIT_PATH = config.ABSOLUTE_PATH + "/musicbot/generated/settings_init.json"
    SETTINGS_PATH = config.ABSOLUTE_PATH + "/musicbot/generated/settings.json"

    # Copy settings_init.json to settings.json if settings.json doesn't exist
    if not os.path.exists(SETTINGS_PATH):
        shutil.copyfile(SETTINGS_INIT_PATH, SETTINGS_PATH)

    if config.BOT_TOKEN == "":
        print("Error: BOT_TOKEN not set in .env file")
        exit

    for extension in initial_extensions:
        try:
            bot.load_extension(extension)
        except Exception as e:
            print(e)

@bot.event
async def on_ready():
    print(config.STARTUP_MESSAGE)
    await bot.change_presence(status=discord.Status.online)

    for guild in bot.guilds:
        await register(guild)
        print("Joined {}".format(guild.name))

    print(config.STARTUP_COMPLETE_MESSAGE)


@bot.event
async def on_guild_join(guild):
    print(guild.name)
    await register(guild)


async def register(guild):

    guild_to_settings[guild] = Settings(guild)
    guild_to_audiocontroller[guild] = AudioController(bot, guild)

    sett = guild_to_settings[guild]

    try:
        await guild.me.edit(nick=sett.get('default_nickname'))
    except:
        pass

    if config.GLOBAL_DISABLE_AUTOJOIN_VC == True:
        return

    vc_channels = guild.voice_channels

    if sett.get('vc_timeout') == False:
        if sett.get('start_voice_channel') == None:
            try:
                await guild_to_audiocontroller[guild].register_voice_channel(guild.voice_channels[0])
            except Exception as e:
                print(e)

        else:
            for vc in vc_channels:
                if vc.id == sett.get('start_voice_channel'):
                    try:
                        await guild_to_audiocontroller[guild].register_voice_channel(vc_channels[vc_channels.index(vc)])
                    except Exception as e:
                        print(e)


bot.run(config.BOT_TOKEN)
