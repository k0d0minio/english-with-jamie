# Router — english-with-jamie

Language: en

The folder `.icm/_system/` belongs to the blueprint. Do not edit a file in it. If a file in
it is wrong, tell the operator. All other files in `.icm/` belong to this repo.

## Commands
A command is a word and one ticket. A ticket is a stub path: `<epic>/<slug>` or `triage/<slug>`.

| The operator says | Read and follow |
|---|---|
| A start word and a ticket | `.icm/_system/stages/define/CONTEXT.md` |
| `bug`, `tweak` or `chore` and a ticket | `.icm/_system/lanes/<lane>/CONTEXT.md` |
| `build` and a ticket | `.icm/_system/stages/build/CONTEXT.md` |
| `release` and a ticket | `.icm/_system/stages/release/CONTEXT.md` |
| `revise` and a ticket and a change | `.icm/_system/stages/define/CONTEXT.md`, section Revise |

Start words: `new`, `pick up`, `start work on`, and each phrase in
`.icm/_system/rules/triggers.txt`. The intent decides, not the exact word: words that mean
"start work on this ticket now" are start words. A question about a ticket is not a
command. If the intent is not clear, ask one question.

The hook `route-request` prints a line `[icm-router] Route:` when it finds a command. Follow
that line. If `.icm/local/ROUTES.md` exists, read it for the routes of this repo only.

## Rules for each stage and lane
1. Read the contract. Then read only the files that its Inputs name.
2. First act: `.icm/_system/scripts/resolve-run.sh <ticket>`. Obey its `RESULT:` line.
3. A run writes in `.icm/runs/<id>/` and in the product code, on its own branch. It
   does not write in another run's folder.
4. Never tick a gate box. Read `.icm/_system/rules/gates.md`.
5. Do not run a local build, test, lint or format command. CI is the source of truth.
   Read it with `.icm/_system/scripts/ci-status.sh`.
6. Write a finding that is not part of the ticket in `.icm/runs/<id>/findings.md`.
7. End each session with the stop report of `.icm/_system/rules/output.md`.
8. Write the documents of a run in the language at the top of this file.

## One home for each fact
| Fact | Home |
|---|---|
| Ticket rules and the intake folder | `.icm/_system/rules/ticket.md` |
| Gates | `.icm/_system/rules/gates.md` |
| Git and GitHub | `.icm/_system/rules/github.md` |
| The run folder | `.icm/_system/rules/run.md` |
| What a session says in chat | `.icm/_system/rules/output.md` |
| Values of this repo | `.icm/project.json` |
| Rules of this repo | `.icm/project-rules.md` |
| Addresses | `.icm/environments.md` |
