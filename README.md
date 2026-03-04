# the-one-clip

A media processing CLI that wraps ffmpeg into ergonomic commands for cutting, compressing, transcribing, and editing video files.

## Features

- **Cut** video segments by start/end timestamps
- **Compress** video with configurable quality and speed presets (H.264)
- **Batch compress** multiple files at once
- **Transcribe** video/audio to SRT subtitles via whisper.cpp
- **Extract audio** tracks to WAV
- **Select or remove** specific audio tracks
- **Remove silence** from recordings automatically
- **Extract thumbnails** using scene detection or fixed intervals

## Prerequisites

- **Node.js** 18+
- **ffmpeg** and **ffprobe**

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg
```

- **whisper.cpp** (optional, for transcription only) — see [whisper.cpp](https://github.com/ggerganov/whisper.cpp)

## Installation

```bash
git clone https://github.com/daymannovaes/the-one-clip.git
cd the-one-clip
npm install
npm link
```

The `media` command is now available globally.

## Docker

If you prefer not to install ffmpeg locally, use the Docker setup:

```bash
docker-compose build

# Run any command through Docker
./media-docker compress input/video.mkv -o output/video.mp4
```

The Docker image bundles ffmpeg and mounts `input/` and `output/` directories as volumes.

## Usage

```bash
# Cut a segment
media cut video.mkv --start 00:01:00 --end 00:05:00

# Compress a video
media compress video.mkv
media compress video.mkv --verygood --speed slow

# Batch compress multiple files
media compress-batch *.mkv

# Generate subtitles (requires whisper.cpp)
media transcript video.mkv

# Extract audio
media extract-audio video.mkv

# Select a specific audio track
media track video.mkv --track 2

# Remove an audio track
media remove-track video.mkv --track 1

# Remove silent segments
media silence-remove video.mkv --threshold -30dB --duration 0.5

# Extract thumbnails
media thumbnail video.mkv --count 5
```

All commands accept `-o <file>` to specify an output path. If omitted, outputs are named `<input>_<timestamp>.<ext>`.

## OBS Integration

The `obs/` directory contains experimental Python scripts for controlling OBS Studio via WebSocket:

- `connect.py` — Connect and list available scenes
- `operations.py` — Programmatic recording control
- `example.py` / `c2.py` — Usage examples

Requires `pip install -r obs/requirements.txt` and OBS WebSocket server enabled.

## Architecture

```
bin/media            # CLI entry point (Commander)
commands/            # One file per command
  cut.js
  compress.js
  compress-batch.js
  extract-audio.js
  track.js
  remove-track.js
  transcript.js
  silence-remove.js
  thumbnail.js
obs/                 # OBS WebSocket scripts (Python)
Dockerfile           # Docker image with ffmpeg + Node.js
docker-compose.yml
```

## License

MIT
