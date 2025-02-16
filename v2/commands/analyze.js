import fs from 'fs';
import path from 'path';
import { $ } from 'zx';

// Expected size in MB per minute of video
// const EXPECTED_SIZE_PER_MINUTE = 8; // Medium quality video
const EXPECTED_SIZE_PER_MINUTE = 6; // Low quality video
const MB = 1024 * 1024; // 1 MB in bytes

async function getDuration(filePath) {
    try {
        // Using ffprobe to get duration
        const result = await $`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
        return parseFloat(result.toString());
    } catch (error) {
        console.error(`Error getting duration for ${filePath}:`, error.message);
        return 0;
    }
}

function isVideoCompressed({ sizeInMB, durationInMinutes }) {
  const expectedSize = durationInMinutes * EXPECTED_SIZE_PER_MINUTE;
  return sizeInMB <= expectedSize;
}

async function analyzeVideo(filePath) {
    try {
        const stats = fs.statSync(filePath);
        const sizeInMB = stats.size / MB;
        const durationInSeconds = await getDuration(filePath);
        const durationInMinutes = durationInSeconds / 60;

        const expectedSize = durationInMinutes * EXPECTED_SIZE_PER_MINUTE;
        const isCompressed = isVideoCompressed({ sizeInMB, durationInMinutes });

        return {
            file: path.basename(filePath),
            size: sizeInMB.toFixed(2) + ' MB',
            duration: durationInMinutes.toFixed(2) + ' minutes',
            expectedSize: expectedSize.toFixed(2) + ' MB',
            isCompressed,
        };
    } catch (error) {
        console.error(`Error analyzing ${filePath}:`, error.message);
        return null;
    }
}

export async function analyzeCommand(folderPath) {
    try {
        // Check if folder exists
        if (!fs.existsSync(folderPath)) {
            console.error(`Folder ${folderPath} does not exist`);
            return;
        }

        // Get all video files
        const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv'];
        const videoFiles = fs.readdirSync(folderPath)
            .filter(file => videoExtensions.includes(path.extname(file).toLowerCase()));

        if (videoFiles.length === 0) {
            console.log('No video files found in the specified folder');
            return;
        }

        // Analyze each video
        const results = videoFiles.map(file => {
            const filePath = path.join(folderPath, file);
            return analyzeVideo(filePath);
        });

        const filteredResults = (await Promise.all(results)).filter(result => result !== null);

        return filteredResults;

    } catch (error) {
        console.error('Error:', error.message);
    }
}
