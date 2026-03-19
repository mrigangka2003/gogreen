import React from "react";
import { Users, ClipboardList, Activity, LayoutDashboard, Plus } from "lucide-react";
import { useAuthStore } from "../../stores/auth";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const stats = [
        { label: "Platform Users", value: "1,245", icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border border-green-700/20 shadow" },
        { label: "Total Bookings", value: "892", icon: ClipboardList, color: "text-[#38B000]", bg: "bg-[#38B000]/10", border: "border border-green-700/20 shadow" },
        { label: "Active Staff", value: "48", icon: Activity, color: "text-amber-600", bg: "bg-amber-50", border: "border border-green-700/20 shadow" },
    ];

    const quickActions = [
        { title: "Manage Users", desc: "View and edit user access", path: "user-management", icon: Users },
        { title: "Manage Bookings", desc: "Oversee all active and past jobs", path: "all-bookings", icon: ClipboardList },
        { title: "Create Booking", desc: "Create a new booking on behalf of a user", path: "create-booking", icon: Plus },
    ];

    return (
        <div className="w-full min-h-[calc(100vh-80px)] p-6 md:p-8 overflow-y-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-[#38B000]" />
                        Admin Workspace
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Welcome back, <span className="font-semibold text-gray-700">{user?.name}</span>.
                    </p>
                </div>
                <button
                    onClick={() => navigate("create-booking")}
                    className="flex items-center justify-center gap-2 bg-[#38B000] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#2d8c00] transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Booking</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`bg-white rounded-2xl p-6 transition-all hover:shadow-md ${stat.border}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Daily Operations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => navigate(action.path)}
                            className="bg-white p-6 rounded-2xl shadow border border-green-700/20 hover:border-green-700/40 hover:shadow-lg transition-all text-left flex flex-col h-full group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-gray-50 text-gray-600 rounded-xl group-hover:bg-[#38B000] group-hover:text-white transition-colors">
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-[#38B000] transition-colors">{action.title}</h3>
                            </div>
                            <p className="text-sm text-gray-500 flex-grow">{action.desc}</p>
                            <span className="text-[#38B000] text-sm font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                Open →
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard
