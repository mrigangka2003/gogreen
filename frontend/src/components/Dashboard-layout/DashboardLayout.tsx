// src/components/Dashboard-layout/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../SideBar";
import { useAuthStore } from "../../stores/auth";

/* --------------  COLOURS  -------------- */
// const PRIMARY = "#38B000";
const SECONDARY = "#F0EAD2";
const THIRD = "#EBF2FA";
const FOURTH = "#141414";
const FIFTH = "#6C584C";

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
            <div
                className="min-h-screen flex items-center justify-center p-6"
                style={{ color: FIFTH }}
            >
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: THIRD }}>
            {/* Sidebar */}
            <Sidebar
                UserRoles={user.role}
                userId={user.id ?? user._id}
                basePath={`${basePath}/${user.role}`} // keeps your logic
            />

            {/* Main area */}
            <div className="flex-1 md:ml-72">
                {/* Header */}
                {showHeader && (
                    <header
                        className="sticky top-0 z-10 p-4 border-b backdrop-blur-sm"
                        style={{
                            backgroundColor: `${SECONDARY}99`, // 60 % opacity
                            borderColor: `${FIFTH}1a`,
                        }}
                    >
                        <div className="max-w-7xl mx-auto">
                            <h1
                                className="text-lg font-semibold"
                                style={{ color: FOURTH }}
                            >
                                Welcome, {user.name ?? "User"}
                            </h1>
                        </div>
                    </header>
                )}

                {/* Page content */}
                <main
                    className="p-6 max-w-7xl mx-auto"
                    style={{ color: FOURTH }}
                >
                    {children ?? <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
