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

  if (!output) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const inputExt = inputFile.split('.').pop();
    output = `${inputFile.slice(0, -inputExt.length-1)}_${timestamp}.${inputExt}`;
  }

  if (!start || !output || !inputFile) {
    console.error('Error: Missing required options: --start, --output, --input');
    process.exit(1);
  }

  try {
    if (end) {
      console.log(`Cutting "${inputFile}" from ${start} to ${end}...`);
      await $`ffmpeg -y -i ${inputFile} -ss ${start} -to ${end} -c copy ${output}`;
    } else {
      console.log(`Cutting "${inputFile}" from ${start}...`);
      await $`ffmpeg -y -i ${inputFile} -ss ${start} -c copy ${output}`;
    }
    console.log(`Successfully created "${output}".`);
  } catch (error) {
    console.error('Failed to cut video:', error);
    process.exit(1);
  }
}
