# Formats — what the app parses

Every file is markdown with a YAML-ish frontmatter: `---`, then `key: value` lines, then
`---`. Values are single-line strings; booleans are `true` / `false`; dates are
`YYYY-MM-DD`. Unknown keys are ignored. Filenames are the identity: lowercase, hyphens,
no spaces.

## Lesson — `content/lessons/<date>-<slug>.md`

````markdown
---
title: First evening with the host family
date: 2026-10-20
status: draft            # draft (teacher only) → scheduled (student sees it) → done
summary: Introductions, the house, food, and the questions you will be asked.
---

## Teacher notes
Only the teacher sees this section: the aim, and what to listen for across the lesson.

## Slide: Welcome
@art: maple
@kicker: Lesson one
A heading and a few lines of markdown. Tables, lists and bold all work.

### Teacher
- **Time:** 3 min.
- **Say:** "…"
- **Ask:** "…"

## Exercise: Could I…?
Optional instructions, one short paragraph.

```items
I ___ (not / eat) meat, but I love fish. => don't eat || present simple
? You want to use the shower. | Can I shower? | Could I take a shower? | I shower now. => 2
```

### Teacher
- **How:** …
````

Sections are `## ` headings: `Teacher notes`, `Slide: <title>`, `Exercise: <title>`.
Anything before the first `## ` is ignored. Order is presentation order.

**Inside a slide or exercise section:**

- **`@key: value` lines** come first, before the body. They set the look; all optional.
  - `@layout:` one of `cover` · `split` · `cards` · `talk` · `plain`.
    If it's left out, the first slide is `cover`, a slide with `@art` is `split`, anything
    else is `plain`.
  - `@art:` one illustration from the library below. Exercises get `quiz` by default.
  - `@kicker:` the small label above the slide (default: the lesson title; `talk`
    slides say "Your turn"). Use it for the part a slide belongs to: `Part 2 · Parliament Hill`.
  - `@stat:` one big figure shown above the title: a year, a distance, a count
    (`1916`, `7.8 km`, `100+ years`). Story slides should have one.
- **`### Teacher`** starts the private part: everything after it, up to the next `## `,
  is shown to the teacher beside that slide (live and on the lesson page) and never sent
  to the student. Use bullets with bold labels: **Time**, **Say**, **Ask**, **Do**,
  **Listen for**.

**Layouts**, the same in every lesson:

| Layout | Use it for | Body |
|---|---|---|
| `cover` | The first slide, what she'll be able to do | A line, then three bullets |
| `split` | Telling a story or explaining, with a picture | Up to five bullets or short paragraphs |
| `cards` | A set of facts, prompts or options | Bullets; each becomes a card, a bold opening is its headline |
| `talk` | The speaking task at the end | Two short paragraphs |
| `plain` | Tables and phrase lists that need the width | Anything |

**Art library** (animated, in `src/components/slide-art.tsx`):

| Group | Names |
|---|---|
| General, any lesson | `maple` (falling leaves) · `chat` (speech bubbles) · `quiz` (question cards) · `lakes` (a loon at dusk) |
| Ottawa | `parliament` · `canal` (skater on the ice) · `tulips` · `locks` (a boat rising in a canal lock) · `logs` (a raftsman on the river) · `raft` (a timber slide) · `bell` (a swinging bell and embers) · `dino` (a dinosaur outside a museum) · `cat` (a cat and its house) · `flag` (a flag and a queue) · `camera` (an old camera and a cigar) · `secret` (a stamped folder) · `bunker` (floors underground) · `tree` (planting a tree) · `castle` (a château at dusk) · `pastry` (a BeaverTail) · `coin` (a spinning gold coin) · `spider` (a giant spider sculpture) · `cow` (a farm in the city) · `trophy` (a silver cup on the ice) |

A lesson that needs something new asks for a drawing to be added to the library; it is
then there for every later lesson. Aim for a different drawing on every story slide.

