#!/bin/bash

DIR="$( cd "$( dirname "$0" )" >/dev/null && pwd )"
echo $DIR

# Function to display usage information
usage() {
  echo "Usage: $0 -i <input_video.mkv> -o <output_srt>"
  exit 1
}

# Parse command line arguments
while getopts ":i:s:o:" opt; do
  case $opt in
    i) input_video="$OPTARG"
    ;;
    o) output_srt="$OPTARG"
    ;;
    \?) echo "Invalid option -$OPTARG" >&2
        usage
    ;;
    :) echo "Option -$OPTARG requires an argument." >&2
       usage
    ;;
  esac
done

# Check if input video, and output video are provided
if [ -z "$input_video" ] || [ -z "$output_srt" ]; then
  usage
fi

timestamp=$(date +%s)
tmp_filename=tmp-$timestamp

mkdir -p dist

sh $DIR/1-video-to-audio.sh -i $input_video -o dist/$tmp_filename.wav
sh $DIR/2-audio-to-srt.sh -i dist/$tmp_filename.wav -o $output_srt

timetook=$(($(date +%s)-$timestamp))

echo "subtitles generated to $output_srt in $timetook seconds"
