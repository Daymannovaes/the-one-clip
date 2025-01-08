#!/bin/bash

DIR="$( cd "$( dirname "$0" )" >/dev/null && pwd )"
echo $DIR

# Function to display usage information
usage() {
  echo "Usage: $0 -i <input_video.mkv> -o <output_video.mkv>"
  exit 1
}

# Parse command line arguments
while getopts ":i:s:o:" opt; do
  case $opt in
    i) input_video="$OPTARG"
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

# Check if input video, and output video are provided
if [ -z "$input_video" ] || [ -z "$output_video" ]; then
  usage
fi

timestamp=$(date +%s)
tmp_filename=tmp-$timestamp

sh $DIR/1-video-to-audio.sh -i $input_video -o dist/$tmp_filename.wav
sh $DIR/2-audio-to-srt.sh -i dist/$tmp_filename.wav -o dist/$tmp_filename
sh $DIR/3-add-srt-in-video.sh -i $input_video -s dist/$tmp_filename.srt -o $output_video

timetook=$(($(date +%s)-$timestamp))

echo "Video rendered with subtitles to $output_video in $timetook seconds"
