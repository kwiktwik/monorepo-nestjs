"use client";

import { useState } from "react";
import { syncOrdersAction, SyncResult } from "./actions";
import { Upload, AlertCircle, CheckCircle2, Loader2, RefreshCcw, Layout } from "lucide-react";

const REGISTERED_APPS = [
  { id: "com.kiranaapps.app", name: "Kirana Apps" },
  { id: "com.paymentalert.app", name: "AlertPay (paymentalert)" },
  { id: "alertpay-android", name: "AlertPay Android" },
  { id: "alertpay-web", name: "AlertPay Web" },
  { id: "com.sharestatus.app", name: "ShareStatus" },
  { id: "alertpay-default", name: "AlertPay Default" },
];

export default function SyncOrdersPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<SyncResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetAppId, setTargetAppId] = useState("auto");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResults(null);

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      
      // Extract Order IDs (handle potential header and empty lines)
      const orderIds = lines
        .map((line) => line.trim().split(",")[0].trim())
        .filter((id) => id.startsWith("order_"));

      if (orderIds.length === 0) {
        throw new Error("No valid Razorpay Order IDs found in CSV.");
      }

      const syncResult = await syncOrdersAction(orderIds, targetAppId);
      setResults(syncResult);
    } catch (err: any) {
      setError(err.message || "Failed to process file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sync Missing Orders
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Upload a CSV file containing Razorpay Order IDs to fetch and sync missing orders to the database.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Settings Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <Layout className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
             </div>
             <div className="flex-1">
                <label htmlFor="app-selector" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                   Target Application
                </label>
                <p className="text-xs text-zinc-500">Orders will be synced under this App ID.</p>
             </div>
             <select 
               id="app-selector"
               className="bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block p-2.5 dark:bg-zinc-900 dark:border-zinc-800 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-zinc-500 dark:focus:border-zinc-500"
               value={targetAppId}
               onChange={(e) => setTargetAppId(e.target.value)}
               disabled={isUploading}
             >
               <option value="auto">✨ Auto-detect from Notes</option>
               {REGISTERED_APPS.map(app => (
                 <option key={app.id} value={app.id}>{app.name} ({app.id})</option>
               ))}
             </select>
          </div>
        </div>

        {/* Upload Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-12 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
            <Upload className="h-12 w-12 text-zinc-400 mb-4" />
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1">
              {isUploading ? "Processing sync..." : "Upload CSV file"}
            </h3>
            <p className="text-xs text-zinc-500 mb-4 text-center">
              CSV should have Razorpay Order IDs in the first column.
            </p>
            
            <label className="relative cursor-pointer">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Select File & Sync
              </span>
              <input
                type="file"
                className="sr-only"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Results Table */}
        {results && (
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 overflow-hidden">
            <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Sync Results</h3>
            </div>
            <div className="max-h-[500px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Razorpay Order ID</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {results.map((result, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{result.razorpayOrderId}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                          result.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                          result.status === 'skipped' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {result.status === 'success' && <CheckCircle2 className="h-3 w-3" />}
                          {result.status === 'error' && <AlertCircle className="h-3 w-3" />}
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{result.message}</td>
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
