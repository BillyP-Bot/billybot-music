# billybot-music

The one and only DJ BillyP!

![screenshot](https://cdn.discordapp.com/app-icons/1128402983353327696/3ad97728b8bc7f63ddac80273c34c515.png?size=512)

## Setup

1. Install Python (version [3.13.3](https://www.python.org/downloads/release/python-3133/) confirmed working)
2. If running on Linux, install the following packages:
   - ffmpeg
   - libffi-dev
   - libnacl-dev
3. Install Python package dependencies:
   ```bash
   pip install -r config/requirements.txt
   ```
4. Create a `.env` file in root project folder:
   ```
   ENVIRONMENT=dev
   BOT_TOKEN=*your discord bot token*
   ```
5. Start the bot:
   ```bash
   python run.py
   ```
