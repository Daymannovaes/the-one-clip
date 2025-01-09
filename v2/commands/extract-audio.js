import { $ } from 'zx';

/**
 * Extract audio from a video file using ffmpeg.
 *
 * @param {string} inputFile
 * @param {object} opts - { output, frequency }
 */
export async function extractAudioCommand(inputFile, opts) {
  const { output, frequency } = opts;
  if (!output) {
    console.error('Error: Missing required option: --output <file>');
    process.exit(1);
  }

  try {
    console.log(`Extracting audio from "${inputFile}"...`);
    // -ac is the number of audio channels
    // -ar sets the audio sampling frequency in Hz (for whisper.cpp, it MUST be 16000)
    if (frequency) {
      await $`ffmpeg -i ${inputFile} -ac 1 -ar ${frequency} ${output} -y`;
    } else {
      await $`ffmpeg -i ${inputFile} -ac 1 ${output} -y`;
    }
    console.log(`Audio extracted successfully to "${output}".`);
  } catch (error) {
    console.error('Failed to extract audio:', error);
    process.exit(1);
  }
}
