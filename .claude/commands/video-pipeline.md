You are orchestrating a full video production pipeline for the file: $ARGUMENTS

Run each step below in order. After each step, report what happened before moving on. If a step fails, stop and report the error.

## Step 1: Verify input

Check that the file exists. Run `ffprobe` to get duration, file size, and stream info. Report a summary.

## Step 2: Select audio track

Ask the user which audio track to keep (show available tracks from ffprobe). Then run:
```
npx oneclip track <file> --track <N> -o <file>_track.mkv
```

If the file only has one audio track, skip this step.

## Step 3: Generate transcript

Run the transcript command on the (possibly track-selected) file:
```
npx oneclip transcript <file> -o <basename>.srt
```

Read the generated SRT file and confirm it looks correct.

## Step 4: AI content generation

Using the SRT transcript you just read, generate:

1. **3 title/thumbnail text pairs** — for each option, generate a YouTube title (under 50 chars, front-load keywords, create curiosity, no ALL CAPS) paired with thumbnail text (3-5 words, ALL CAPS, complements but doesn't repeat the title, triggers emotion/curiosity). Format each as:
   > **Option N**
   > Title: `Your Title Here`
   > Thumbnail: `TEXT HERE`
2. **Video description** with timestamped chapters parsed from the SRT, following these rules:
   - **Density**: 1 chapter every 1.5–3 min, never exceed 4 min per chapter (~5-8 per 10 min, ~8-12 per 20 min, ~12-18 per 30 min)
   - **Split at**: new concept, demo/code shown, tool switch, question, tangent, recap — when in doubt, split
   - **Titles**: 25–40 chars, front-load keywords, no filler ("Introduction", "Conclusion", "Part 1"), each title should work as a search query
   - **Format**: first chapter must be `0:00`, use `M:SS`/`MM:SS`/`H:MM:SS` based on video length, timestamps from actual SRT cues (no rounding)
3.  **Linkedin post** – a concise post at Linkedin about the video to showcase myself. No hashtags.

Present these to the user for review.

Then **prompt the user to choose** which of the 3 title/thumbnail options they want (using AskUserQuestion). Store the chosen title and thumbnail text for use in the thumbnail styling step (Step 6).

## Step 5: Silence removal

Ask the user if they want to remove silent segments. If yes, run:
```
npx oneclip silence-remove <file> -o <basename>_no-silence.mkv
```

Report how much time was saved.

## Step 6: Thumbnails

**Stage 1 — Extract frames from the video:**
```
npx oneclip thumbnail-frames <file> --count 8
```

View the generated frames. Recommend the best 2-3 based on visual quality, composition, and how well they'd work as video thumbnails (clear subjects, good lighting, interesting moments).

**Stage 2 — Generate styled thumbnails using the chosen thumbnail text from Step 4:**
```
npx oneclip thumbnail <best-frame.jpg> --title "TEXT HERE" --template all
```

Run this for each of the recommended frames.

**Note on yellow words:** Wrapping a word in `*asterisks*` in the title makes it render in yellow. For example, `--title "JUNIORS ARE *COOKED*?"` renders "JUNIORS ARE" in white and "COOKED?" in yellow. Use this to emphasize the most impactful word in the thumbnail text.

## Step 7: Summary

Present a final summary with:
- All output file paths and their sizes
- Recommended title/thumbnail text pairs (from step 4)
- Video description with chapters (from step 4)
- Recommended thumbnails (from step 6)
- Total processing stats (silence removed, etc.)
