# Video Record Pipeline

Media processing CLI built with Node.js, zx, and commander.

## Available CLI Commands

All commands are invoked via `oneclip <command>`:

| Command | Description |
|---------|-------------|
| `oneclip cut <file>` | Cut video segment. Options: `--start`, `--end`, `-o` |
| `oneclip track <file>` | Select audio track. Options: `--track <n>`, `-o` |
| `oneclip remove-track <file>` | Remove audio track. Options: `--track <n>`, `-o` |
| `oneclip extract-audio <file>` | Extract audio to WAV. Options: `-o` |
| `oneclip transcript <file>` | Generate SRT via whisper.cpp. Options: `-o`, `-w`, `-m` |
| `oneclip compress <file>` | Compress video (H.264). Options: `--verygood`, `--speed`, `-o` |
| `oneclip compress-batch <files...>` | Batch compress multiple files |
| `oneclip batch analyze <folder>` | Analyze folder for compression status |
| `oneclip batch compress <folder>` | Analyze + auto-compress uncompressed files |
| `oneclip silence-remove <file>` | Remove silent segments. Options: `--threshold`, `--duration`, `-o` |
| `oneclip thumbnail <file>` | Extract thumbnails. Options: `--count`, `--interval`, `--scene-threshold`, `--output-dir` |
| `oneclip obs-renamer` | Listen for OBS recordings and rename via macOS popup. Options: `--install`, `--uninstall`, `--status` |

## Environment Requirements

- **ffmpeg** and **ffprobe** must be in PATH
- **whisper.cpp** for transcription: default path `~/workspace/whisper.cpp/main`
- **GGML model**: set `$GGML_AI_MODELS_PATH` env var, or pass `--ggmlModelPath`

## Project Structure

```
bin/oneclip        # CLI entry point (commander setup)
commands/          # One file per command
package.json       # Dependencies: commander, zx
```

## Rules for Claude

- When running media commands, use the full `oneclip` CLI — do not call ffmpeg directly unless debugging
- Output files should follow the existing naming convention: `<input>_<timestamp>.<ext>`
- Always check that input files exist before running commands
- When generating transcripts, the command handles WAV conversion automatically
- SRT files are the standard transcript format in this project
