import { $ } from 'zx';
import path from 'path';
import fs from 'fs';
import os from 'os';
import readline from 'readline';
import { extractAudioCommand } from './extract-audio.js';

// Portuguese filler patterns with confidence levels
const FILLER_PATTERNS = [
  // HIGH confidence — almost always fillers
  { pattern: /^[aá]h+n?$/i, label: 'hesitation', confidence: 'HIGH' },
  { pattern: /^[uú]h+m?$/i, label: 'hesitation', confidence: 'HIGH' },
  { pattern: /^[eé]h+$/i, label: 'hesitation', confidence: 'HIGH' },
  { pattern: /^hm+$/i, label: 'hesitation', confidence: 'HIGH' },
  { pattern: /^né\??$/i, label: 'filler', confidence: 'HIGH' },
  { pattern: /^tá\??$/i, label: 'filler', confidence: 'HIGH' },
  { pattern: /^entendeu\??$/i, label: 'filler', confidence: 'HIGH' },
  { pattern: /^sabe\??$/i, label: 'filler', confidence: 'HIGH' },

  // MEDIUM confidence — often fillers but context-dependent
  { pattern: /^tipo$/i, label: 'filler', confidence: 'MEDIUM' },
  { pattern: /^assim$/i, label: 'filler', confidence: 'MEDIUM' },
  { pattern: /^enfim$/i, label: 'filler', confidence: 'MEDIUM' },
  { pattern: /^e\.{2,}$/i, label: 'hesitation', confidence: 'MEDIUM' },
  { pattern: /^então$/i, label: 'filler', confidence: 'MEDIUM' },

  // LOW confidence — sometimes fillers, sometimes meaningful
  { pattern: /^basicamente$/i, label: 'vice', confidence: 'LOW' },
  { pattern: /^literalmente$/i, label: 'vice', confidence: 'LOW' },
  { pattern: /^na verdade$/i, label: 'vice', confidence: 'LOW' },
];

/**
 * Parse SRT content into an array of cues.
 * Each cue: { index, startTime, endTime, text, startSeconds, endSeconds }
 */
function parseSrt(srtContent) {
  const cues = [];
  const blocks = srtContent.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    const index = parseInt(lines[0], 10);
    const timeMatch = lines[1].match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    );
    if (!timeMatch) continue;

    const startSeconds = toSeconds(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
    const endSeconds = toSeconds(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);
    const text = lines.slice(2).join(' ').trim();

    cues.push({ index, startTime: lines[1].split('-->')[0].trim(), endTime: lines[1].split('-->')[1].trim(), text, startSeconds, endSeconds });
  }

  return cues;
}

