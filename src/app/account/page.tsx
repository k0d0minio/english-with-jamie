import { requireRole } from "@/lib/auth";
import { listLessons } from "@/lib/content";
import { bankDetails, getLedger, lessonBalance } from "@/lib/queries";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import { AddPaidForm, DeleteLedgerEntry, MarkTaughtForm } from "@/components/ledger-forms";
import { cn, formatDate, todayISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

const LOW = 2;

export default async function AccountPage() {
  const role = await requireRole();
  const teacher = role === "teacher";
  const [balance, ledger, lessons] = await Promise.all([lessonBalance(), getLedger(), teacher ? listLessons() : Promise.resolve([])]);
  const bank = bankDetails();
  const today = todayISO();
  const { paid, taught, remaining } = balance;

  const status =
    remaining < 0
      ? { tone: "warm" as const, text: `${-remaining} lesson${remaining === -1 ? "" : "s"} taught beyond the paid bundle` }
      : remaining === 0
        ? { tone: "warm" as const, text: paid ? "Bundle used up. Top up to keep going." : "No lessons paid yet." }
        : remaining <= LOW
          ? { tone: "warm" as const, text: "Running low. Time to top up soon." }
          : { tone: "ok" as const, text: "You're all set." };

  return (
    <>
      <PageHeader
        title={teacher ? "Student account" : "Your lessons"}
        lead={
          teacher
            ? "Kept by hand: add lessons once you've verified a payment, and mark each lesson off after you teach it. The student sees this page read-only."
            : "How many lessons you've paid for and how many are left. Jamie adds lessons once your payment arrives and marks each one off after class."
        }
      />
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Lessons left" value={remaining} highlight={remaining <= LOW ? "warm" : "accent"} />
          <Stat label="Paid for" value={paid} />
          <Stat label="Completed" value={taught} />
        </div>
        <p className="-mt-2 text-sm">
          <Badge tone={status.tone}>{status.text}</Badge>
        </p>

        {teacher ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Payment received</h2>
              <AddPaidForm today={today} />
            </Card>
            <Card>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Lesson completed</h2>
              <MarkTaughtForm today={today} lessonTitles={lessons.map((l) => l.title)} />
            </Card>
          </div>
        ) : null}

        <Card>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Top up by bank transfer</h2>
            {bank ? <CopyButton text={bank} label="Copy bank details" /> : null}
          </div>
          {bank ? (
            <>
              <pre className="whitespace-pre-wrap rounded-md bg-paper p-3 font-mono text-sm">{bank}</pre>
              <p className="mt-2 text-xs text-muted">
                {teacher ? "From the BANK_DETAILS env var in Vercel." : "Once Jamie has confirmed the transfer, the new lessons appear here."}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              {teacher ? "Set BANK_DETAILS in the Vercel project's environment variables to show them here." : "Ask Jamie for the bank details."}
            </p>
          )}
        </Card>

        <Card>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">History</h2>
          {ledger.length ? (
            <ul className="divide-y divide-line">
              {ledger.map((e) => {
                const isPaid = e.kind === "paid";
                const what = isPaid ? `${e.lessons} lesson${e.lessons === 1 ? "" : "s"} paid` : "Lesson completed";
                return (
                  <li key={e.id} className="flex items-center gap-3 py-2.5">
                    <span className={cn("w-12 shrink-0 text-right font-mono text-sm font-semibold", isPaid ? "text-ok" : "text-muted")}>
                      {isPaid ? `+${e.lessons}` : `−${e.lessons}`}
                    </span>
                    <span className="flex-1">
                      <span className="font-medium">{what}</span>
                      {e.note ? <span className="text-muted"> · {e.note}</span> : null}
                    </span>
                    <span className="text-xs text-muted">{formatDate(e.date)}</span>
                    {teacher ? <DeleteLedgerEntry id={e.id} what={`${what}, ${formatDate(e.date)}`} /> : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>Nothing recorded yet.</Empty>
          )}
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: "accent" | "warm" }) {
  return (
    <Card className={cn(highlight === "accent" && "border-accent/40 bg-accent-soft/50", highlight === "warm" && "border-warm/40 bg-warm-soft/50")}>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className={cn("mt-1 text-4xl font-semibold tracking-tight", highlight === "accent" && "text-accent-strong", highlight === "warm" && "text-warm")}>{value}</div>
    </Card>
  );
}
