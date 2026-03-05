You are generating a pre-recording video script (roteiro) for: $ARGUMENTS

Run each step below in order. After each step, report what happened before moving on.

## Step 1: Understand the topic

**If `$ARGUMENTS` is provided** (has a topic/idea), use it as the seed topic and move to Step 2.

**If `$ARGUMENTS` is empty** (brainstorm mode):

1. Check if `.claude/data/roteiros-index.md` exists in the project root
2. If it does NOT exist, or if the user asks to refresh it:
   - Fetch the Notion parent page (ID: `0d985a3a-ba9f-4d9c-b292-faa68d416ac3`) using the Notion fetch tool
   - Extract only the child page titles (do NOT fetch each child page's content)
   - Create/update `.claude/data/roteiros-index.md` with a list of titles and one-line summaries inferred from the title
   - Format: `- [done] **Title** — one-line summary`
3. Read `.claude/data/roteiros-index.md` to understand what topics are already covered
4. Ask the user about their current interests, recent experiences, or audience questions
5. Suggest **5 fresh video ideas** that complement (don't duplicate) existing content
6. Wait for the user to pick one before proceeding

Optionally, research the chosen topic via web search to find: trending angles, YouTube competition, and content gaps.

## Step 2: Generate 3 angle options

Present 3 different angles/approaches for the video. Use AskUserQuestion to let the user pick. For each angle show:

- **Angle title** (working title)
- **Hook** — first 30 seconds, what grabs the viewer
- **Core promise** — what the viewer will learn or feel
- **Estimated duration** — short (5-8min), medium (10-15min), or long (20-30min)

Ask the user to pick one angle (or mix elements from multiple). Wait for their choice before proceeding.

## Step 3: Generate the script outline (roteiro)

Generate a bullet-point outline in **Portuguese (PT-BR)** matching this style:
- Conversational tone, first person
- Numbered main points with nested sub-points
- Placeholders for personal anecdotes: `[contar experiencia sobre X]`
- Placeholders for screen demos: `[mostrar codigo/tela: X]`
- References to support the points (links, data) when relevant

### Required structure:

1. **Gancho (Hook)** — opening lines to capture attention in the first 30 seconds
2. **Contexto** — why this matters, personal connection to the topic
3. **Pontos principais** — the meat of the video, 3-5 key sections with nested sub-points
4. **Exemplos praticos** — code demos, real stories, screen recordings to plan
5. **Fechamento** — call to action, summary, what the viewer should do next

Present the full outline and ask if the user wants any adjustments.

## Step 4: Pre-production metadata

Generate the following:

### Title/Thumbnail pairs

Generate **3 title/thumbnail text pairs** using the same format as `/video-describe`:

> **Option 1**
> Title: `Your Specific Title Here`
> Thumbnail: `TEXT HERE`
>
> **Option 2**
> Title: `Another Title Approach`
> Thumbnail: `DON'T MISS THIS`
>
> **Option 3**
> Title: `Third Angle on the Topic`
> Thumbnail: `GAME CHANGER`

**Title guidelines**: Under 50 chars, front-load keywords, create curiosity, no ALL CAPS.
**Thumbnail text guidelines**: 3-5 words, ALL CAPS, complement the title (don't repeat), trigger emotion/curiosity.

### Key talking points

List 3-5 key talking points the user should emphasize on camera (the moments that matter most).

### Estimated recording duration

Estimate based on script density at ~150 words/min speaking pace. Show the word count of the outline and the estimated recording time.

## Step 5: Save to Notion

Ask the user if they want to save the roteiro to Notion.

If **yes**:
1. Create a new child page under the "Longer Posts" parent page (ID: `0d985a3a-ba9f-4d9c-b292-faa68d416ac3`)
2. Page title: `Roteiro: <topic>`
3. Content: the full script outline from Step 3, formatted in Markdown
4. After saving, update `.claude/data/roteiros-index.md` with the new entry

If **no**, skip this step.

## Step 6: Summary

Present a final summary with:

- The complete script outline (from Step 3)
- Title/thumbnail options (from Step 4)
- Estimated recording duration (from Step 4)
- Whether it was saved to Notion
- **Next steps**: Record the video, then use `/video-pipeline <file>` for post-production (transcript, chapters, thumbnails, compression)
