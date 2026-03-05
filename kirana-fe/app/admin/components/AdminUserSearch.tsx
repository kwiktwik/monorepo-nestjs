"use client";

import { useState } from "react";
import { searchUserAction, expireSubscriptionDataAction, getUserBillingDataAction } from "../user-actions";
import { Search, Trash2, User, Mail, Phone, Loader2 } from "lucide-react";
import { useAdminBackend } from "./AdminBackendContext";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
};

type SelfUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
};

type AdminUserBillingData = {
  subscriptions: {
    id: string;
    appId: string | null;
    status: string | null;
    startAt: string | null;
    endAt: string | null;
    currentEnd: string | null;
    chargeAt: string | null;
    createdAt: string | null;
  }[];
  orders: {
    id: string;
    appId: string | null;
    status: string | null;
    amount: number | null;
    currency: string | null;
    razorpayOrderId: string | null;
    createdAt: string | null;
  }[];
};

export function AdminUserSearch({
  restrictToSelf = false,
  selfUser,
}: {
  restrictToSelf?: boolean;
  selfUser?: SelfUser;
}) {
  const { backend } = useAdminBackend();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [billingData, setBillingData] = useState<AdminUserBillingData | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState("");

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  };

  const formatAmount = (amount: number | null | undefined, currency?: string | null) => {
    if (amount == null) return "—";
    const rupees = amount / 100;
    const prefix = currency || "INR";
    return `${prefix} ${rupees.toFixed(2)}`;
  };

  if (backend === "kwiktwik") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-emerald-50 p-4 dark:bg-emerald-900/10">
          <User className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">KwikTwik User Management</h3>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
          User search and subscription management for the KwikTwik backend is currently being integrated. 
          Use the Local backend for active management.
        </p>
      </div>
    );
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError("");
    try {
      const res = await searchUserAction(query);
      if (res.success) {
        setResults(res.users || []);
      } else {
        setError(res.error || "Search failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    setDeletingId(userId);
    try {
      const res = await expireSubscriptionDataAction(userId);
      if (res.success) {
        const razorpay = res.expired?.razorpay ?? 0;
        alert(`Subscriptions expired successfully (razorpay: ${razorpay})`);
        setConfirmDelete(null);
      } else {
        alert("Error: " + (res.error || "Failed to expire subscriptions"));
      }
    } catch {
      alert("An unexpected error occurred during expiring");
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewBilling = async (user: AdminUser) => {
    setSelectedUser(user);
    setBillingLoading(true);
    setBillingError("");
    try {
      const res = await getUserBillingDataAction(user.id);
      if (res.success) {
        setBillingData(res.data as unknown as AdminUserBillingData);
      } else {
        setBillingData(null);
        setBillingError(res.error || "Failed to load billing data");
      }
    } catch {
      setBillingData(null);
      setBillingError("An unexpected error occurred while loading billing data");
    } finally {
      setBillingLoading(false);
    }
  };

  if (restrictToSelf && selfUser) {
    const confirmKey = selfUser.id;

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="font-medium text-zinc-900 dark:text-zinc-50">
            Your account
          </div>
          <div className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span>{selfUser.name || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span>{selfUser.email || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{selfUser.phoneNumber || "—"}</span>
            </div>
          </div>
        </div>

        {confirmDelete === confirmKey ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmDelete(null)}
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(selfUser.id)}
              disabled={deletingId === confirmKey}
              className="flex items-center gap-1 rounded bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deletingId === confirmKey ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Confirm Expire My Subscriptions"
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(confirmKey)}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Expire My Subscriptions
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Search by ID, email or phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        />
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {results.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <User className="h-4 w-4 text-zinc-500" />
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-50">{u.name}</div>
                        <div className="text-xs text-zinc-500 font-mono">ID: {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                        <Mail className="h-3 w-3" /> {u.email}
                      </div>
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                        <Phone className="h-3 w-3" /> {u.phoneNumber || "No phone"}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleViewBilling(u)}
                        className="inline-flex items-center gap-1.5 rounded border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                      >
                        {billingLoading && selectedUser?.id === u.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : null}
                        <span>View Billing</span>
                      </button>
                      {confirmDelete === u.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={deletingId === u.id}
                            className="flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingId === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm Expire"}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(u.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Expire Subscriptions
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results.length === 0 && !loading && query && (
          <div className="text-center py-10 text-zinc-500">
              No users found matching your search.
          </div>
      )}

      {selectedUser && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Billing overview for {selectedUser.name || selectedUser.email || selectedUser.id}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Subscription and order data for this user.
              </p>
            </div>
          </div>

          {billingError && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-900/10 dark:text-red-400">
              {billingError}
            </div>
          )}

          {billingLoading && !billingError && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading billing data...
            </div>
          )}

          {billingData && !billingLoading && !billingError && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="text-zinc-500">Subscriptions</div>
                  <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {billingData.subscriptions.length}
                  </div>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="text-zinc-500">Orders</div>
                  <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {billingData.orders.length}
                  </div>
                </div>
              </div>

              {billingData.subscriptions.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white text-xs dark:border-zinc-800 dark:bg-zinc-900/50">
                  <div className="border-b border-zinc-200 px-4 py-2 font-medium text-zinc-800 dark:border-zinc-800 dark:text-zinc-50">
                    Subscriptions
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-t border-zinc-100 text-left dark:border-zinc-800">
                      <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                        <tr>
                          <th className="px-4 py-2 font-medium">ID</th>
                          <th className="px-4 py-2 font-medium">App</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2 font-medium">Start</th>
                          <th className="px-4 py-2 font-medium">Current Period End</th>
                          <th className="px-4 py-2 font-medium">End</th>
                          <th className="px-4 py-2 font-medium">Next charge</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {billingData.subscriptions.map((sub) => (
                          <tr key={sub.id}>
                            <td className="px-4 py-2 font-mono">{sub.id}</td>
                            <td className="px-4 py-2">{sub.appId || "default"}</td>
                            <td className="px-4 py-2">{sub.status}</td>
                            <td className="px-4 py-2">{formatDateTime(sub.startAt)}</td>
                            <td className="px-4 py-2">{formatDateTime(sub.currentEnd)}</td>
                            <td className="px-4 py-2">{formatDateTime(sub.endAt)}</td>
                            <td className="px-4 py-2">{formatDateTime(sub.chargeAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {billingData.orders.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white text-xs dark:border-zinc-800 dark:bg-zinc-900/50">
                  <div className="border-b border-zinc-200 px-4 py-2 font-medium text-zinc-800 dark:border-zinc-800 dark:text-zinc-50">
                    Orders
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-t border-zinc-100 text-left dark:border-zinc-800">
                      <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                        <tr>
                          <th className="px-4 py-2 font-medium">Order ID</th>
                          <th className="px-4 py-2 font-medium">App</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2 font-medium">Amount</th>
                          <th className="px-4 py-2 font-medium">Currency</th>
                          <th className="px-4 py-2 font-medium">Razorpay order</th>
                          <th className="px-4 py-2 font-medium">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {billingData.orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-4 py-2 font-mono">{order.id}</td>
                            <td className="px-4 py-2">{order.appId || "default"}</td>
                            <td className="px-4 py-2">{order.status}</td>
                            <td className="px-4 py-2">
                              {formatAmount(order.amount, order.currency)}
                            </td>
                            <td className="px-4 py-2">{order.currency || "INR"}</td>
                            <td className="px-4 py-2 font-mono text-xs">
                              {order.razorpayOrderId || "—"}
                            </td>
                            <td className="px-4 py-2">{formatDateTime(order.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
