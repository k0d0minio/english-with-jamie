"use client";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createAccount } from "@/actions/accounts";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/fields";
import type { ActionState } from "@/lib/action-state";

export function NewAccountForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(createAccount, undefined);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) {
      toast.success("Account created");
      form.current?.reset();
    }
  }, [state]);
  return (
    <form ref={form} action={action} className="space-y-3">
      <Field label="Name">
        <Input name="name" required autoComplete="off" />
      </Field>
      <Field label="Email">
        <Input name="email" type="email" required autoComplete="off" />
      </Field>
      <Field label="Password" hint="At least 8 characters. Share it with them yourself.">
        <Input name="password" type="text" required minLength={8} autoComplete="new-password" spellCheck={false} />
      </Field>
      <Field label="Role">
        <Select name="role" defaultValue="student">
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </Select>
      </Field>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
