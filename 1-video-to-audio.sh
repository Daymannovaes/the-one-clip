#!/bin/bash

DIR="$( cd "$( dirname "$0" )" >/dev/null && pwd )"
echo $DIR

# Function to display usage information
usage() {
  echo "Usage: $0 -i <input_video> -o <output_audio>"
  exit 1
}

# Parse command line arguments
while getopts ":i:o:" opt; do
  case $opt in
    i) input_video="$OPTARG"
    ;;
    o) output_audio="$OPTARG"
    ;;
    \?) echo "Invalid option -$OPTARG" >&2
        usage
    ;;
    :) echo "Option -$OPTARG requires an argument." >&2
       usage
    ;;
  esac
done

# Check if both input and output arguments are provided
if [ -z "$input_video" ] || [ -z "$output_audio" ]; then
  usage
fi

# Run the ffmpeg command
ffmpeg -i "$input_video" -ac 1 -ar 16000 -q:a 0 "$output_audio" -y

echo "Audio extracted to $output_audio"

