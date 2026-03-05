import fs from 'fs';
import path from 'path';
import os from 'os';
import { compressCommand } from './compress.js';

function getOutputFile(inputFile, opts = {}, ext = null) {
  if (opts?.output) return opts.output;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const inputExt = ext || inputFile.split('.').pop();
  return `${inputFile.slice(0, -inputExt.length-1)}_${timestamp}.${inputExt}`;
}


export async function compressBatchCommand(files, opts = {}) {
  const defaults = {
    threads: Math.max(1, Math.floor(os.cpus().length / 2)),
    nice: true,
  };
  const mergedOpts = { ...defaults, ...opts };

  console.log(`Compressing ${files.length} files (threads: ${mergedOpts.threads}, nice: ${mergedOpts.nice})...`);

  for (const file of files) {
    try {
      // Check if file exists
      if (!fs.existsSync(file)) {
        console.error(`File not found: ${file}`);
        continue;
      }

      console.log(`\nCompressing ${file}...`);

      // Get the directory and filename
      const dir = path.dirname(file);
      const filename = path.basename(file);

      // Run compression
      await compressCommand(file, {
        output: getOutputFile(file),
        speed: 'slow',
        ...mergedOpts,
      });

      // If compression was successful, rename the original file
      const newName = path.join(dir, `__to_delete-${filename}`);
      fs.renameSync(file, newName);
      console.log(`Original file renamed to: ${newName}`);


    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}
