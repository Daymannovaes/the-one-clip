import asyncio
from operations import OBSController
from dotenv import load_dotenv
import os
import time

async def run_example():
    # Load environment variables
    load_dotenv()

    # Get connection details from environment
    host = os.getenv('OBS_HOST', 'localhost')
    port = int(os.getenv('OBS_PORT', '4455'))
    password = os.getenv('OBS_PASSWORD', '')

    # Use the context manager to handle connection/disconnection
    with OBSController(host, port, password) as obs:
        # List all scenes
        scenes = obs.get_scenes()
        print("Available scenes:", scenes)

        if len(scenes) > 0:
            # Switch to first scene
            first_scene = scenes[0]
            print(f"Switching to scene: {first_scene}")
            obs.switch_scene(first_scene)

            # Start recording
            print("Starting recording...")
            obs.start_recording()

            # Wait for 5 seconds
            time.sleep(5)

            # Stop recording
            print("Stopping recording...")
            obs.stop_recording()

if __name__ == "__main__":
    asyncio.run(run_example()) 
