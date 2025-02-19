#!/bin/bash

# Function to display usage information
usage() {
  echo "Usage: $0 -i <input_video.mkv> -s <subtitle_file.srt> -o <output_video.mkv>"
  exit 1
}

# Parse command line arguments
while getopts ":i:s:o:" opt; do
  case $opt in
    i) input_video="$OPTARG"
    ;;
    s) subtitle_file="$OPTARG"
    ;;
    o) output_video="$OPTARG"
    ;;
    \?) echo "Invalid option -$OPTARG" >&2
        usage
    ;;
    :) echo "Option -$OPTARG requires an argument." >&2
       usage
    ;;
  esac
done

# Check if input video, subtitle file, and output video are provided
if [ -z "$input_video" ] || [ -z "$subtitle_file" ] || [ -z "$output_video" ]; then
  usage
fi

# Run the HandBrakeCLI command
HandBrakeCLI --preset "Very Fast 1080p30" -i "$input_video" -o "$output_video" --srt-file "$subtitle_file" --srt-burn

echo "Video rendered with subtitles to $output_video"
