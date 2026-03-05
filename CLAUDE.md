# Video Record Pipeline

Media processing CLI built with Node.js, zx, and commander.

## Available CLI Commands

All commands are invoked via `media <command>`:

| Command | Description |
|---------|-------------|
| `media cut <file>` | Cut video segment. Options: `--start`, `--end`, `-o` |
| `media track <file>` | Select audio track. Options: `--track <n>`, `-o` |
| `media remove-track <file>` | Remove audio track. Options: `--track <n>`, `-o` |
| `media extract-audio <file>` | Extract audio to WAV. Options: `-o` |
| `media transcript <file>` | Generate SRT via whisper.cpp. Options: `-o`, `-w`, `-m` |
| `media compress <file>` | Compress video (H.264). Options: `--verygood`, `--speed`, `-o` |
| `media compress-batch <files...>` | Batch compress multiple files |
| `media silence-remove <file>` | Remove silent segments. Options: `--threshold`, `--duration`, `-o` |
| `media thumbnail <file>` | Extract thumbnails. Options: `--count`, `--interval`, `--scene-threshold`, `--output-dir` |
| `media obs-renamer` | Listen for OBS recordings and rename via macOS popup. Options: `--install`, `--uninstall`, `--status` |

## Environment Requirements

- **ffmpeg** and **ffprobe** must be in PATH
- **whisper.cpp** for transcription: default path `~/workspace/whisper.cpp/main`
- **GGML model**: set `$GGML_AI_MODELS_PATH` env var, or pass `--ggmlModelPath`

## Project Structure

```
bin/media          # CLI entry point (commander setup)
commands/          # One file per command
package.json       # Dependencies: commander, zx
```

## Rules for Claude

- When running media commands, use the full `media` CLI — do not call ffmpeg directly unless debugging
- Output files should follow the existing naming convention: `<input>_<timestamp>.<ext>`
- Always check that input files exist before running commands
- When generating transcripts, the command handles WAV conversion automatically
- SRT files are the standard transcript format in this project
