import os
import re
import subprocess
import threading
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from obswebsocket import obsws, events


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')


def rename_recording(output_path):
    path = Path(output_path)
    if not path.exists():
        print(f"  File not found: {output_path}")
        return

    try:
        result = subprocess.run(
            ['osascript', '-e',
             'display dialog "Title for recording:" default answer "" with title "OBS Recording"'],
            capture_output=True, text=True, check=True,
        )
        title = re.search(r'text returned:(.*)', result.stdout)
        title = title.group(1).strip() if title else ''
    except subprocess.CalledProcessError:
        print("  Cancelled — keeping original filename")
        return

    if not title:
        print("  Skipped — keeping original filename")
        return

    mtime = os.path.getmtime(path)
    date_str = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
    slug = slugify(title)
    new_name = f"{date_str}_{slug}{path.suffix}"
    new_path = path.parent / new_name

    os.rename(path, new_path)
    print(f"  Renamed: {path.name} → {new_name}")


def main():
    load_dotenv()

    host = os.getenv('OBS_HOST', 'localhost')
    port = int(os.getenv('OBS_PORT', '4455'))
    password = os.getenv('OBS_PASSWORD', '')

    ws = obsws(host, port, password)

    stop_event = threading.Event()
    stopped_path = {}

    def on_record_state_changed(event):
        state = event.datain.get('outputState', '')
        output_path = event.datain.get('outputPath', '')

        if state == 'OBS_WEBSOCKET_OUTPUT_STARTED':
            print("Recording started...")
        elif state == 'OBS_WEBSOCKET_OUTPUT_STOPPED':
            print(f"Recording stopped: {output_path}")
            stopped_path['path'] = output_path
            stop_event.set()

    ws.register(on_record_state_changed, events.RecordStateChanged)
    ws.connect()
    print(f"Connected to OBS ({host}:{port})")
    print("Watching for recordings... (Ctrl+C to quit)\n")

    try:
        while True:
            stop_event.wait()
            stop_event.clear()
            output_path = stopped_path.get('path')
            if output_path:
                rename_recording(output_path)
                print()
    except KeyboardInterrupt:
        print("\nDisconnecting...")
    finally:
        ws.disconnect()
        print("Disconnected from OBS")


if __name__ == '__main__':
    main()