function toSeconds(h, m, s, ms) {
  return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 1000;
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  const ms = Math.round((seconds % 1) * 1000).toString().padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

/**
 * Detect filler words from SRT cues.
 * Returns array of { cue, pattern, confidence, label }
 */
function detectFillers(cues) {
  const fillers = [];

  for (const cue of cues) {
    // Clean text: remove punctuation at edges, trim
    const cleaned = cue.text.replace(/^["\s]+|["\s]+$/g, '').replace(/[.,!?]+$/g, '').trim();
    if (!cleaned) continue;

    for (const p of FILLER_PATTERNS) {
      if (p.pattern.test(cleaned)) {
        fillers.push({ cue, pattern: p.pattern.source, confidence: p.confidence, label: p.label });
        break;
      }
    }
  }

  return fillers;
}

/**
 * Ask user for confirmation via stdin.
 */
function askConfirmation(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

/**
 * Build keep-segments by inverting filler timestamps.
 * Padding (in seconds) shrinks filler regions to avoid clipping adjacent words.
 */
function buildKeepSegments(fillers, totalDuration, paddingMs) {
  const padding = paddingMs / 1000;

  // Sort fillers by start time
  const sorted = [...fillers].sort((a, b) => a.cue.startSeconds - b.cue.startSeconds);

  // Build filler regions with padding applied
  const fillerRegions = sorted.map(f => ({
    start: Math.max(0, f.cue.startSeconds + padding),
    end: Math.max(0, f.cue.endSeconds - padding),
  })).filter(r => r.start < r.end); // Drop if padding collapsed the region

  if (fillerRegions.length === 0) return [{ start: 0, end: totalDuration }];

  // Invert filler regions into keep segments
  const segments = [];
  let pos = 0;

  for (const region of fillerRegions) {
    if (region.start > pos) {
      segments.push({ start: pos, end: region.start });
    }
    pos = region.end;
  }

  if (pos < totalDuration) {
    segments.push({ start: pos, end: totalDuration });
  }

  return segments;
}

/**
 * Remove filler words from a video.
 *
 * 1. Extract audio → WAV 16kHz
 * 2. Transcribe with word-level granularity (--max-len 1)
 * 3. Parse SRT, detect fillers
 * 4. Show findings, ask for confirmation
 * 5. Build keep-segments and execute ffmpeg filtergraph
 */
export async function fillerRemoveCommand(inputFile, opts) {
  const { output } = opts;
  const language = opts.language || 'pt';
  const paddingMs = parseInt(opts.padding || '100', 10);
  const isDryRun = !!opts.dryRun;
  const isAuto = !!opts.auto;

  if (!output) {
    console.error('Error: Missing required option: --output <file>');
    process.exit(1);
  }

  try {
    // Step 1: Extract audio to temp WAV (16kHz mono for whisper.cpp)
    const tmpDir = os.tmpdir();
    const baseName = path.basename(inputFile, path.extname(inputFile));
    const tmpWav = path.join(tmpDir, `${baseName}_filler_${Date.now()}.wav`);

    console.log('Step 1/5: Extracting audio...');
    await extractAudioCommand(inputFile, { output: tmpWav, frequency: 16000 });

    // Step 2: Transcribe with word-level SRT
    const whisperPath = opts.whisperPath || `${os.homedir()}/workspace/whisper.cpp/main`;
    const modelPath = opts.ggmlModelPath || `${process.env.GGML_AI_MODELS_PATH}/ggml-model-whisper-small.bin`;
    const tmpSrtBase = path.join(tmpDir, `${baseName}_filler_${Date.now()}`);

    console.log(`Step 2/5: Transcribing with word-level granularity (language: ${language})...`);
    await $`${whisperPath} -m ${modelPath} -l ${language} -f ${tmpWav} --max-len 1 -osrt -of ${tmpSrtBase}`;

    const srtFile = `${tmpSrtBase}.srt`;
    if (!fs.existsSync(srtFile)) {
      console.error(`Error: SRT file not generated at ${srtFile}`);
      process.exit(1);
    }

    // Step 3: Parse SRT and detect fillers
    console.log('Step 3/5: Analyzing transcript for filler words...');
    const srtContent = fs.readFileSync(srtFile, 'utf-8');
    const cues = parseSrt(srtContent);
    const fillers = detectFillers(cues);

    if (fillers.length === 0) {
      console.log('No filler words detected. Nothing to remove.');
      // Cleanup temp files
      fs.unlinkSync(tmpWav);
      fs.unlinkSync(srtFile);
      return;
    }

    // Step 4: Display findings
    console.log(`\nFound ${fillers.length} filler word(s):\n`);
    console.log('  #  | Confidence | Time              | Word        | Type');
    console.log('-----|------------|-------------------|-------------|----------');

    for (let i = 0; i < fillers.length; i++) {
      const f = fillers[i];
      const num = String(i + 1).padStart(3);
      const conf = f.confidence.padEnd(10);
      const time = `${formatTime(f.cue.startSeconds)} → ${formatTime(f.cue.endSeconds)}`;
      const word = f.cue.text.padEnd(11);
      console.log(`  ${num} | ${conf} | ${time} | ${word} | ${f.label}`);
    }

    const totalFillerTime = fillers.reduce((sum, f) => sum + (f.cue.endSeconds - f.cue.startSeconds), 0);
    console.log(`\nTotal filler time: ${totalFillerTime.toFixed(1)}s`);

    if (isDryRun) {
      console.log('\n--dry-run mode: no cuts made.');
      fs.unlinkSync(tmpWav);
      fs.unlinkSync(srtFile);
      return;
    }

    // Step 5: Confirmation
    let selectedFillers = fillers;

    if (!isAuto) {
      console.log('\nOptions:');
      console.log('  [a] Remove ALL detected fillers');
      console.log('  [h] Remove only HIGH confidence');
      console.log('  [m] Remove HIGH + MEDIUM confidence');
      console.log('  [n] Cancel');
      const answer = await askConfirmation('\nChoice [a/h/m/n]: ');

      if (answer === 'n' || answer === 'no') {
        console.log('Cancelled.');
        fs.unlinkSync(tmpWav);
        fs.unlinkSync(srtFile);
        return;
      } else if (answer === 'h') {
        selectedFillers = fillers.filter(f => f.confidence === 'HIGH');
      } else if (answer === 'm') {
        selectedFillers = fillers.filter(f => f.confidence === 'HIGH' || f.confidence === 'MEDIUM');
      }
      // 'a' or default: use all fillers
    } else {
      // Auto mode: remove HIGH + MEDIUM
      selectedFillers = fillers.filter(f => f.confidence === 'HIGH' || f.confidence === 'MEDIUM');
    }

    if (selectedFillers.length === 0) {
      console.log('No fillers selected for removal.');
      fs.unlinkSync(tmpWav);
      fs.unlinkSync(srtFile);
      return;
    }

    console.log(`\nStep 5/5: Removing ${selectedFillers.length} filler(s) (padding: ${paddingMs}ms)...`);

    // Get total duration
    const probeResult = await $`ffprobe -v error -show_entries format=duration -of csv=p=0 ${inputFile}`;
    const totalDuration = parseFloat(probeResult.stdout.trim());

    // Build keep segments
    const segments = buildKeepSegments(selectedFillers, totalDuration, paddingMs);

    if (segments.length === 0) {
      console.log('No segments to keep. Entire file would be removed.');
      fs.unlinkSync(tmpWav);
      fs.unlinkSync(srtFile);
      return;
    }

    // Build ffmpeg filtergraph (same pattern as silence-remove)
    const filterParts = [];
    const concatInputs = [];

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      filterParts.push(`[0:v]trim=start=${seg.start}:end=${seg.end},setpts=PTS-STARTPTS[v${i}]`);
      filterParts.push(`[0:a]atrim=start=${seg.start}:end=${seg.end},asetpts=PTS-STARTPTS[a${i}]`);
      concatInputs.push(`[v${i}][a${i}]`);
    }

    filterParts.push(`${concatInputs.join('')}concat=n=${segments.length}:v=1:a=1[outv][outa]`);
    const filterComplex = filterParts.join(';\n');

    await $`ffmpeg -y -i ${inputFile} -filter_complex ${filterComplex} -map [outv] -map [outa] ${output}`;

    // Report
    const outProbe = await $`ffprobe -v error -show_entries format=duration -of csv=p=0 ${output}`;
    const outDuration = parseFloat(outProbe.stdout.trim());
    const saved = totalDuration - outDuration;

    console.log(`\nSuccessfully created "${output}".`);
    console.log(`Original: ${totalDuration.toFixed(1)}s → Output: ${outDuration.toFixed(1)}s (removed ${saved.toFixed(1)}s of fillers)`);

    // Cleanup temp files
    fs.unlinkSync(tmpWav);
    fs.unlinkSync(srtFile);
  } catch (error) {
    console.error('Failed to remove fillers:', error);
    process.exit(1);
  }
}
