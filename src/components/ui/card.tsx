import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-line bg-card p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)]", className)} {...props} />;
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "accent" | "warm" | "ok" }) {
  const tones = {
    neutral: "bg-line/70 text-muted",
    accent: "bg-accent-soft text-accent-strong",
    warm: "bg-warm-soft text-warm",
    ok: "bg-ok-soft text-ok",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)} {...props} />
  );
}

export function PageHeader({ title, lead, actions }: { title: string; lead?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {lead ? <p className="mt-1 max-w-2xl text-sm text-muted">{lead}</p> : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">{children}</div>;
}
