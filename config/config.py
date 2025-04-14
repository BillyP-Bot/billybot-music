from dotenv import load_dotenv
import os

load_dotenv()

BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")
SPOTIFY_ID: str = "1310faf218d54033829ebe6364f4a5af"
SPOTIFY_SECRET: str = "489c6235369b4a06b7a5dbf6eea4dab6"

BOT_PREFIX = "."

EMBED_COLOR = 0x4dd4d0  #replace after'0x' with desired hex code ex. '#ff0188' >> '0xff0188'

SUPPORTED_EXTENSIONS = ('.webm', '.mp4', '.mp3', '.avi', '.wav', '.m4v', '.ogg', '.mov')

MAX_SONG_PRELOAD = 5  #maximum of 25

COOKIE_PATH = "/config/cookies/cookies.txt"
COOKIE_IGNORE_PATH = "/config/cookies/cookies_ignore.txt"

GLOBAL_DISABLE_AUTOJOIN_VC = False

VC_TIMEOUT = 60 #seconds
VC_TIMOUT_DEFAULT = True  #default template setting for VC timeout true= yes, timeout false= no timeout
ALLOW_VC_TIMEOUT_EDIT = True  #allow or disallow editing the vc_timeout guild setting


STARTUP_MESSAGE = "Starting Bot..."
STARTUP_COMPLETE_MESSAGE = "Startup Complete"

NO_GUILD_MESSAGE = "Error: Please join a voice channel or enter the command in guild chat"
USER_NOT_IN_VC_MESSAGE = "Error: Please join the active voice channel to use commands"
WRONG_CHANNEL_MESSAGE = "Error: Please use the music commands channel"
NOT_CONNECTED_MESSAGE = "Error: The bot is not connected to any voice channel"
ALREADY_CONNECTED_MESSAGE = "Error: The bot is already connected to a voice channel"
CHANNEL_NOT_FOUND_MESSAGE = "Error: The specified channel was not found"
DEFAULT_CHANNEL_JOIN_FAILED = "Error: Could not join the default voice channel"
INVALID_INVITE_MESSAGE = "Error: Invalid invite link"

ADD_MESSAGE= "Para añadir al bot a tu server, clickea [aca]" #brackets will be the link text

INFO_HISTORY_TITLE = "Songs Played:"
MAX_HISTORY_LENGTH = 10
MAX_TRACKNAME_HISTORY_LENGTH = 15

SONGINFO_UPLOADER = "Uploaded by: "
SONGINFO_DURATION = "Duration: "
SONGINFO_SECONDS = "s"
SONGINFO_LIKES = "Likes: "
SONGINFO_DISLIKES = "Dislikes: "
SONGINFO_NOW_PLAYING = "Playing"
SONGINFO_QUEUE_ADDED = "Added to queue"
SONGINFO_SONGINFO = "Song info"
SONGINFO_ERROR = "Error: Unsupported site or age restricted content. To enable age restricted content check the documentation/wiki."
SONGINFO_PLAYLIST_QUEUED = "Queued playlist :page_with_curl:"
SONGINFO_UNKNOWN_DURATION = "Unknown"

HELP_ADDBOT_SHORT = "Add the bot to another server"
HELP_ADDBOT_LONG = "Gives you the link to add Gonk to one of your other servers."
HELP_CONNECT_SHORT = "Connect Gonk to the voice channel"
HELP_CONNECT_LONG = "Connects Gonk to the voice channel you are currently in"
HELP_DISCONNECT_SHORT = "Disconnect Gonk"
HELP_DISCONNECT_LONG = "Disconnects Gonk from the voice channel and stops the music."

HELP_SETTINGS_SHORT = "Allows you to view and modify some of the bot's settings"
HELP_SETTINGS_LONG = "Allows you to view and modify some of the bot's configurations on the server. Usage: {}settings setting_name value".format(BOT_PREFIX)

HELP_HISTORY_SHORT = "Shows the song history"
HELP_HISTORY_LONG = "Displays the last " + str(MAX_TRACKNAME_HISTORY_LENGTH) + " songs played."
HELP_PAUSE_SHORT = "Pause the music"
HELP_PAUSE_LONG = "Pauses the current audio player. Can be resumed with the resume command."
HELP_VOL_SHORT = "Change the volume"
HELP_VOL_LONG = "Changes the volume of the audio player. The argument specifies the percentage of volume to set."
HELP_PREV_SHORT = "Play the previous song"
HELP_PREV_LONG = "Plays the previous song again."
HELP_RESUME_SHORT = "Resume the music"
HELP_RESUME_LONG = "Resumes the audio player."
HELP_SKIP_SHORT = "Skip the song"
HELP_SKIP_LONG = "Skips the current song and selects the next one in the queue."
HELP_SONGINFO_SHORT = "Current song info"
HELP_SONGINFO_LONG = "Displays details about the current song along with its link."
HELP_STOP_SHORT = "Stop the music"
HELP_STOP_LONG = "Stops the music player and clears the song queue."
HELP_MOVE_LONG = f"{BOT_PREFIX}move [position to change] [new position]"
HELP_MOVE_SHORT = "Moves a specific song in the list"
HELP_YT_SHORT = "Play the specified link or search on YouTube"
HELP_YT_LONG = "$p [link/video title/key words/playlist-link/soundcloud link/spotify link/bandcamp link/twitter link]"
HELP_PING_SHORT = "Pong"
HELP_PING_LONG = "The best command in the world (used to test the bot's responsiveness)"
HELP_CLEAR_SHORT = "Clear the song queue."
HELP_CLEAR_LONG = "Clears the song list and skips the current song."
HELP_LOOP_SHORT = "Loop the current song"
HELP_LOOP_LONG = "Loops the current song and locks the queue by continuously replaying the same track. Use this command again to break the loop."
HELP_QUEUE_SHORT = "Show the song queue."
HELP_QUEUE_LONG = "Displays the song queue (up to 10)."
HELP_SHUFFLE_SHORT = "Shuffle the song queue"
HELP_SHUFFLE_LONG = "Randomly shuffles the songs added to the queue."
HELP_CHANGECHANNEL_SHORT = "Change the bot's channel"
HELP_CHANGECHANNEL_LONG = "Changes the bot's channel to the one you are currently in."

ABSOLUTE_PATH = '' #do not modify