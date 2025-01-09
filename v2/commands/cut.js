import { $ } from 'zx';

/**
 * Cut a portion of a video using ffmpeg.
 *
 * @param {string} inputFile - The input video file path
 * @param {object} opts - The CLI options (start, end, output)
 */
export async function cutCommand(inputFile, opts) {
  let { start, end, output } = opts;

  if (!start && !end) {
    console.error('Error: Missing required options: --start or --end');
    process.exit(1);
  }

  if (!start) start = '00:00:00';

  if (!start || !output || !inputFile) {
    console.error('Error: Missing required options: --start, --output, --input');
    process.exit(1);
  }

  try {
    if (end) {
      console.log(`Cutting "${inputFile}" from ${start} to ${end}...`);
      await $`ffmpeg -y -i ${inputFile} -ss ${start} -to ${end} -codec copy ${output}`;
    } else {
      console.log(`Cutting "${inputFile}" from ${start}...`);
      await $`ffmpeg -y -i ${inputFile} -ss ${start} -codec copy ${output}`;
    }
    console.log(`Successfully created "${output}".`);
  } catch (error) {
    console.error('Failed to cut video:', error);
    process.exit(1);
  }
}
