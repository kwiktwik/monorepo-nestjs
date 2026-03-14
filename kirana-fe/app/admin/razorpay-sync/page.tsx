"use client";

import React, { useState, useCallback } from "react";
import {
  fetchOrdersByDateRange,
  compareOrders,
  syncSelectedOrders,
  MissingOrder,
  CompareResult,
  SyncResult,
} from "./actions";
import {
  Calendar,
  Loader2,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Play,
  Layout,
} from "lucide-react";

const REGISTERED_APPS = [
  { id: "com.kiranaapps.app", name: "Kirana Apps", packageName: "com.kiranaapps.app" },
  { id: "com.paymentalert.app", name: "AlertPay", packageName: "com.paymentalert.app" },
  { id: "com.sharestatus.app", name: "ShareStatus", packageName: "com.sharestatus.app" },
];

// Get yesterday's date as default
const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndOfYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  date.setHours(23, 59, 59, 999);
  return date;
};

// Format date for input
const formatDateForInput = (date: Date) => {
  return date.toISOString().split("T")[0];
};

export default function RazorpayBulkSyncPage() {
  // Date state (default: yesterday)
  const [fromDate, setFromDate] = useState<Date>(getYesterday());
  const [toDate, setToDate] = useState<Date>(getEndOfYesterday());
  const [selectedAppId, setSelectedAppId] = useState("com.kiranaapps.app");

  // Progress state
  const [isFetching, setIsFetching] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    status: "idle" as "idle" | "fetching" | "comparing" | "syncing" | "completed" | "error",
    message: "",
  });

  // Results state
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle fetch and compare
  const handleFetchAndCompare = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    setCompareResult(null);
    setSyncResults(null);
    setSelectedOrders(new Set());

    try {
      // Validate 1-day range
      const diffHours = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60);
      if (diffHours > 24) {
        throw new Error("Date range must be 1 day or less");
      }

      // Step 1: Fetch orders from Razorpay
      setProgress({
        current: 0,
        total: 100,
        status: "fetching",
        message: "Fetching orders from Razorpay...",
      });

      const razorpayOrders = await fetchOrdersByDateRange(fromDate, toDate, selectedAppId);

      // Step 2: Compare with DB
      setProgress({
        current: 50,
        total: 100,
        status: "comparing",
        message: "Comparing with local database...",
      });

      const result = await compareOrders(razorpayOrders, selectedAppId);

      setProgress({
        current: 100,
        total: 100,
        status: "completed",
        message: `Found ${result.totalCount} orders, ${result.missingCount} missing`,
      });

      setCompareResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to fetch and compare orders");
      setProgress({
        current: 0,
        total: 0,
        status: "error",
        message: err.message,
      });
    } finally {
      setIsFetching(false);
    }
  }, [fromDate, toDate, selectedAppId]);

  // Handle sync selected orders
  const handleSyncSelected = useCallback(async () => {
    if (selectedOrders.size === 0) return;

    setIsFetching(true);
    setSyncResults(null);

    try {
      const orderIds = Array.from(selectedOrders);

      setProgress({
        current: 0,
        total: orderIds.length,
        status: "syncing",
        message: `Syncing ${orderIds.length} orders...`,
      });

      const results = await syncSelectedOrders(orderIds, selectedAppId);

      // Update progress for each result
      setProgress({
        current: orderIds.length,
        total: orderIds.length,
        status: "completed",
        message: `Sync completed: ${results.filter((r) => r.status === "success").length} success, ${results.filter((r) => r.status === "skipped").length} skipped`,
      });

      setSyncResults(results);

      // Remove successfully synced orders from selection
      const successfulIds = new Set(
        results.filter((r) => r.status === "success").map((r) => r.razorpayOrderId)
      );
      setSelectedOrders((prev) => {
        const next = new Set(prev);
        successfulIds.forEach((id) => next.delete(id));
        return next;
      });
    } catch (err: any) {
      setError(err.message || "Failed to sync orders");
    } finally {
      setIsFetching(false);
    }
  }, [selectedOrders, selectedAppId]);

  // Toggle order selection
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  // Select/deselect all
  const toggleSelectAll = () => {
    if (!compareResult) return;

    if (selectedOrders.size === compareResult.missingOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(compareResult.missingOrders.map((o) => o.razorpayOrderId)));
    }
  };

  // Toggle row expansion
  const toggleRowExpansion = (orderId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  // Format amount (paise to rupees)
  const formatAmount = (amount: number) => {
    return `₹${(amount / 100).toLocaleString("en-IN")}`;
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Razorpay Bulk Sync
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Fetch orders from Razorpay by date range, compare with local DB, and sync missing orders.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Configuration Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                From Date
              </label>
              <input
                type="date"
                value={formatDateForInput(fromDate)}
                onChange={(e) => setFromDate(new Date(e.target.value))}
                disabled={isFetching}
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block p-2.5 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                To Date
              </label>
              <input
                type="date"
                value={formatDateForInput(toDate)}
                onChange={(e) => setToDate(new Date(e.target.value))}
                disabled={isFetching}
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block p-2.5 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
              />
            </div>

            {/* App Selector */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2">
                <Layout className="inline-block w-4 h-4 mr-1" />
                Target Application
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                disabled={isFetching}
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block p-2.5 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
              >
                {REGISTERED_APPS.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.packageName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fetch Button */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleFetchAndCompare}
              disabled={isFetching}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium transition-colors ${
                isFetching
                  ? "bg-zinc-400 cursor-not-allowed"
                  : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              }`}
            >
              {isFetching && progress.status === "fetching" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Fetch & Compare Orders
            </button>

            {progress.status !== "idle" && progress.status !== "error" && (
              <span className="text-sm text-zinc-500">{progress.message}</span>
            )}
          </div>

          {/* Progress Bar */}
          {isFetching && (
            <div className="mt-4">
              <div className="w-full bg-zinc-200 rounded-full h-2.5 dark:bg-zinc-700">
                <div
                  className="bg-zinc-900 h-2.5 rounded-full transition-all duration-300 dark:bg-zinc-100"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-zinc-500">
                <span>
                  {progress.current} / {progress.total}
                </span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {compareResult && (
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {compareResult.totalCount}
              </div>
              <div className="text-sm text-zinc-500">Total Orders in Razorpay</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {compareResult.existingCount}
              </div>
              <div className="text-sm text-zinc-500">Already Synced</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {compareResult.missingCount}
              </div>
              <div className="text-sm text-zinc-500">Missing Orders</div>
            </div>
          </div>
        )}

        {/* Missing Orders Table */}
        {compareResult && compareResult.missingCount > 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 overflow-hidden">
            <div className="border-b border-zinc-200 p-4 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  Missing Orders ({compareResult.missingCount})
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Select orders to sync. Orders with missing users will be skipped automatically.
                </p>
              </div>
              <button
                onClick={toggleSelectAll}
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {selectedOrders.size === compareResult.missingCount ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="max-h-[500px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedOrders.size === compareResult.missingCount &&
                          compareResult.missingCount > 0
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                      />
                    </th>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {compareResult.missingOrders.map((order) => (
                    <React.Fragment key={order.razorpayOrderId}>
                      <tr
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.razorpayOrderId)}
                            onChange={() => toggleOrderSelection(order.razorpayOrderId)}
                            className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                          />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {order.razorpayOrderId}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatAmount(order.amount)} {order.currency}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                              order.status === "paid"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                : order.status === "created"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleRowExpansion(order.razorpayOrderId)}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                          >
                            {expandedRows.has(order.razorpayOrderId) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {expandedRows.has(order.razorpayOrderId) && (
                        <tr className="bg-zinc-50/50 dark:bg-zinc-800/30">
                          <td colSpan={6} className="px-4 py-3">
                            <div className="text-xs space-y-1">
                              {order.receipt && (
                                <div>
                                  <span className="text-zinc-500">Receipt:</span>{" "}
                                  <span className="font-mono">{order.receipt}</span>
                                </div>
                              )}
                              {order.notes && (
                                <div>
                                  <span className="text-zinc-500">Notes:</span>{" "}
                                  <span className="font-mono text-xs">{order.notes}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sync Button */}
            {selectedOrders.size > 0 && (
              <div className="border-t border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {selectedOrders.size} order(s) selected
                  </span>
                  <button
                    onClick={handleSyncSelected}
                    disabled={isFetching}
                    className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                      isFetching
                        ? "bg-zinc-400 cursor-not-allowed"
                        : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    }`}
                  >
                    {isFetching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Sync Selected Orders
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sync Results */}
        {syncResults && (
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 overflow-hidden">
            <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Sync Results</h3>
            </div>
            <div className="max-h-[300px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {syncResults.map((result, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs">{result.razorpayOrderId}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                            result.status === "success"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : result.status === "skipped"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {result.status === "success" && <CheckCircle2 className="h-3 w-3" />}
                          {result.status === "error" && <AlertCircle className="h-3 w-3" />}
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                        {result.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
