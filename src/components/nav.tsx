import Link from "next/link";
import { BookOpen, GraduationCap, Home, ListChecks, Presentation, BarChart3, LogOut, Wallet } from "lucide-react";
import type { Role } from "@/lib/session";
import { logout } from "@/actions/auth";
import { Badge } from "@/components/ui/card";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/live", label: "Live", icon: Presentation },
  { href: "/lessons", label: "Lessons", icon: GraduationCap },
  { href: "/homework", label: "Homework", icon: ListChecks },
  { href: "/reference", label: "Reference", icon: BookOpen },
  { href: "/account", label: "Account", icon: Wallet },
];

export function Nav({ role }: { role: Role }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        <Link href="/" className="mr-2 font-semibold tracking-tight">
          English <span className="text-accent">with Jamie</span>
        </Link>
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto text-sm">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-muted hover:bg-line/60 hover:text-ink">
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
          {role === "teacher" ? (
            <Link href="/teach/results" className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-muted hover:bg-line/60 hover:text-ink">
              <BarChart3 className="h-4 w-4" /> Results
            </Link>
          ) : null}
        </nav>
        <Badge tone={role === "teacher" ? "warm" : "accent"}>{role}</Badge>
        <form action={logout}>
          <button className="rounded-md p-1.5 text-muted hover:bg-line/60 hover:text-ink" title="Log out" aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
