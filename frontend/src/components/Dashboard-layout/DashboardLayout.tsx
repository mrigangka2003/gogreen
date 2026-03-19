// src/components/Dashboard-layout/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../SideBar";
import { useAuthStore } from "../../stores/auth";

type Props = {
    basePath?: string;
    showHeader?: boolean;
    children?: React.ReactNode;
};

const DashboardLayout: React.FC<Props> = ({
    basePath = "/dashboard",
    showHeader = true,
    children,
}) => {
    const user = useAuthStore((s: any) => s.user);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-gray-500">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-50/50">
            {/* Sidebar */}
            <Sidebar
                UserRoles={user.role}
                basePath={`${basePath}/${user.role}`} // keeps your logic
            />

            {/* Main area */}
            <div className="flex-1 md:ml-72 flex flex-col h-screen">
                {/* Header */}
                {showHeader && (
                    <header className="sticky top-0 z-10 px-6 py-3 border-b border-gray-200 bg-white/90 backdrop-blur-md flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-lg font-bold text-gray-800 tracking-tight">
                                GoGreen<span className="text-[#38B000]">Plus</span>
                            </h1>
                            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-[#38B000]/10 text-[#38B000] text-[10px] font-bold uppercase tracking-wider border border-[#38B000]/15">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#38B000] mr-1 animate-pulse"></span>
                                {user.role}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-gray-500 leading-none">Welcome back</p>
                                <p className="text-sm font-bold text-gray-800 leading-tight">{user.name}</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#38B000] to-[#2d8c00] text-white flex items-center justify-center text-sm font-bold ring-2 ring-[#38B000]/20 cursor-pointer">
                                {user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                        </div>
                    </header>
                )}

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    {children ?? <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
