# The lane flow

A lane is a fast path for a small ticket: `bug`, `tweak` or `chore`. A lane run has no
spec and no Spec approved gate. It is one session, from the ticket to a green pull
request. Each lane contract names what differs from this flow.

## Flow
1. `resolve-run.sh <ticket>`. Continue only on `RESULT: NONE`. On `RESULT: OK` the run
   exists: read `handoff.md` and continue from it.
2. Read the ticket (`rules/ticket.md`). If the work is larger than the lane permits,
   stop and say that the ticket needs `new`.
3. Start the run: `new-run.sh <ticket> --lane <lane>`, with the flags that
   `rules/ticket.md` asks for. It makes the branch, the run folder and the draft pull
   request.
4. Make the change on the run's branch. Read `.icm/project-rules.md` first.
5. Commit and push. Change the pull request to ready (`rules/github.md`).
6. `ci-status.sh <number> --watch`. On RED, correct the cause and push again.
7. Set `status.md` to `phase: release`. Write `handoff.md`, with the section How to test:
   1 to 3 short sentences that can be said aloud. Commit and push.
8. Show the gate card (`rules/gates.md`).
9. Stop with the stop report (`rules/output.md`). The operator's acts: test the change,
   tick **Ready to merge** on GitHub or on the HUD card, then say `release <ticket>`.

Release closes the run and merges it. A lane does not merge.
