import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    RefreshCw, Users, Search, X, Filter, ClipboardList, UserCheck, UserX,
} from "lucide-react";
import axiosInstance from "../../api";
import { useAuthStore } from "../../stores/auth";

type Employee = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    activeTasksCount: number;
};

type FilterTab = "all" | "free" | "assigned";

const FILTER_TABS: { key: FilterTab; label: string; icon: React.ElementType }[] = [
    { key: "all", label: "All Employees", icon: Users },
    { key: "free", label: "Free", icon: UserX },
    { key: "assigned", label: "Assigned", icon: UserCheck },
];

const EmployeeManagement: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const isSuperAdmin = user?.role === "super-admin";
    const basePath = isSuperAdmin ? "/dashboard/super-admin" : "/dashboard/admin";

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = isSuperAdmin ? "/super/employees/available" : "/admin/employees/available";
            const res = await axiosInstance.get(endpoint);
            if ((res.data as any)?.success) {
                const data = (res.data as any).data;
                setEmployees(data.employees ?? []);
            } else {
                throw new Error((res.data as any)?.message || "Failed to fetch employees");
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Network error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [isSuperAdmin]);

    const filteredEmployees = useMemo(() => {
        let list = employees;

        if (activeFilter === "free") {
            list = list.filter(e => e.activeTasksCount === 0);
        } else if (activeFilter === "assigned") {
            list = list.filter(e => e.activeTasksCount > 0);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(e =>
                (e.name || "").toLowerCase().includes(q) ||
                (e.email || "").toLowerCase().includes(q) ||
                (e.phone || "").toLowerCase().includes(q) ||
                (e.address || "").toLowerCase().includes(q)
            );
        }

        return list;
    }, [employees, activeFilter, searchQuery]);

    const counts = useMemo(() => ({
        all: employees.length,
        free: employees.filter(e => e.activeTasksCount === 0).length,
        assigned: employees.filter(e => e.activeTasksCount > 0).length,
    }), [employees]);

    const handleRowClick = (empId: string) => {
        navigate(`${basePath}/employee/${empId}`);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
                    <p className="text-gray-500 mt-1">View and manage all employees, their tasks and availability.</p>
                </div>
                <button
                    onClick={fetchEmployees}
                    className="p-3 bg-white text-gray-600 rounded-xl hover:bg-gray-50 border border-gray-200 transition-colors shadow-sm self-start"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 no-scrollbar">
                {FILTER_TABS.map((tab) => {
                    const active = activeFilter === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveFilter(tab.key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 border text-sm font-semibold
                                ${active ? "bg-[#38B000] text-white border-[#38B000] shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            <span className={`ml-1.5 px-2 py-0.5 rounded-md text-xs font-bold ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                                {counts[tab.key]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, email, phone or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all bg-white"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-100">{error}</div>
            )}

            {/* Table */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="animate-pulse">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 border-b border-gray-50 bg-gray-50/50" />
                        ))}
                    </div>
                </div>
            ) : filteredEmployees.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No employees found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        {searchQuery ? "No employees match your search criteria." : "There are no employees in this category."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Address</th>
                                    <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Active Tasks</th>
                                    <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((emp) => (
                                    <tr
                                        key={emp.id}
                                        onClick={() => handleRowClick(emp.id)}
                                        className="border-b border-gray-50 hover:bg-[#38B000]/5 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#38B000]/10 text-[#38B000] flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-gray-900">{emp.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{emp.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{emp.phone || "—"}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{emp.address || "—"}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <ClipboardList className="w-4 h-4 text-gray-400" />
                                                <span className={`font-bold text-sm ${emp.activeTasksCount > 0 ? "text-blue-600" : "text-gray-400"}`}>
                                                    {emp.activeTasksCount}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${emp.activeTasksCount === 0
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-blue-50 text-blue-700"
                                                }`}>
                                                {emp.activeTasksCount === 0 ? "Free" : "Assigned"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-gray-50">
                        {filteredEmployees.map((emp) => (
                            <div
                                key={emp.id}
                                onClick={() => handleRowClick(emp.id)}
                                className="p-4 hover:bg-[#38B000]/5 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#38B000]/10 text-[#38B000] flex items-center justify-center font-bold text-sm uppercase">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                                            <p className="text-xs text-gray-500">{emp.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${emp.activeTasksCount === 0
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-blue-50 text-blue-700"
                                        }`}>
                                        {emp.activeTasksCount === 0 ? "Free" : `${emp.activeTasksCount} tasks`}
                                    </span>
                                </div>
                                {emp.phone && (
                                    <p className="text-xs text-gray-400 ml-13">{emp.phone}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary */}
            {!loading && filteredEmployees.length > 0 && (
                <div className="mt-4 text-sm text-gray-400 text-right">
                    Showing {filteredEmployees.length} of {employees.length} employees
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;
