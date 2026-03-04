import { isAllowedAdmin, requireSubscriptionAdmin } from "@/lib/better-auth/auth-utils";
import { AdminUserSearch } from "../components/AdminUserSearch";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  // Enforce subscription-admin access at the page level
  const session = await requireSubscriptionAdmin().catch(() => {
    redirect("/admin/login");
    return null;
  });

  if (!session) return null;

  const isFullAdmin = isAllowedAdmin(session.user.phoneNumber);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          User & Subscription Management
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {isFullAdmin
            ? "Search for users by phone, email, or ID and manage their subscriptions."
            : "You can only manage subscriptions for your own account."}
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <AdminUserSearch
          restrictToSelf={!isFullAdmin}
          selfUser={{
            id: session.user.id,
            name: session.user.name ?? null,
            email: session.user.email ?? null,
            phoneNumber: session.user.phoneNumber ?? null,
          }}
        />
      </div>

      <div className="mt-8 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/10">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400">
              Important Note
          </h3>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-500/80">
              Expiring subscriptions updates status/state and end dates, and keeps audit logs intact. This helps stop access/charges in the app without losing history.
          </p>
      </div>
    </div>
  );
}
