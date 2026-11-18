"use client";
import { useActionState } from "react";
import { login, sendMagicLink } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/fields";
import type { ActionState } from "@/lib/action-state";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, undefined);
  return (
    <>
      <form action={action} className="mt-6 space-y-3">
        <input type="hidden" name="next" value={next} />
        <Input name="email" type="email" placeholder="Email" autoFocus autoComplete="username" required />
        <Input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
        {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <MagicLinkForm />
    </>
  );
}

/** Teacher only: email a sign-in link instead of typing a password. */
function MagicLinkForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(sendMagicLink, undefined);
  return (
    <details className="mt-8 text-sm">
      <summary className="cursor-pointer text-muted">Teacher: email me a sign-in link</summary>
      <form action={action} className="mt-3 space-y-3">
        <Input name="email" type="email" placeholder="Teacher email" autoComplete="username" required />
        {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
        {state?.ok ? <p className="text-sm text-muted">{state.message}</p> : null}
        <Button type="submit" variant="outline" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Email me a link"}
        </Button>
      </form>
    </details>
  );
}
