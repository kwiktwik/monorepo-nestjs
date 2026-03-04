import { requireAdmin } from "@/lib/better-auth/auth-utils";
import { NotificationDashboard } from "../components/NotificationDashboard";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";

export default async function AdminNotificationsPage() {
    // Enforce admin access at the page level
    const session = await requireAdmin().catch(() => {
        redirect("/admin/login");
        return null;
    });

    if (!session) return null;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-zinc-50">
                        <Bell className="h-6 w-6 text-white dark:text-zinc-900" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Notification Center
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            Broadcast messages and alerts to your app users worldwide.
                        </p>
                    </div>
                </div>
            </div>

            <NotificationDashboard />
        </div>
    );
}
