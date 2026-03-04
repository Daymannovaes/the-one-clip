import satori from 'satori';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { $ } from 'zx';

const WIDTH = 1280;
const HEIGHT = 720;

const FONT_CACHE_DIR = path.join(os.homedir(), '.cache', 'media-cli', 'fonts');
const FONT_FILENAME = 'Inter-Bold.ttf';
const FONT_ZIP_URL = 'https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip';
const FONT_ZIP_ENTRY = 'extras/ttf/Inter-Bold.ttf';

async function ensureFont(customFontPath) {
  if (customFontPath) {
    return fs.readFileSync(customFontPath);
  }

  const cachedPath = path.join(FONT_CACHE_DIR, FONT_FILENAME);
  if (fs.existsSync(cachedPath)) {
    return fs.readFileSync(cachedPath);
  }

  console.log('Downloading Inter Bold font...');
  fs.mkdirSync(FONT_CACHE_DIR, { recursive: true });

  // Download zip and extract just the Bold TTF
  const tmpZip = path.join(FONT_CACHE_DIR, 'inter.zip');
  await $`curl -fsSL -o ${tmpZip} ${FONT_ZIP_URL}`;
  await $`unzip -jo ${tmpZip} ${FONT_ZIP_ENTRY} -d ${FONT_CACHE_DIR}`;
  fs.unlinkSync(tmpZip);

  console.log(`Font cached at ${cachedPath}`);
  return fs.readFileSync(cachedPath);
}

async function loadImageAsBase64(imagePath) {
  const buffer = await sharp(imagePath)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 90 })
    .toBuffer();
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

// --- Templates ---

function classicTemplate(base64Img, title) {
  return {
    type: 'div',
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        position: 'relative',
      },
      children: [
        {
          type: 'img',
          props: {
            src: base64Img,
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              width: WIDTH,
              height: HEIGHT,
              objectFit: 'cover',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.85))',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '40px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    color: 'white',
                    fontSize: 56,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                    maxWidth: '90%',
                  },
                  children: title,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

function centeredTemplate(base64Img, title) {
  return {
    type: 'div',
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        position: 'relative',
      },
      children: [
        {
          type: 'img',
          props: {
            src: base64Img,
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              width: WIDTH,
              height: HEIGHT,
              objectFit: 'cover',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    color: 'white',
                    fontSize: 64,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    textAlign: 'center',
                    textShadow: '0 2px 12px rgba(0,0,0,0.7)',
                  },
                  children: title,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

function sidebarTemplate(base64Img, title) {
  return {
    type: 'div',
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        flexDirection: 'row',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              width: '40%',
              height: HEIGHT,
              backgroundColor: '#1a1a2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    color: 'white',
                    fontSize: 48,
                    fontWeight: 700,
                    lineHeight: 1.3,
                  },
                  children: title,
                },
              },
            ],
          },
        },
        {
          type: 'img',
          props: {
            src: base64Img,
            style: {
              width: '60%',
              height: HEIGHT,
              objectFit: 'cover',
            },
          },
        },
      ],
    },
  };
}

const TEMPLATES = {
  classic: classicTemplate,
  centered: centeredTemplate,
  sidebar: sidebarTemplate,
};

async function renderThumbnail(element, fontData, outputPath) {
  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: 'Inter',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
  });
  const pngBuffer = resvg.render().asPng();
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`  Created: ${outputPath}`);
}

function getOutputPath(inputFile, opts, templateName) {
  if (opts.output && templateName === undefined) {
    return opts.output;
  }
  const dir = path.dirname(inputFile);
  const baseName = path.basename(inputFile, path.extname(inputFile));
  const suffix = templateName ? `_${templateName}` : '';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(dir, `${baseName}${suffix}_${timestamp}.png`);
}

/**
 * Generate a styled YouTube thumbnail from an image + title.
 *
 * @param {string} imageFile - The input image file path
 * @param {object} opts - { title, template, font, output }
 */
export async function thumbnailCommand(imageFile, opts) {
  if (!fs.existsSync(imageFile)) {
    console.error(`Input file not found: ${imageFile}`);
    process.exit(1);
  }

  const title = opts.title;
  if (!title) {
    console.error('--title is required');
    process.exit(1);
  }

  const templateName = opts.template || 'classic';
  const fontData = await ensureFont(opts.font);
  const base64Img = await loadImageAsBase64(imageFile);

  console.log(`Generating thumbnail(s) from "${imageFile}"...`);

  if (templateName === 'all') {
    for (const [name, templateFn] of Object.entries(TEMPLATES)) {
      const element = templateFn(base64Img, title);
      const outputPath = getOutputPath(imageFile, opts, name);
      await renderThumbnail(element, fontData, outputPath);
    }
  } else {
    const templateFn = TEMPLATES[templateName];
    if (!templateFn) {
      console.error(`Unknown template: "${templateName}". Available: ${Object.keys(TEMPLATES).join(', ')}, all`);
      process.exit(1);
    }
    const element = templateFn(base64Img, title);
    const outputPath = opts.output || getOutputPath(imageFile, opts);
    await renderThumbnail(element, fontData, outputPath);
  }

  console.log('Done!');
}
