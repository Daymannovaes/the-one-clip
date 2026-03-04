import { $ } from 'zx';
import path from 'path';
import { extractAudioCommand } from './extract-audio.js';
import os from 'os';

export const transcriptCommand = async (inputFile, opts) => {
    const { output } = opts;

    if (!inputFile || !output) {
        throw new Error('Input audio and output SRT paths are required');
    }

    const whisperPath = opts.whisperPath || `${os.homedir()}/workspace/whisper.cpp/main`;
    const modelPath = opts.ggmlModelPath || `${process.env.GGML_AI_MODELS_PATH}/ggml-model-whisper-small.bin`;

    const startTime = Date.now();
    await $`${whisperPath} -m ${modelPath} -l auto -f ${inputFile} -osrt -of ${output}`;

    const timeTook = (Date.now() - startTime) / 1000;
    console.log(`Srt extracted to ${output} in ${timeTook} seconds`);
};

export const safelyTranscriptCommand = async (inputFile, opts) => {
    const inputExt = path.extname(inputFile).toLowerCase();

    if (inputExt === '.wav') {
        return transcriptCommand(inputFile, opts);
    }

    console.log(`Input file format "${inputExt}" is not WAV. Converting to WAV format first...`);

    // Create temp wav file
    const tmpDir = os.tmpdir();
    const tmpWav = path.join(tmpDir, `${path.basename(inputFile, inputExt)}_${Date.now()}.wav`);

    // Extract audio to wav
    await extractAudioCommand(inputFile, { output: tmpWav, frequency: 16000 });

    // Generate transcript from wav
    await transcriptCommand(tmpWav, opts);
};

