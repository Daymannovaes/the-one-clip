import { $ } from 'zx';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * Remove silent segments from a video.
 *
 * Pass 1: Run ffmpeg silencedetect to find silent segments.
 * Pass 2: Extract non-silent segments with -c copy, then concatenate.
 *
 * @param {string} inputFile - The input video file path
 * @param {object} opts - { threshold, duration, output }
 */
export async function silenceRemoveCommand(inputFile, opts) {
  const { output } = opts;
  const threshold = opts.threshold || '-30dB';
  const duration = opts.duration || '0.5';

  if (!output) {
    console.error('Error: Missing required option: --output <file>');
    process.exit(1);
  }

  try {
    // Pass 1: Detect silent segments
    console.log(`Detecting silence in "${inputFile}" (threshold: ${threshold}, min duration: ${duration}s)...`);

    const result = await $`ffmpeg -i ${inputFile} -af silencedetect=noise=${threshold}:d=${duration} -f null - 2>&1`.nothrow();
    const stderr = result.stdout + result.stderr;

    // Parse silence start/end times from ffmpeg output
    const silenceStarts = [];
    const silenceEnds = [];

    for (const line of stderr.split('\n')) {
      const startMatch = line.match(/silence_start:\s*([\d.]+)/);
      const endMatch = line.match(/silence_end:\s*([\d.]+)/);
      if (startMatch) silenceStarts.push(parseFloat(startMatch[1]));
      if (endMatch) silenceEnds.push(parseFloat(endMatch[1]));
    }

    if (silenceStarts.length === 0) {
      console.log('No silence detected. Copying file as-is.');
      await $`cp ${inputFile} ${output}`;
      return;
    }

    console.log(`Found ${silenceStarts.length} silent segment(s).`);

    // Build non-silent segments
    // Get total duration via ffprobe
    const probeResult = await $`ffprobe -v error -show_entries format=duration -of csv=p=0 ${inputFile}`;
    const totalDuration = parseFloat(probeResult.stdout.trim());

    const segments = [];
    let pos = 0;

    for (let i = 0; i < silenceStarts.length; i++) {
      if (silenceStarts[i] > pos) {
        segments.push({ start: pos, end: silenceStarts[i] });
      }
      pos = silenceEnds[i] !== undefined ? silenceEnds[i] : totalDuration;
    }

    // Add trailing segment after last silence
    if (pos < totalDuration) {
      segments.push({ start: pos, end: totalDuration });
    }

    if (segments.length === 0) {
      console.log('Entire file is silent. Nothing to output.');
      return;
    }

    console.log(`Extracting ${segments.length} non-silent segment(s)...`);

    // Pass 2: Extract segments to temp files
    const tmpDir = path.join(os.tmpdir(), `silence-remove-${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    const segmentFiles = [];

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const segFile = path.join(tmpDir, `seg_${String(i).padStart(4, '0')}.ts`);
      segmentFiles.push(segFile);

      await $`ffmpeg -y -i ${inputFile} -ss ${seg.start} -to ${seg.end} -c copy -avoid_negative_ts make_zero ${segFile}`;
    }

    // Create concat file list
    const concatFile = path.join(tmpDir, 'concat.txt');
    const concatContent = segmentFiles.map(f => `file '${f}'`).join('\n');
    fs.writeFileSync(concatFile, concatContent);

    // Concatenate segments
    console.log('Concatenating segments...');
    await $`ffmpeg -y -f concat -safe 0 -i ${concatFile} -c copy ${output}`;

    // Report time saved
    const outProbe = await $`ffprobe -v error -show_entries format=duration -of csv=p=0 ${output}`;
    const outDuration = parseFloat(outProbe.stdout.trim());
    const saved = totalDuration - outDuration;

    console.log(`Successfully created "${output}".`);
    console.log(`Original: ${totalDuration.toFixed(1)}s → Output: ${outDuration.toFixed(1)}s (removed ${saved.toFixed(1)}s of silence)`);

    // Cleanup temp files
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Failed to remove silence:', error);
    process.exit(1);
  }
}
