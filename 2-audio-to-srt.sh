#!/bin/bash

DIR="$( cd "$( dirname "$0" )" >/dev/null && pwd )"
echo $DIR

# Function to display usage information
usage() {
  echo "Usage: $0 -i <input-audio> -o <output-srt> (output without extension)"
  exit 1
}

# Parse command line arguments
while getopts ":i:o:" opt; do
  case $opt in
    i) input_audio="$OPTARG"
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

# Check if both input and output arguments are provided
if [ -z "$input_audio" ] || [ -z "$output_srt" ]; then
  usage
fi
timestamp=$(date +%s)
# Run the ffmpeg command
# ../whisper.cpp/main -m /Users/daymannovaes/workspace/whisper.cpp/models/ggml-base.en.bin -f $input_audio -osrt -of $output_srt
# ../whisper.cpp/main -m $GGML_AI_MODELS_PATH/ggml-large.bin -l auto -f $input_audio -osrt -of $output_srt
$DIR/../whisper.cpp/main -m $GGML_AI_MODELS_PATH/ggml-model-whisper-small.bin -l auto -f $input_audio -osrt -of $output_srt

timetook=$(($(date +%s)-$timestamp))

echo "Srt extracted to $output_srt in $timetook seconds"

