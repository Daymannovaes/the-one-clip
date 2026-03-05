<p align="center">
  <img src="docs/favicon.svg" alt="OneClip" width="96" height="96">
</p>

<img width="1599" height="822" alt="image" src="https://github.com/user-attachments/assets/408bb574-0d70-4d06-9f20-ace73f1bae4f" />


# OneClip

**The One Clip to Rule Them All**

A media processing CLI that wraps ffmpeg into ergonomic commands for cutting, compressing, transcribing, and editing video files.

## Features

- **Cut** video segments by start/end timestamps
- **Compress** video with configurable quality and speed presets (H.264)
- **Batch compress** multiple files at once
- **Transcribe** video/audio to SRT subtitles via whisper.cpp
- **Extract audio** tracks to WAV
- **Select or remove** specific audio tracks
- **Remove silence** from recordings automatically
- **Extract thumbnail frames** using scene detection or fixed intervals
- **Generate styled thumbnails** from images with text overlays
- **Join** two or more video files into one

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

### Recommended

Checks dependencies, then installs the CLI globally:

```bash
npx install-oneclip
```

### npm

```bash
npm install -g oneclip
```

### From source

```bash
git clone https://github.com/daymannovaes/the-one-clip.git
cd the-one-clip
npm install
npm link
```

The `oneclip` command is now available globally.

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
oneclip cut video.mkv --start 00:01:00 --end 00:05:00

# Compress a video
oneclip compress video.mkv
oneclip compress video.mkv --verygood --speed slow

# Batch compress multiple files
oneclip compress *.mkv

# Analyze folder for compression status
oneclip batch analyze ./recordings

# Auto-compress uncompressed files in a folder
oneclip batch compress ./recordings

# Generate subtitles (requires whisper.cpp)
oneclip transcript video.mkv

# Extract audio
oneclip extract-audio video.mkv

# Select a specific audio track
oneclip track video.mkv --track 2

# Remove an audio track
oneclip remove-track video.mkv --track 1

# Remove silent segments
oneclip silence-remove video.mkv --threshold -30dB --duration 0.5

# Extract thumbnail frames from video
oneclip thumbnail-frames video.mkv --count 5

# Generate a styled thumbnail from an image
oneclip thumbnail screenshot.png --title "My Video"

# Join multiple videos into one
oneclip join part1.mkv part2.mkv part3.mkv
```

All commands accept `-o <file>` to specify an output path. If omitted, outputs are named `<input>_<timestamp>.<ext>`.


## OBS Integration (macOS)

Auto-rename OBS recordings when they finish — a native macOS dialog pops up so you can title the file without switching to the terminal.

### Quick start

```bash
# Run manually (connects to OBS WebSocket and listens)
oneclip obs-renamer
```

### Auto-start on login (macOS)

Install as a macOS Launch Agent so it runs in the background automatically. It retries connecting to OBS every 30 seconds, so it works whether OBS is open or not.

```bash
# One-time setup
oneclip obs-renamer --install

# Check if running
oneclip obs-renamer --status

# Remove
oneclip obs-renamer --uninstall
```

Logs: `/tmp/obs-rename.log` (cleared on reboot).

### Requirements

- macOS
- Python 3
- OBS Studio with WebSocket server enabled
- `pip install -r obs/requirements.txt`

### Helper scripts

The `obs/` directory also contains scripts for controlling OBS Studio via WebSocket:

- `connect.py` — Connect and list available scenes
- `operations.py` — Programmatic recording control
- `example.py` / `c2.py` — Usage examples

## Architecture

```
bin/oneclip          # CLI entry point (Commander)
commands/            # One file per command
  cut.js
  compress.js
  compress-batch.js
  analyze.js
  extract-audio.js
  track.js
  remove-track.js
  transcript.js
  silence-remove.js
  thumbnail-frames.js
  thumbnail.js
  join.js
obs/                 # OBS WebSocket scripts (Python)
Dockerfile           # Docker image with ffmpeg + Node.js
docker-compose.yml
```

## License

MIT
