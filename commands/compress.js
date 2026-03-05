import { $ } from 'zx';
import { statSync } from 'fs';

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

  if (opts.speed && !['fast', 'slow'].includes(opts.speed)) {
    console.error(`Error: Invalid speed "${opts.speed}". Options: fast, slow`);
    process.exit(1);
  }

  if (opts.codec && !['h264', 'h265'].includes(opts.codec)) {
    console.error(`Error: Invalid codec "${opts.codec}". Options: h264, h265`);
    process.exit(1);
  }

  try {
    console.log(`Compressing "${inputFile}" to reduce size...`);

    // Use FFmpeg to re-encode video and audio with lower bitrates
    // ref https://trac.ffmpeg.org/wiki/Encode/H.264
    // ref https://trac.ffmpeg.org/wiki/Encode/H.265
    // crf 28 is very good. crf 51 is horrible. With crf 34 you can notice low quality, but it's reasonable
    // preset ultrafast and medium give 2x differences of output.
    const codecName = opts.codec === 'h264' ? 'h264' : 'h265';
    const codec = codecName === 'h264' ? 'libx264' : 'libx265';
    const crf = opts.verygood ? 28 : 34;
    const speed = opts.speed === 'slow' ? 'medium' : 'ultrafast';
    const quality = opts.verygood ? 'verygood' : 'good';
    const tagArgs = codec === 'libx265' ? ['-tag:v', 'hvc1'] : [];

    const startTime = Date.now();

    await $`ffmpeg -y -i ${inputFile} \
      -vcodec ${codec} -preset ${speed} -crf ${crf} \
      ${tagArgs} \
      -acodec aac -b:a 128k -ar 44100 \
      -movflags +faststart \
      ${output}`;

    const elapsed = Date.now() - startTime;
    const inputSize = statSync(inputFile).size;
    const outputSize = statSync(output).size;

    const formatBytes = (bytes) => {
      if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
      return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    };

    const formatTime = (ms) => {
      const totalSec = Math.floor(ms / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);

    console.log(`\n--- Compression Summary ---`);
    console.log(`Options:  codec=${codecName}, crf=${crf}, speed=${speed}, quality=${quality}`);
    console.log(`Input:    ${formatBytes(inputSize)}`);
    console.log(`Output:   ${formatBytes(outputSize)}  (${reduction}% reduction)`);
    console.log(`Time:     ${formatTime(elapsed)}`);
  } catch (error) {
    console.error('Failed to compress video:', error);
    process.exit(1);
  }
}
