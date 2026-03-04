"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type BackendType = "local" | "kwiktwik";

interface AdminBackendContextType {
    backend: BackendType;
    setBackend: (backend: BackendType) => void;
}

const AdminBackendContext = createContext<AdminBackendContextType | undefined>(undefined);

export function AdminBackendProvider({ children }: { children: React.ReactNode }) {
    const [backend, setBackendState] = useState<BackendType>("local");

    // Load from local storage on mount
    useEffect(() => {
        const savedBackend = localStorage.getItem("admin-backend") as BackendType;
        if (savedBackend === "local" || savedBackend === "kwiktwik") {
            setBackendState(savedBackend);
        }
    }, []);

    const setBackend = (newBackend: BackendType) => {
        setBackendState(newBackend);
        localStorage.setItem("admin-backend", newBackend);
    };

    return (
        <AdminBackendContext.Provider value={{ backend, setBackend }}>
            {children}
        </AdminBackendContext.Provider>
    );
}

export function useAdminBackend() {
    const context = useContext(AdminBackendContext);
    if (context === undefined) {
        throw new Error("useAdminBackend must be used within an AdminBackendProvider");
    }
    return context;
}
