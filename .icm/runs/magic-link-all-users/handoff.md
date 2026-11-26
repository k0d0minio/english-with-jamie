# Handoff magic-link-all-users

## Cause

Neon Auth verifies the link and returns to the site with an `ml-` verifier, but the SDK
middleware trades a verifier for a session only when a `session_challenge` cookie is
present, and magic-link sign-in never sets that cookie (neondatabase/neon-js#285), so the
user landed on `/login` signed out; a second click then gave `INVALID_TOKEN`, because a
link works one time only.

Evidence (2026-11-26): `neon_auth.session` has a session for the admin at 16:06:24 and
`neon_auth.verification` has an `ml-` verifier at the same time that was never used.
Upstream `GET /get-session?neon_auth_session_verifier=ml-…` needs no challenge cookie.

## Correction

- `src/app/api/auth/[...path]/route.ts`: the SDK handler, public in `src/proxy.ts`.
- `src/app/login/login-form.tsx`: the browser client sends the link (`callbackURL` is
  `/login?next=…`). On return, `authClient.getSession()` trades the verifier for a session
  cookie through `/api/auth`, then the page goes to `next`. A used or expired link shows a
  message.
- `src/actions/auth.ts`: `sendMagicLink` removed, with its `TEACHER_EMAIL` gate. Any user
  can ask for a link. The reply is the same for every address. Neon Auth has
  `disable_sign_up: true`, so a link cannot make an account.
- `TEACHER_EMAIL` is not read any more. The Vercel env var can stay or go.

## Verified

- Local dev server: the form posts to `/api/auth/sign-in/magic-link` (200) and shows the
  neutral reply. A return URL with a verifier calls `/api/auth/get-session?neon_auth_session_verifier=…`
  through the proxy. A bad verifier shows the "did not work" message.
- Not verified end to end: no test inbox can be read, so no real link was opened.
- The Vercel preview cannot send a link: its host is not a Neon Auth trusted origin.

## Next action

The operator tests on production after the merge, or on localhost.

## How to test

On the live site, open "Email me a sign-in link", enter your address, and open the newest
email's link in the same browser one time: you land signed in. Ask for a new link each
time, because each link works once and for 15 minutes.

## Blockers

- none

## Do not touch

- none
