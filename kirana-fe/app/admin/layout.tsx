import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import Link from "next/link";
import { LayoutDashboard, Users, UserCircle, Bell } from "lucide-react";
import { isAllowedAdmin } from "@/lib/better-auth/auth-utils";

import { AdminBackendProvider } from "./components/AdminBackendContext";
import { BackendToggle } from "./components/BackendToggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  const userName = session?.user.name || session?.user.phoneNumber || "Admin";
  const isFullAdmin = isAllowedAdmin(session?.user.phoneNumber);

  return (
    <AdminBackendProvider>
      <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex h-full flex-col">
            <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                <span className="rounded bg-zinc-900 px-2 py-0.5 text-white dark:bg-zinc-50 dark:text-zinc-900">A</span>
                AlertPay Admin
              </h2>
            </div>
            
            <nav className="flex-1 space-y-1 p-4">
              {isFullAdmin ? (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              ) : null}
              <Link
                href="/admin/users"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              >
                <Users className="h-4 w-4" />
                Users & Subscriptions
              </Link>
              {isFullAdmin ? (
                <Link
                  href="/admin/notifications"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </Link>
              ) : null}
            </nav>

            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <UserCircle className="h-5 w-5 text-zinc-500" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">{userName}</p>
                  <p className="text-[10px] text-zinc-500">
                    {isFullAdmin ? "Authorized Admin" : "Subscription Admin"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pl-64">
          <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 p-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-medium text-zinc-500">System Context:</h3>
                <BackendToggle />
              </div>
              <div className="flex items-center gap-4">
                {/* Additional top-bar actions can go here */}
              </div>
            </div>
          </header>
          {children}
        </main>
      </div>
    </AdminBackendProvider>
  );
}
