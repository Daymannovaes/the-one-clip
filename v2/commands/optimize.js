import { $ } from 'zx';

/**
 * Optimize a video by re-encoding the audio track with AAC codec while keeping video untouched.
 *
 * @param {string} inputFile
 * @param {object} opts - { output }
 */
export async function optimizeCommand(inputFile, opts) {
  const { output } = opts;
  if (!output) {
    console.error('Error: Missing required option: --output <file>');
    process.exit(1);
  }

  try {
    console.log(`Optimizing "${inputFile}"...`);
    await $`ffmpeg -y -i ${inputFile} -codec:v copy -codec:a aac -b:a 192k ${output}`;
    console.log(`Successfully optimized to "${output}".`);
  } catch (error) {
    console.error('Failed to optimize video:', error);
    process.exit(1);
  }
}
