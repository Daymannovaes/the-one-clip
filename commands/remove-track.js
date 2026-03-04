import { $ } from 'zx';

/**
 * Choose a specific audio track (1-based) from a video using ffmpeg.
 *
 * @param {string} inputFile
 * @param {object} opts - { track, output }
 */
export async function removeTrackCommand(inputFile, opts) {
  const { track, output } = opts;
  if (!track || !output) {
    console.error('Error: Missing required options: --track <number>, --output <file>');
    process.exit(1);
  }

  // Convert 1-based track to 0-based index for ffmpeg
  const ffmpegTrackIndex = track - 1;

  try {
    console.log(`Removing track #${track} from "${inputFile}"...`);
    await $`ffmpeg -y -i ${inputFile} -map 0:v -map 0:a -map -0:a:${ffmpegTrackIndex} -c copy ${output}`;
    console.log(`Successfully created "${output}" without track #${track}.`);
  } catch (error) {
    console.error('Failed to remove audio track:', error);
    process.exit(1);
  }
}
