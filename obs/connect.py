import asyncio
import os
from dotenv import load_dotenv
from obswebsocket import obsws, requests

# Load environment variables
load_dotenv()

# OBS WebSocket connection settings
host = os.getenv('OBS_HOST', 'localhost')
port = int(os.getenv('OBS_PORT', '4455'))
password = os.getenv('OBS_PASSWORD', '')

print(f"Connecting to OBS at {host}:{port} with password {password}")

async def connect_to_obs():
    try:
        # Connect to OBS
        ws = obsws(host, port, password)
        ws.connect()
        print("Connected to OBS successfully!")

        # Get OBS version
        version = ws.call(requests.GetVersion())
        print(f"OBS Version: {version.getObsVersion()}")
        print(f"WebSocket Version: {version.getObsWebSocketVersion()}")

        # List available scenes
        scenes = ws.call(requests.GetSceneList())
        print("\nAvailable Scenes:")
        for scene in scenes.getScenes():
            print(f"- {scene['sceneName']}")

        # Disconnect
        ws.disconnect()

    except Exception as e:
        print(f"Error connecting to OBS: {str(e)}")

if __name__ == "__main__":
    asyncio.run(connect_to_obs())
