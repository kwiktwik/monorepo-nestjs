"use client";

import { useState } from "react";
import { Search, ExternalLink, CreditCard, Clock, Info, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { getRazorpayOrderDetails } from "./actions";

export default function RazorpayLookupPage() {
    const [orderId, setOrderId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);
    const [showRawOrder, setShowRawOrder] = useState(false);
    const [showRawPayments, setShowRawPayments] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) return;

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const result = await getRazorpayOrderDetails(orderId.trim());
            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error || "An error occurred");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency,
        }).format(amount / 100);
    };

    return (
        <div className="p-8 pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Razorpay Order Lookup</h1>
                <p className="mt-2 text-zinc-500 dark:text-zinc-400">Enter a Razorpay Order ID to fetch all details from Razorpay API.</p>
            </div>

            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex max-w-2xl gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="order_PRk..."
                            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !orderId.trim()}
                        className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        {loading ? "Searching..." : "Lookup"}
                    </button>
                </div>
            </form>

            {error && (
                <div className="mb-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {data && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Order Summary */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                                <Info className="h-5 w-5 text-blue-500" />
                                Order Details
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-900">
                                    <span className="text-sm text-zinc-500">Receipt</span>
                                    <span className="text-sm font-medium">{data.order.receipt || "N/A"}</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-900">
                                    <span className="text-sm text-zinc-500">Amount</span>
                                    <span className="text-sm font-bold">{formatCurrency(data.order.amount, data.order.currency)}</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-900">
                                    <span className="text-sm text-zinc-500">Paid</span>
                                    <span className="text-sm font-medium">{formatCurrency(data.order.amount_paid, data.order.currency)}</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-900">
                                    <span className="text-sm text-zinc-500">Status</span>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                        data.order.status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                        data.order.status === "attempted" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                        "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                                    }`}>
                                        {data.order.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-zinc-500">Created At</span>
                                    <span className="text-sm font-medium">{formatDate(data.order.created_at)}</span>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                                <CreditCard className="h-5 w-5 text-purple-500" />
                                Payment Summary
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-900">
                                    <span className="text-sm text-zinc-500">Total Payments</span>
                                    <span className="text-sm font-medium">{data.payments.length}</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-100 pb-2 dark:border-zinc-900">
                                    <span className="text-sm text-zinc-500">Captured</span>
                                    <span className="text-sm font-medium">{data.payments.filter((p: any) => p.status === "captured").length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-zinc-500">Failed</span>
                                    <span className="text-sm font-medium text-red-500">{data.payments.filter((p: any) => p.status === "failed").length}</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Payments List */}
                    <section className="rounded-2xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="border-b border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <h2 className="text-lg font-bold">Payments</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                        <th className="px-4 py-3 font-semibold">Payment ID</th>
                                        <th className="px-4 py-3 font-semibold">Amount</th>
                                        <th className="px-4 py-3 font-semibold">Method</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Email/Contact</th>
                                        <th className="px-4 py-3 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                                    {data.payments.length > 0 ? (
                                        data.payments.map((payment: any) => (
                                            <tr key={payment.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                <td className="px-4 py-4 font-mono text-xs">{payment.id}</td>
                                                <td className="px-4 py-4 font-bold">{formatCurrency(payment.amount, payment.currency)}</td>
                                                <td className="px-4 py-4 capitalize">{payment.method}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        payment.status === "captured" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                        payment.status === "failed" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                    }`}>
                                                        {payment.status === "captured" && <CheckCircle2 className="h-3 w-3" />}
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col">
                                                        <span>{payment.email}</span>
                                                        <span className="text-xs text-zinc-500">{payment.contact}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-xs">
                                                    <div className="flex items-center gap-1 text-zinc-500">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(payment.created_at)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">No payments found for this order.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Raw Data Accordions */}
                    <div className="space-y-4">
                        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <button 
                                onClick={() => setShowRawOrder(!showRawOrder)}
                                className="flex w-full items-center justify-between p-4 text-left font-semibold"
                            >
                                Raw Order JSON
                                {showRawOrder ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            {showRawOrder && (
                                <div className="border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                                    <pre className="overflow-auto text-xs font-mono">
                                        {JSON.stringify(data.order, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <button 
                                onClick={() => setShowRawPayments(!showRawPayments)}
                                className="flex w-full items-center justify-between p-4 text-left font-semibold"
                            >
                                Raw Payments JSON
                                {showRawPayments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            {showRawPayments && (
                                <div className="border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                                    <pre className="overflow-auto text-xs font-mono text-zinc-600 dark:text-zinc-400">
                                        {JSON.stringify(data.payments, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
