"use client";

import { useAdminBackend } from "./AdminBackendContext";
import { Server, Zap, Globe } from "lucide-react";

export function BackendToggle() {
    const { backend, setBackend } = useAdminBackend();

    return (
        <div className="flex items-center gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-inner">
            <button
                onClick={() => setBackend("local")}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    backend === "local"
                        ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
            >
                <Server className={`h-3.5 w-3.5 ${backend === "local" ? "text-blue-500" : ""}`} />
                Local
            </button>
            <button
                onClick={() => setBackend("kwiktwik")}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    backend === "kwiktwik"
                        ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
            >
                <Globe className={`h-3.5 w-3.5 ${backend === "kwiktwik" ? "text-emerald-500" : ""}`} />
                KwikTwik
            </button>
        </div>
    );
}
