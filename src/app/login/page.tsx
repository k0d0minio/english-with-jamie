import { redirect } from "next/navigation";
import { getRole } from "@/lib/auth";
import { LoginForm, type LinkReturn } from "./login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; neon_auth_session_verifier?: string }> }) {
  if (await getRole()) redirect("/");
  const { next, error, neon_auth_session_verifier } = await searchParams;
  // A magic link returns here with a one-time verifier, or with an error.
  const linkReturn: LinkReturn = error ? "error" : neon_auth_session_verifier ? "verifier" : null;
  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="text-3xl font-semibold tracking-tight">
        English <span className="text-accent">with Jamie</span>
      </h1>
      <p className="mt-2 text-sm text-muted">Sign in to open the classroom.</p>
      <LoginForm next={next ?? "/"} linkReturn={linkReturn} />
    </div>
  );
}
