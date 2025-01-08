import { $ } from 'zx';

/**
 * Extract audio from a video file using ffmpeg.
 *
 * @param {string} inputFile
 * @param {object} opts - { output }
 */
export async function extractAudioCommand(inputFile, opts) {
  const { output } = opts;
  if (!output) {
    console.error('Error: Missing required option: --output <file>');
    process.exit(1);
  }

  try {
    console.log(`Extracting audio from "${inputFile}"...`);
    // -vn means "disable video recording"; -c:a copy just copies audio
    await $`ffmpeg -y -i ${inputFile} -vn -c:a copy ${output}`;
    console.log(`Audio extracted successfully to "${output}".`);
  } catch (error) {
    console.error('Failed to extract audio:', error);
    process.exit(1);
  }
}
