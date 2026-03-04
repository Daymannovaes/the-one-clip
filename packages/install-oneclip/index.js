#!/usr/bin/env node

import { execSync } from "node:child_process";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

const PASS = `${GREEN}✓${RESET}`;
const FAIL = `${RED}✗${RESET}`;
const WARN = `${YELLOW}○${RESET}`;

function banner() {
  console.log();
  console.log(`${BOLD}${CYAN}  ┌─────────────────────────────┐${RESET}`);
  console.log(`${BOLD}${CYAN}  │     OneClip Installer        │${RESET}`);
  console.log(`${BOLD}${CYAN}  │     The One Clip to Rule     │${RESET}`);
  console.log(`${BOLD}${CYAN}  │        Them All              │${RESET}`);
  console.log(`${BOLD}${CYAN}  └─────────────────────────────┘${RESET}`);
  console.log();
}

function commandExists(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function getCommandVersion(cmd, flag = "--version") {
  try {
    return execSync(`${cmd} ${flag}`, { encoding: "utf-8" }).trim().split("\n")[0];
  } catch {
    return null;
  }
}

function checkNode() {
  const major = parseInt(process.versions.node.split(".")[0], 10);
  if (major >= 18) {
    console.log(`  ${PASS} Node.js ${process.versions.node} ${DIM}(>= 18 required)${RESET}`);
    return true;
  }
  console.log(`  ${FAIL} Node.js ${process.versions.node} ${RED}— version 18+ required${RESET}`);
  return false;
}

function checkFfmpeg() {
  if (commandExists("ffmpeg")) {
    const version = getCommandVersion("ffmpeg", "-version");
    const short = version ? version.split(" ").slice(0, 3).join(" ") : "found";
    console.log(`  ${PASS} ffmpeg ${DIM}(${short})${RESET}`);
    return true;
  }
  console.log(`  ${FAIL} ffmpeg ${RED}— not found in PATH${RESET}`);
  return false;
}

function checkFfprobe() {
  if (commandExists("ffprobe")) {
    console.log(`  ${PASS} ffprobe`);
    return true;
  }
  console.log(`  ${FAIL} ffprobe ${RED}— not found in PATH${RESET}`);
  return false;
}

function checkWhisper() {
  const defaultPath = `${process.env.HOME}/workspace/whisper.cpp/main`;
  const envPath = process.env.GGML_AI_MODELS_PATH;

  if (commandExists("whisper") || commandExists(defaultPath)) {
    console.log(`  ${PASS} whisper.cpp ${DIM}(optional — found)${RESET}`);
  } else if (envPath) {
    console.log(`  ${WARN} whisper.cpp ${DIM}(optional — GGML_AI_MODELS_PATH is set)${RESET}`);
  } else {
    console.log(`  ${WARN} whisper.cpp ${DIM}(optional — not found, needed for transcription)${RESET}`);
  }
}

function printInstallInstructions() {
  console.log();
  console.log(`${BOLD}  Install missing dependencies:${RESET}`);
  console.log();
  console.log(`  ${DIM}macOS:${RESET}     brew install ffmpeg`);
  console.log(`  ${DIM}Ubuntu:${RESET}    sudo apt install ffmpeg`);
  console.log(`  ${DIM}Windows:${RESET}   choco install ffmpeg`);
  console.log();
  console.log(`  ${DIM}Node.js:${RESET}   https://nodejs.org/`);
  console.log();
}

function install() {
  console.log();
  console.log(`  ${BOLD}Installing oneclip globally...${RESET}`);
  console.log();
  try {
    execSync("npm install -g oneclip", { stdio: "inherit" });
    console.log();
    console.log(`  ${GREEN}${BOLD}Done!${RESET} Run ${CYAN}oneclip --help${RESET} to get started.`);
    console.log();
  } catch {
    console.log();
    console.log(`  ${RED}Installation failed.${RESET} Try running manually:`);
    console.log(`  ${DIM}npm install -g oneclip${RESET}`);
    console.log();
    process.exit(1);
  }
}

// --- Main ---

banner();

console.log(`${BOLD}  Checking dependencies...${RESET}`);
console.log();

const nodeOk = checkNode();
const ffmpegOk = checkFfmpeg();
const ffprobeOk = checkFfprobe();
checkWhisper();

console.log();

if (nodeOk && ffmpegOk && ffprobeOk) {
  console.log(`  ${GREEN}${BOLD}All required dependencies found.${RESET}`);
  install();
} else {
  console.log(`  ${RED}${BOLD}Missing required dependencies.${RESET}`);
  printInstallInstructions();
  process.exit(1);
}
