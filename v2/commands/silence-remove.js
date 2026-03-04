import { $ } from 'zx';

/**
 * Remove silent segments from a video.
 *
 * Pass 1: Run ffmpeg silencedetect to find silent segments.
 * Pass 2: Re-encode non-silent segments via a single-pass complex filtergraph.
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

    // Merge short segments to avoid rapid-fire cuts
    const minSegment = parseFloat(opts.minSegment || '3');
    let merged = segments;

    if (minSegment > 0 && segments.length > 1) {
      merged = [{ ...segments[0] }];
      for (let i = 1; i < segments.length; i++) {
        const last = merged[merged.length - 1];
        if ((last.end - last.start) < minSegment) {
          // Extend last segment to include the gap + this segment
          last.end = segments[i].end;
        } else {
          merged.push({ ...segments[i] });
        }
      }

      // Also merge if the final segment is too short (merge backward)
      if (merged.length > 1) {
        const last = merged[merged.length - 1];
        if ((last.end - last.start) < minSegment) {
          merged[merged.length - 2].end = last.end;
          merged.pop();
        }
      }

      if (merged.length < segments.length) {
        console.log(`Merged short segments: ${segments.length} → ${merged.length} segments (min: ${minSegment}s)`);
      }
    }

    console.log(`Extracting ${merged.length} non-silent segment(s) via filtergraph...`);

    // Pass 2: Single-pass complex filtergraph with trim/atrim + concat
    const filterParts = [];
    const concatInputs = [];

    for (let i = 0; i < merged.length; i++) {
      const seg = merged[i];
      filterParts.push(`[0:v]trim=start=${seg.start}:end=${seg.end},setpts=PTS-STARTPTS[v${i}]`);
      filterParts.push(`[0:a]atrim=start=${seg.start}:end=${seg.end},asetpts=PTS-STARTPTS[a${i}]`);
      concatInputs.push(`[v${i}][a${i}]`);
    }

    filterParts.push(`${concatInputs.join('')}concat=n=${merged.length}:v=1:a=1[outv][outa]`);
    const filterComplex = filterParts.join(';\n');

    await $`ffmpeg -y -i ${inputFile} -filter_complex ${filterComplex} -map [outv] -map [outa] ${output}`;

    // Report time saved
    const outProbe = await $`ffprobe -v error -show_entries format=duration -of csv=p=0 ${output}`;
    const outDuration = parseFloat(outProbe.stdout.trim());
    const saved = totalDuration - outDuration;

    console.log(`Successfully created "${output}".`);
    console.log(`Original: ${totalDuration.toFixed(1)}s → Output: ${outDuration.toFixed(1)}s (removed ${saved.toFixed(1)}s of silence)`);
  } catch (error) {
    console.error('Failed to remove silence:', error);
    process.exit(1);
  }
}
