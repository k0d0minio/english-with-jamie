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

- CI green at d18f52a.
- Local dev server: the form posts to `/api/auth/sign-in/magic-link` (200) and shows the
  neutral reply. A return URL with a verifier makes the browser call
  `/api/auth/get-session?neon_auth_session_verifier=…`.
- Vercel preview (`vercel curl`, it has Vercel Authentication): `/api/auth/get-session`
  with an `ml-` verifier reaches Neon Auth and gets `VERIFICATION_NOT_FOUND`, not a
  challenge-cookie refusal, so a real verifier is accepted without the cookie. `/login`
  has no "Teacher" label. `/login?error=INVALID_TOKEN` shows the "did not work" message.
- Upstream, checked by hand: `get-session` with a non-`ml-` verifier and no cookie gives
  `SESSION_CHALLENGE_COOKIE_NOT_FOUND`; with an `ml-` verifier it looks the verifier up.
- Not verified end to end: no test inbox can be read, so no real link was opened.
- The preview cannot send a link: its host is not a Neon Auth trusted origin.

## Next action

The operator merges (`release triage/magic-link-all-users`), then tests on the live site.
`TEACHER_EMAIL` is not read any more; the Vercel env var can stay or be removed.

## How to test

On the live site, open "Email me a sign-in link", enter your address, and open the newest
email's link in the same browser one time: you land signed in. Ask for a new link each
time, because each link works once and for 15 minutes.

## Blockers

- none

## Do not touch

- none
