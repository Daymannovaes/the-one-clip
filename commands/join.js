import { $ } from 'zx';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync, unlinkSync } from 'fs';

/**
 * Join two or more video files using ffmpeg concat demuxer.
 *
 * @param {string[]} files - The input video file paths
 * @param {object} opts - The CLI options (output)
 */
export async function joinCommand(files, opts) {
  const { output } = opts;

  if (files.length < 2) {
    console.error('Error: At least two files are required to join.');
    process.exit(1);
  }

  const listFile = join(tmpdir(), `concat_${Date.now()}.txt`);

  try {
    const listContent = files.map(f => `file '${f}'`).join('\n');
    writeFileSync(listFile, listContent);

    console.log(`Joining ${files.length} files into "${output}"...`);
    await $`ffmpeg -y -f concat -safe 0 -i ${listFile} -codec copy ${output}`;
    console.log(`Successfully created "${output}".`);
  } catch (error) {
    console.error('Failed to join videos:', error);
    process.exit(1);
  } finally {
    try { unlinkSync(listFile); } catch {}
  }
}
