# Magic link sign-in works, for every user

- complexity: standard
- lane: bug

## Problem

A sign-in link from "Email me a link" arrives, but when the user opens it the site shows
"invalid token". The admin account has no password, so the magic link is the only way in.
Also, the link is sent only to the address in `TEACHER_EMAIL`. Jamie decided in chat on
2026-11-26: "the magic link must work for every user in the database, not only the
teacher". Neon Auth has `magic_link.disable_sign_up: true`, so an unknown address cannot
make an account.

## Acceptance criteria

- [ ] A user who requests a link, then opens it in the same browser, is signed in.
- [ ] Every user in the database can request a link. `sendMagicLink` has no `TEACHER_EMAIL` gate.
- [ ] The login form has no "Teacher" labels on the magic-link part.
- [ ] The reply is the same for every address: "If that address has an account, a link is on its way".
