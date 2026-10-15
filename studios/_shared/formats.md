# Formats — what the app parses

Every file is markdown with a YAML-ish frontmatter: `---`, then `key: value` lines, then
`---`. Values are single-line strings; booleans are `true` / `false`; dates are
`YYYY-MM-DD`. Unknown keys are ignored. Filenames are the identity: lowercase, hyphens,
no spaces.

## Lesson — `content/lessons/<date>-<slug>.md`

```markdown
---
title: First evening with the host family
date: 2026-10-20
status: draft            # draft (teacher only) → scheduled (student sees it) → done
summary: Introductions, the house, food, and the questions you will be asked.
---

## Teacher notes
Only the teacher sees this section: aims, timing, what to listen for.

## Slide: Welcome
A heading and a few lines of markdown. Tables, lists and bold all work.

## Exercise: Could I…?
Optional instructions, one short paragraph.

```items
I ___ (not / eat) meat, but I love fish. => don't eat || present simple
? You want to use the shower. | Can I shower? | Could I take a shower? | I shower now. => 2
```
```

Sections are `## ` headings: `Teacher notes`, `Slide: <title>`, `Exercise: <title>`.
Anything before the first `## ` is ignored. Order is presentation order.

**Exercise items**, one per line inside the fenced `items` block:

- Gap-fill: `prompt with ___ => answer`. Alternatives with `/`: `=> went / did go`.
  A hint after `||`: `=> has lived || present perfect`.
- Multiple choice: `? prompt | option | option | option => N` where N is the 1-based
  number of the correct option.
- Lines starting with `#` are comments.

The app keys each block by its kind and title (`exercise:could-i`), so renaming an
exercise after the student has answered it orphans those answers. Rename before, not after.

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
