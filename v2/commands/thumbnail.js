import { $ } from 'zx';
import path from 'path';
import fs from 'fs';

/**
 * Extract thumbnail frames from a video.
 *
 * Default mode: scene detection using select='gt(scene,threshold)'.
 * Interval mode: extract at regular intervals using fps filter.
 *
 * @param {string} inputFile - The input video file path
 * @param {object} opts - { count, interval, sceneThreshold, outputDir }
 */
export async function thumbnailCommand(inputFile, opts) {
  const count = parseInt(opts.count || '5', 10);
  const sceneThreshold = opts.sceneThreshold || '0.3';
  const useInterval = !!opts.interval;

  // Determine output directory
  const baseName = path.basename(inputFile, path.extname(inputFile));
  const outputDir = opts.outputDir || path.join(path.dirname(inputFile), `${baseName}_thumbnails`);

  fs.mkdirSync(outputDir, { recursive: true });

  try {
    if (useInterval) {
      // Get video duration to calculate interval
      const probeResult = await $`ffprobe -v error -show_entries format=duration -of csv=p=0 ${inputFile}`;
      const duration = parseFloat(probeResult.stdout.trim());
      const fps = count / duration;

      console.log(`Extracting ${count} thumbnails at regular intervals from "${inputFile}"...`);

      const outputPattern = path.join(outputDir, 'thumb_%04d.jpg');
      const vf = `fps=${fps},format=yuvj420p`;
      await $`ffmpeg -y -i ${inputFile} -vf ${vf} -frames:v ${count} -q:v 2 ${outputPattern}`;
    } else {
      // Scene detection mode — extract more candidates then pick top N
      console.log(`Extracting up to ${count} thumbnails via scene detection (threshold: ${sceneThreshold}) from "${inputFile}"...`);

      // Extract scene-change frames (may produce more or fewer than count)
      const outputPattern = path.join(outputDir, 'thumb_%04d.jpg');
      const vf = `select=gt(scene\\,${sceneThreshold}),format=yuvj420p`;
      await $`ffmpeg -y -i ${inputFile} -vf ${vf} -vsync vfr -frames:v ${count} -q:v 2 ${outputPattern}`;
    }

    // Report what was created
    const files = fs.readdirSync(outputDir)
      .filter(f => f.startsWith('thumb_') && f.endsWith('.jpg'))
      .sort();

    if (files.length === 0) {
      console.log('No thumbnails were generated. Try lowering --scene-threshold or using --interval mode.');
    } else {
      console.log(`Created ${files.length} thumbnail(s) in "${outputDir}":`);
      files.forEach(f => console.log(`  ${f}`));
    }
  } catch (error) {
    console.error('Failed to extract thumbnails:', error);
    process.exit(1);
  }
}
