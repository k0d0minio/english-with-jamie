import { redirect } from "next/navigation";
import { requireRole, roleOf } from "@/lib/auth";
import { neonAuth } from "@/lib/neon-auth";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/card";
import { NewAccountForm } from "./new-account-form";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  await requireRole("teacher");
  const { data, error } = await neonAuth().admin.listUsers({
    query: { limit: 100, sortBy: "createdAt", sortDirection: "asc" },
  });
  if (error?.status === 401) redirect("/login");
  const users = data?.users ?? [];
  return (
    <>
      <PageHeader title="Accounts" lead="Who can sign in. Make an account here and pass on the email and password yourself; nothing is emailed." />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {error ? (
          <Empty>Couldn&apos;t load accounts: {error.message}</Empty>
        ) : users.length ? (
          <Card className="p-0">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const role = roleOf(u);
                  return (
                    <tr key={u.id} className="border-t border-line">
                      <td className="px-4 py-2 font-medium">{u.name}</td>
                      <td className="px-4 py-2 text-muted">{u.email}</td>
                      <td className="px-4 py-2">
                        {role ? <Badge tone={role === "teacher" ? "warm" : "accent"}>{role}</Badge> : <Badge>no access</Badge>}
                      </td>
                      <td className="px-4 py-2 text-muted">{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        ) : (
          <Empty>No accounts yet.</Empty>
        )}
        <Card>
          <h2 className="mb-4 font-semibold">New account</h2>
          <NewAccountForm />
        </Card>
      </div>
    </>
  );
}
