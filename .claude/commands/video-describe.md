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
2. **Timestamped chapters** — Parse the SRT to create dense, navigable chapters following these rules:

   **Density**: Target 1 chapter every 1.5–3 minutes. Never let a single chapter span more than 4 minutes. Scaling guide:
   - ~10 min video → 5–8 chapters
   - ~20 min video → 8–12 chapters
   - ~30 min video → 12–18 chapters

   **Boundary detection**: Split at any of these transitions — don't wait for a "big" topic change:
   - New concept or subtopic introduced
   - Demo, walkthrough, or code shown on screen
   - Tool, file, or context switch
   - Question asked or answered
   - Tangent, aside, or story begins
   - Recap, summary, or wrap-up starts
   - When in doubt, **split** — more chapters are always better than fewer

   **Title rules**:
   - 25–40 characters per title
   - Front-load keywords (most important word first)
   - No filler: never use "Introduction", "Conclusion", "Overview", "Part 1", "Main Content", "Getting Started"
   - Each title should work as a standalone search query — be specific about what happens in that segment

   **Format**:
   - First chapter **must** be `0:00`
   - Use `M:SS` for videos under 10 min, `MM:SS` for 10–59 min, `H:MM:SS` for 1h+
   - Timestamps must reference actual SRT cue times — do not round or estimate
   - Use ` - ` (space-dash-space) as separator

   **Example** (~10 min video):
   ```
   0:00 - Why default configs fail
   1:12 - ESLint flat config setup
   2:45 - Adding TypeScript rules
   4:03 - Prettier integration pitfalls
   5:30 - Custom rule for import order
   7:18 - Testing the config on a real project
   9:02 - CI pipeline linting step
   ```
3. **Tags** — Suggest 5-10 relevant tags/keywords based on the transcript content
