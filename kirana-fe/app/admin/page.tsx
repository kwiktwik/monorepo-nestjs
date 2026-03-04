import { isAllowedAdmin, requireSubscriptionAdmin } from "@/lib/better-auth/auth-utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  // Enforce subscription-admin access at the page level
  const session = await requireSubscriptionAdmin().catch(() => {
    redirect("/admin/login");
    return null;
  });

  if (!session) return null;

  const isFullAdmin = isAllowedAdmin(session.user.phoneNumber);
  if (!isFullAdmin) {
    redirect("/admin/users");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Quick overview of system activity and management shortcuts.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Management Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Users & Subscriptions</h3>
          <p className="mt-2 text-sm text-zinc-500">Manage user data and subscription cleanup.</p>
          <div className="mt-4">
            <Link 
              href="/admin/users" 
              className="text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
            >
              Go to User Management →
            </Link>
          </div>
        </div>

        {/* System Status Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">System Logs</h3>
          <p className="mt-2 text-sm text-zinc-500">View detailed system logs and events.</p>
          <div className="mt-4">
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
