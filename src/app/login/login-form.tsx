"use client";
import { type FormEvent, useActionState, useEffect, useState } from "react";
import { login } from "@/actions/auth";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/fields";
import type { ActionState } from "@/lib/action-state";

/** How the page was reached from a magic link: with a verifier, with an error, or not. */
export type LinkReturn = "verifier" | "error" | null;

export function LoginForm({ next, linkReturn }: { next: string; linkReturn: LinkReturn }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, undefined);
  return (
    <>
      <MagicLinkReturn next={next} linkReturn={linkReturn} />
      <form action={action} className="mt-6 space-y-3">
        <input type="hidden" name="next" value={next} />
        <Input name="email" type="email" placeholder="Email" autoFocus autoComplete="username" required />
        <Input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
        {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <MagicLinkForm next={next} />
    </>
  );
}

const NEUTRAL = "If that address has an account, a link is on its way. Open it in this browser.";

/** Safe in-site path to go to after sign-in. */
function safeNext(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

/**
 * Email a one-time sign-in link to any user. The request goes through /api/auth in the
 * browser (the SDK's supported flow). The reply is the same for every address, so the form
 * does not show which addresses have an account. Neon Auth does not let a link create one.
 */
function MagicLinkForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const address = email.trim().toLowerCase();
    if (!address) return setMessage({ ok: false, text: "Enter your email." });
    setPending(true);
    setMessage(null);
    try {
      const callbackURL = `${window.location.origin}/login?next=${encodeURIComponent(safeNext(next))}`;
      const { error } = await authClient.signIn.magicLink({ email: address, callbackURL });
      // A 4xx (an unknown address, for example) gets the neutral reply too.
      if (error && (!error.status || error.status >= 500)) {
        setMessage({ ok: false, text: "Could not send the link. Try again in a minute." });
      } else {
        setMessage({ ok: true, text: NEUTRAL });
      }
    } catch {
      setMessage({ ok: false, text: "Could not send the link. Try again in a minute." });
    } finally {
      setPending(false);
    }
  }

  return (
    <details className="mt-8 text-sm">
      <summary className="cursor-pointer text-muted">Email me a sign-in link</summary>
      <form onSubmit={onSubmit} className="mt-3 space-y-3">
        <Input
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {message ? <p className={message.ok ? "text-sm text-muted" : "text-sm text-danger"}>{message.text}</p> : null}
        <Button type="submit" variant="outline" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Email me a link"}
        </Button>
      </form>
    </details>
  );
}

/**
 * The magic link comes back here with a one-time verifier in the URL. The browser client
 * trades it for a session cookie through /api/auth, then the page goes on to `next`.
 */
function MagicLinkReturn({ next, linkReturn }: { next: string; linkReturn: LinkReturn }) {
  const [status, setStatus] = useState<"idle" | "signing-in" | "failed">(
    linkReturn === "error" ? "failed" : linkReturn === "verifier" ? "signing-in" : "idle",
  );

  useEffect(() => {
    if (linkReturn !== "verifier") return;
    authClient
      .getSession()
      .then(({ data }) => {
        if (data?.session) window.location.replace(safeNext(next));
        else setStatus("failed");
      })
      .catch(() => setStatus("failed"));
  }, [linkReturn, next]);

  if (status === "signing-in") return <p className="mt-6 text-sm text-muted">Signing you in…</p>;
  if (status === "failed") {
    return (
      <p className="mt-6 text-sm text-danger">
        That sign-in link did not work. It may be used or expired. Ask for a new link below.
      </p>
    );
  }
  return null;
}
