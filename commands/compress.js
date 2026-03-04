import { $ } from 'zx';

/**
 * Compress video and audio to the minimum necessary size while maintaining watchable and audible quality.
 *
 * @param {string} inputFile - The input video file path.
 * @param {object} opts - Options object { output }.
 */
export async function compressCommand(inputFile, opts) {
  const { output } = opts;
  if (!output) {
    console.error('Error: Missing required option: --output <file>');
    process.exit(1);
  }

  try {
    console.log(`Compressing "${inputFile}" to reduce size...`);

    // Use FFmpeg to re-encode video and audio with lower bitrates
    // ref https://trac.ffmpeg.org/wiki/Encode/H.264
    // crf 28 is very good. crf 51 is horrible. With crf 34 you can notice low quality, but it's reasonable
    // preset ultrafast and medium give 2x differences of output.
    const crf = opts.verygood ? 28 : 34;
    const speed = opts.speed === 'slow' ? 'medium' : 'ultrafast';

    await $`ffmpeg -y -i ${inputFile} \
      -vcodec libx264 -preset ${speed} -crf ${crf} \
      -acodec aac -b:a 128k -ar 44100 \
      ${output}`;

    console.log(`Successfully compressed to "${output}".`);
  } catch (error) {
    console.error('Failed to compress video:', error);
    process.exit(1);
  }
}
