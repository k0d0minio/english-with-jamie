# studios/reference — grammar & syntax pages

Entered when Jamie asks for a reference page to be written, extended or corrected. The
reference is a B2+ guide for one reader, not a textbook. Work from the repo root.

## Inputs

| Layer | File | Why |
|---|---|---|
| 3 | [`../_shared/learner.md`](../_shared/learner.md) | Which errors to foreground (French-shaped) |
| 3 | [`../_shared/voice.md`](../_shared/voice.md) | Examples before rules; under 600 words |
| 3 | [`../_shared/formats.md`](../_shared/formats.md) § Reference | File shape, groups |
| 4 | `intake/*.md` (if present) | Jamie's ask: which topic, what she got wrong, what to add |
| 4 | `content/reference/grammar/` — frontmatter only | The index: titles, groups, order; don't duplicate a topic |

## Process

1. **One page per topic.** If the ask is "fix", edit the existing file in place.
2. **Structure:** one-line hook that names the French-speaker trap; the rule in a
   sentence; a contrast table or example list; "what people actually say"; two or three
   common errors with corrections; a three-item practice prompt she can say aloud.
3. **Keep the index coherent:** `group` is one of the three in `formats.md`, `order`
   places the page within its group. New pages take the next number; don't renumber
   others.
4. **Save** with `draft: true` when the page is new; a fix to an existing published page
   keeps it published.

## Output

`content/reference/grammar/<slug>.md`.

## Gate (Jamie's)

- [ ] Jamie reads it in the app (Reference → Grammar) and removes `draft: true`.

## Done when

The page is saved, under 600 words, and appears in the right group in the app.
