You have an SRT transcript file at: $ARGUMENTS

Read the SRT file and generate:

## Video Titles + Thumbnail Text

Generate **3 title/thumbnail text pairs**. Title and thumbnail serve different purposes and should complement each other:

### Title guidelines
- Under 50 characters (60 max)
- Front-load keywords for SEO
- Create curiosity or promise value
- Match search intent — what would someone type to find this?
- No ALL CAPS

### Thumbnail text guidelines
- 3-5 words max
- ALL CAPS
- Complement the title — do NOT repeat the same words
- Trigger emotion or curiosity
- Must be readable at tiny sizes (think mobile feed)

### Output format

> **Option 1**
> Title: `Your Specific Title Here`
> Thumbnail: `WHY THIS MATTERS`
>
> **Option 2**
> Title: `Another Title Approach`
> Thumbnail: `DON'T MISS THIS`
>
> **Option 3**
> Title: `Third Angle on the Topic`
> Thumbnail: `GAME CHANGER`

## Video Description

Write a video description that includes:

1. **Summary paragraph** — 2-3 sentences describing the video content
2. **Timestamped chapters** — Parse the SRT to identify topic changes and create chapters in this format:
   ```
   00:00 - Introduction
   02:15 - [Topic from transcript]
   05:30 - [Next topic]
   ```
   Use HH:MM or HH:MM:SS format. Group related subtitle entries into logical chapter sections.
3. **Tags** — Suggest 5-10 relevant tags/keywords based on the transcript content
