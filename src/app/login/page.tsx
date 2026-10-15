import { redirect } from "next/navigation";
import { getRole } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getRole()) redirect("/");
  const { next } = await searchParams;
  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="text-3xl font-semibold tracking-tight">
        English <span className="text-accent">with Jamie</span>
      </h1>
      <p className="mt-2 text-sm text-muted">Sign in to open the classroom.</p>
      <LoginForm next={next ?? "/"} />
    </div>
  );
}
