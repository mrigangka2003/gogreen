import React from "react";
import { Users, ClipboardList, TrendingUp, Settings, ShieldCheck, Activity } from "lucide-react";
import { useAuthStore } from "../../stores/auth";
import { useNavigate } from "react-router-dom";

const SuperAdminDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const stats = [
        { label: "Total Users", value: "2,543", icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border border-green-700/20 shadow" },
        { label: "Active Jobs", value: "142", icon: ClipboardList, color: "text-[#38B000]", bg: "bg-[#38B000]/10", border: "border border-green-700/20 shadow" },
        { label: "System Health", value: "99.9%", icon: Activity, color: "text-purple-600", bg: "bg-purple-50", border: "border border-green-700/20 shadow" },
        { label: "Revenue Growth", value: "+14.5%", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", border: "border border-green-700/20 shadow" },
    ];

    const quickActions = [
        { title: "Manage Users", desc: "View and edit all system users", path: "user-management", icon: Users },
        { title: "All Bookings", desc: "Oversee all active and past jobs", path: "all-bookings", icon: ClipboardList },
        { title: "System Settings", desc: "Configure global parameters", path: "", icon: Settings },
    ];

    return (
        <div className="w-full min-h-[calc(100vh-80px)] p-6 md:p-8 overflow-y-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-[#38B000]" />
                        Super Admin Overview
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Welcome back, <span className="font-semibold text-gray-700">{user?.name}</span>. Here's what's happening today.
                    </p>
                </div>
                <div className="flex bg-white p-2 rounded-xl shadow-sm border border-gray-100 items-center text-sm font-medium text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    System Online
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`bg-white rounded-2xl p-6 transition-all hover:shadow-md ${stat.border}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+2.4%</span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => navigate(action.path)}
                            className="bg-white p-6 rounded-2xl shadow border border-green-700/20 hover:border-green-700/40 hover:shadow-lg transition-all text-left flex flex-col h-full group"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-gray-50 text-gray-600 rounded-xl group-hover:bg-[#38B000] group-hover:text-white transition-colors">
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-[#38B000] transition-colors">{action.title}</h3>
                            </div>
                            <p className="text-sm text-gray-500">{action.desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