**Exercise items**, one per line inside the fenced `items` block. Mix the kinds:

| Kind | Line | Notes |
|---|---|---|
| Gap-fill | `prompt with ___ => answer` | Alternatives with `/`: `=> went / did go`. A hint after `\|\|`: `=> has lived \|\| present perfect`. |
| Multiple choice | `? prompt \| option \| option \| option => N` | N is the 1-based number of the right option. Two options (`True \| Not true`) show as big side-by-side buttons. |
| Put in order | `^ prompt \| first \| second \| third` | Write the steps in the right order; the app shuffles them and she taps them back into order. |
| Match | `& prompt \| left = right \| left = right` | Write the right pairs; the app shuffles the right-hand side. |
| Poll | `* prompt \| option \| option` | An opinion: any pick counts, and the teacher sees which. The best way into a conversation. |

On every kind except gap-fill, `|| note` at the end of the line is shown once she has
answered: the story behind the answer, in a sentence. Lines starting with `#` are comments.

The app keys each block by its kind and title (`exercise:could-i`), so renaming an
exercise after the student has answered it orphans those answers. Rename before, not after.

## Form — `content/forms/<slug>.md`

Questions for a student. She answers on her profile; answers are stored in the database,
never in the file.

````markdown
---
title: Getting to know you
summary: A few questions so the lessons are about things you care about.
draft: true              # remove the line to make it sendable
---
Markdown before the first `## ` is the intro, shown at the top.

## Teacher notes
Only the teacher sees this: the purpose, and which lessons each section feeds.

## Things you love
An optional line of intro for the section.

```questions
long: What does a perfect free Saturday look like? || As much or as little as you like.
many: Which of these would you like a lesson about? | Music | Animals | Something else…
```
````

Sections are `## <title>`; each holds one fenced `questions` block, one question per line:

| Kind | Line | Shows |
|---|---|---|
| Short answer | `text: prompt` | One-line box |
| Long answer | `long: prompt` | Paragraph box |
| Pick one | `one: prompt \| option \| option` | Radio buttons |
| Pick any | `many: prompt \| option \| option` | Checkboxes |
| Scale | `scale: prompt \| low label \| high label` | 1 to 5, labels at the ends |

`|| help` at the end of any line is shown under the question. An option ending in `…`
(*Something else…*) gets a text box beside it. Every question is optional. Lines starting
with `#` are comments.

Answers are keyed by section title and question wording, so rewording a question after
it has been answered orphans that answer (the teacher still sees it, flagged). Reword
before sending, not after.

## Homework — `content/homework/<date>-<slug>.md`

```markdown
---
title: Three things you will say on night one
due: 2026-10-24
lesson: 2026-10-20-first-evening-with-the-host-family   # optional, the lesson's filename
draft: true              # remove the line to show it to the student
---
One paragraph: what to do, why, and what to bring to the next lesson.
```

## Recommendation — `content/recommendations/<slug>.md`

```markdown
---
title: Talk to yourself in English
tags: speaking, habit
draft: true
---
Jamie's advice, in Jamie's words, lightly edited.
```

## Watch — `content/watch/<slug>.md`

```markdown
---
title: Derry Girls
kind: series             # series | film
where: Netflix
level: stretch           # comfortable | stretch
draft: true
---
Why it is worth her time, in two or three sentences. What to listen for.
```

## Read — `content/read/<slug>.md`

```markdown
---
title: Why we say sorry so much
url: https://…
source: The Walrus
length: short            # short | medium | long
draft: true
---
Why, in two sentences.
```

## Reference — `content/reference/grammar/<slug>.md`

```markdown
---
title: Present perfect vs past simple
group: Verbs & time       # Verbs & time | Sentence building | Words & phrases
order: 2
blurb: The most common B2 slip. When the past is finished and when it still matters.
draft: true
---
The page body, under 600 words, headings from `##`.
```
