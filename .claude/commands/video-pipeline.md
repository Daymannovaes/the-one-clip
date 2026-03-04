You are orchestrating a full video production pipeline for the file: $ARGUMENTS

Run each step below in order. After each step, report what happened before moving on. If a step fails, stop and report the error.

## Step 1: Verify input

Check that the file exists. Run `ffprobe` to get duration, file size, and stream info. Report a summary.

## Step 2: Select audio track

Ask the user which audio track to keep (show available tracks from ffprobe). Then run:
```
media track <file> --track <N> -o <file>_track.mkv
```

If the file only has one audio track, skip this step.

## Step 3: Generate transcript

Run the transcript command on the (possibly track-selected) file:
```
media transcript <file> -o <basename>.srt
```

Read the generated SRT file and confirm it looks correct.

## Step 4: AI content generation

Using the SRT transcript you just read, generate:

1. **3 title/thumbnail text pairs** — for each option, generate a YouTube title (under 50 chars, front-load keywords, create curiosity, no ALL CAPS) paired with thumbnail text (3-5 words, ALL CAPS, complements but doesn't repeat the title, triggers emotion/curiosity). Format each as:
   > **Option N**
   > Title: `Your Title Here`
   > Thumbnail: `TEXT HERE`
2. **Video description** with timestamped chapters parsed from the SRT (group by topic, use HH:MM:SS format)
3.  **Linkedin post** – a concise post at Linkedin about the video to showcase myself. No hashtags.

Present these to the user for review.

## Step 5: Silence removal

Ask the user if they want to remove silent segments. If yes, run:
```
media silence-remove <file> -o <basename>_no-silence.mkv
```

Report how much time was saved.

## Step 6: Thumbnails

Generate thumbnail candidates:
```
media thumbnail <file> --count 8
```

View the generated thumbnail images. Recommend the best 2-3 based on visual quality, composition, and how well they'd work as video thumbnails (clear subjects, good lighting, interesting moments).

## Step 7: Compression (optional)

Ask the user if they want to compress the final video. If yes, ask about quality preference (good vs very good) and run:
```
media compress <file> -o <basename>_compressed.mkv
```

## Step 8: Summary

Present a final summary with:
- All output file paths and their sizes
- Recommended title/thumbnail text pairs (from step 4)
- Video description with chapters (from step 4)
- Recommended thumbnails (from step 6)
- Total processing stats (silence removed, compression ratio, etc.)
