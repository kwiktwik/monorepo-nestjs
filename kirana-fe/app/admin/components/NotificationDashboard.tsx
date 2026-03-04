"use client";

import { useState, useEffect } from "react";
import { sendNotificationAction, SendNotificationParams } from "../notifications/notification-actions";
import { useAdminBackend } from "./AdminBackendContext";
import { Send, User, Smartphone, Info, Loader2, CheckCircle2, AlertCircle, AppWindow, Hash } from "lucide-react";

export function NotificationDashboard() {
    const { backend } = useAdminBackend();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);
    const [targetType, setTargetType] = useState<"user" | "token" | "phone">("user");
    
    const [formData, setFormData] = useState({
        userId: "",
        token: "",
        phoneNumber: "",
        appId: "com.kiranaapps.app", 
        title: "",
        body: "",
    });

    // Sync targetType with backend
    useEffect(() => {
        if (backend === "kwiktwik") {
            setTargetType("phone");
        } else if (targetType === "phone") {
            setTargetType("user");
        }
    }, [backend]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const params: SendNotificationParams = {
                backend,
                title: formData.title,
                body: formData.body,
                appId: formData.appId,
                userId: backend === "local" && targetType === "user" ? formData.userId : undefined,
                token: backend === "local" && targetType === "token" ? formData.token : undefined,
                phoneNumber: backend === "kwiktwik" ? formData.phoneNumber : undefined,
            };

            const res = await sendNotificationAction(params);

            if (res.success) {
                setResult({
                    success: true,
                    message: `Notification sent successfully via ${res.method}!`,
                });
                setFormData(prev => ({ ...prev, userId: "", token: "", phoneNumber: "", title: "", body: "" }));
            } else {
                setResult({
                    success: false,
                    message: res.error || "Failed to send notification",
                    details: res.details,
                });
            }
        } catch (err) {
            setResult({
                success: false,
                message: "An unexpected error occurred",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                    <Send className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    Notification Center
                </h1>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Dispatch notifications using the <span className="font-semibold text-zinc-700 dark:text-zinc-300 capitalize">{backend}</span> backend.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 backdrop-blur-xl">
                        <div className="border-b border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                                {backend === "local" ? <Send className="h-5 w-5 text-blue-600" /> : <Hash className="h-5 w-5 text-emerald-600" />}
                                Compose Notification
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Target Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Target Configuration
                                </label>
                                <div className="flex gap-4">
                                    {backend === "local" ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setTargetType("user")}
                                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all ${
                                                    targetType === "user"
                                                        ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
                                                        : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
                                                }`}
                                            >
                                                <User className="h-4 w-4" />
                                                User ID
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTargetType("token")}
                                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all ${
                                                    targetType === "token"
                                                        ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
                                                        : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
                                                }`}
                                            >
                                                <Smartphone className="h-4 w-4" />
                                                FCM Token
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400`}
                                        >
                                            <Hash className="h-4 w-4" />
                                            Phone Number Target
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Dynamic Inputs */}
                            <div className="grid grid-cols-1 gap-6">
                                {backend === "local" ? (
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {targetType === "user" ? (
                                            <div className="space-y-2">
                                                <label htmlFor="userId" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                    User ID
                                                </label>
                                                <input
                                                    id="userId"
                                                    name="userId"
                                                    type="text"
                                                    required
                                                    value={formData.userId}
                                                    onChange={handleChange}
                                                    placeholder="Enter user ID..."
                                                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label htmlFor="token" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                    FCM Token
                                                </label>
                                                <input
                                                    id="token"
                                                    name="token"
                                                    type="text"
                                                    required
                                                    value={formData.token}
                                                    onChange={handleChange}
                                                    placeholder="Paste FCM token..."
                                                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label htmlFor="appId" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                App Bundle ID
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="appId"
                                                    name="appId"
                                                    value={formData.appId}
                                                    onChange={handleChange}
                                                    className="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-4 py-2.5 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                                                >
                                                    <option value="com.kiranaapps.app">AlertPay (com.kiranaapps.app)</option>
                                                    <option value="com.jamun.app">Jamun (com.jamun.app)</option>
                                                    <option value="com.sharestatus.app">ShareStatus (com.sharestatus.app)</option>
                                                    <option value="com.kwiktwik.kirana">Kirana Express (com.kwiktwik.kirana)</option>
                                                </select>
                                                <AppWindow className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label htmlFor="phoneNumber" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Registered Phone Number
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="phoneNumber"
                                                    name="phoneNumber"
                                                    type="text"
                                                    required
                                                    value={formData.phoneNumber}
                                                    onChange={handleChange}
                                                    placeholder="919876543210"
                                                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 pl-11 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                                                />
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">+</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                <Info className="h-3 w-3" />
                                                Include country code without the plus sign.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="appId" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                App Bundle ID (FCM Target)
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="appId"
                                                    name="appId"
                                                    value={formData.appId}
                                                    onChange={handleChange}
                                                    className="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-4 py-2.5 pr-10 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                                                >
                                                    <option value="com.kiranaapps.app">AlertPay (com.kiranaapps.app)</option>
                                                    <option value="com.jamun.app">Jamun (com.jamun.app)</option>
                                                    <option value="com.sharestatus.app">ShareStatus (com.sharestatus.app)</option>
                                                    <option value="com.kwiktwik.kirana">Kirana Express (com.kwiktwik.kirana)</option>
                                                </select>
                                                <AppWindow className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Notification Title
                                    </label>
                                    <input
                                        id="title"
                                        name="title"
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Special Offer Inside!"
                                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="body" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Message Body
                                    </label>
                                    <textarea
                                        id="body"
                                        name="body"
                                        required
                                        rows={4}
                                        value={formData.body}
                                        onChange={handleChange}
                                        placeholder="Type your message content..."
                                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Results Display */}
                            {result && (
                                <div className={`flex flex-col gap-1 rounded-xl p-4 text-sm ${
                                    result.success 
                                        ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                                        : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                }`}>
                                    <div className="flex items-start gap-3">
                                        {result.success ? (
                                            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                        )}
                                        <p className="font-medium">{result.message}</p>
                                    </div>
                                    {result.details && (
                                        <p className="ml-8 text-xs opacity-80 break-all">{result.details}</p>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 ${
                                    backend === "local" 
                                        ? "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900" 
                                        : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                }`}
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        {backend === "local" ? "Send via Local FCM" : "Send via KwikTwik (FCM + Polling)"}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/20 dark:bg-blue-900/10">
                        <h4 className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-400">
                            <Info className="h-4 w-4" />
                            Backend Insights
                        </h4>
                        <div className="mt-4 space-y-4">
                            <div className={`p-3 rounded-lg border text-xs transition-all ${backend === "local" ? "border-blue-200 bg-blue-100/50 dark:border-blue-800 dark:bg-blue-900/40" : "opacity-40"}`}>
                                <p className="font-bold uppercase tracking-wider mb-1">Local (FCM)</p>
                                <p>Delivers instantly via Firebase Cloud Messaging. Requires App Bundle ID to target correctly.</p>
                            </div>
                            <div className={`p-3 rounded-lg border text-xs transition-all ${backend === "kwiktwik" ? "border-emerald-200 bg-emerald-100/50 dark:border-emerald-800 dark:bg-emerald-900/40" : "opacity-40"}`}>
                                <p className="font-bold uppercase tracking-wider mb-1 text-emerald-700 dark:text-emerald-400">KwikTwik (FCM + Polling)</p>
                                <p>Dispatches an instant FCM push (if tokens exist) AND stores in the database for app polling. Targets by Phone Number + App ID.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
