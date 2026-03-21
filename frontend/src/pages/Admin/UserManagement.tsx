import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Users, Shield, Building2, UserPlus, X, Edit2, Trash2, ShieldCheck } from "lucide-react";
import axiosInstance from "../../api";
import { Notification } from "../../components";
import { useAuthStore } from "../../stores/auth";

type Role = "org" | "emp" | "admin" | "super-admin";

export type Account = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: Role;
    avatarUrl?: string | null;
    createdAt?: string | null;
    isActive?: boolean;
    raw?: any;
};

const TAB_TYPES = [
    { key: "super-admin", label: "Super Admins", icon: ShieldCheck },
    { key: "admin", label: "Admins", icon: Shield },
    { key: "org", label: "Organizations", icon: Building2 },
    { key: "emp", label: "Employees", icon: Users },
];

const UserManagement: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const currentUserRole = user?.role;
    const isSuperAdmin = currentUserRole === "super-admin";
    const basePath = isSuperAdmin ? "/dashboard/super-admin" : "/dashboard/admin";

    // "Admins" tab is only visible to super-admin. If admin, default to "emp" or "org".
    const [activeTab, setActiveTab] = useState<string>(isSuperAdmin ? "super-admin" : "org");

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const fetchAccounts = async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = isSuperAdmin ? "/super/accounts" : "/admin/accounts";
            const res = await axiosInstance.get(endpoint);

            if ((res.data as any)?.success) {
                const rawList = (res.data as any).data ?? [];
                let mapped: Account[] = rawList.map((r: any) => ({
                    id: r._id,
                    name: r.name?.trim() ?? "—",
                    email: r.email ?? "",
                    phone: r.phone ?? "",
                    isActive: r.isActive,
                    role: r.role?.name,
                    avatarUrl: r["avatarUrl"] ?? null,
                    createdAt: r.createdAt ?? null,
                    raw: r,
                }));
                setAccounts(mapped);
            } else {
                throw new Error((res.data as any)?.message || "Failed to fetch accounts");
            }
        } catch (err: any) {
            console.error("Fetch accounts error:", err);
            setError(err?.response?.data?.message || err?.message || "Network error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [isSuperAdmin]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this account? This action cannot be undone.")) return;

        try {
            const endpoint = isSuperAdmin ? `/super/accounts/${id}` : `/admin/accounts/${id}`;
            await axiosInstance.delete(endpoint);
            setNotification({ message: "Account deleted successfully", type: "success" });
            fetchAccounts();
        } catch (err: any) {
            setNotification({ message: err?.response?.data?.message || err.message, type: "error" });
        }
    };

    const handleCreateClick = () => {
        setModalMode("create");
        setSelectedAccount(null);
        setShowModal(true);
    };

    const handleEditClick = (acc: Account) => {
        navigate(`${basePath}/account/${acc.id}`);
    };

    const filteredAccounts = useMemo(() => {
        let filtered = accounts.filter(a => a.role === activeTab);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                (a.name || "").toLowerCase().includes(q) ||
                (a.email || "").toLowerCase().includes(q) ||
                (a.phone || "").toLowerCase().includes(q)
            );
        }
        return filtered;
    }, [accounts, activeTab, searchQuery]);

    const visibleTabs = isSuperAdmin ? TAB_TYPES : TAB_TYPES.filter(t => t.key !== "admin" && t.key !== "super-admin");

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage platform administrators, employees, and organizations.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchAccounts} className="p-3 bg-white text-gray-600 rounded-xl hover:bg-gray-50 border border-gray-200 transition-colors shadow-sm">
                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <button onClick={handleCreateClick} className="flex items-center gap-2 bg-[#38B000] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#2d8c00] transition-colors shadow-sm">
                        <UserPlus className="w-5 h-5" />
                        <span>Create {isSuperAdmin ? "User" : "Org/Emp"}</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 no-scrollbar">
                {visibleTabs.map((tab) => {
                    const active = activeTab === tab.key;
                    const count = accounts.filter(a => a.role === tab.key).length;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 border text-sm font-semibold
                                ${active ? "bg-[#38B000] text-white border-[#38B000] shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            <span className={`ml-1.5 px-2 py-0.5 rounded-md text-xs font-bold ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all bg-white"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Content List */}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-100">{error}</div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-2xl h-40 border border-gray-100 shadow-sm"></div>
                    ))}
                </div>
            ) : filteredAccounts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">There are currently no {visibleTabs.find(t => t.key === activeTab)?.label.toLowerCase()} or none match your search criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAccounts.map(account => (
                        <div key={account.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-[#38B000]/10 text-[#38B000] flex items-center justify-center font-bold text-lg uppercase">
                                        {account.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 line-clamp-1">{account.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{account.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditClick(account)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(account.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 mt-4 text-sm text-gray-600">
                                {account.phone ? (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Phone</span>
                                        <span className="font-medium">{account.phone}</span>
                                    </div>
                                ) : null}
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Joined</span>
                                    <span className="font-medium">{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                                    <span className="text-gray-400">Status</span>
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${account.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                        {account.isActive !== false ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <UserModal
                    mode={modalMode}
                    account={selectedAccount}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); fetchAccounts(); }}
                    isSuperAdmin={isSuperAdmin}
                />
            )}

            {/* Notification */}
            {notification && (
                <div className="fixed top-5 right-5 z-50">
                    <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
                </div>
            )}
        </div>
    );
};

export default UserManagement;

/* ------------------------------- Modal Component ------------------------------ */

type FormValues = {
    name: string;
    email: string;
    phone: string;
    password?: string;
    roleName: Role;
};

const UserModal: React.FC<{
    mode: "create" | "edit";
    account: Account | null;
    onClose: () => void;
    onSuccess: () => void;
    isSuperAdmin: boolean;
}> = ({ mode, account, onClose, onSuccess, isSuperAdmin }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        defaultValues: {
            name: account?.name || "",
            email: account?.email || "",
            phone: account?.phone || "",
            roleName: account?.role || (isSuperAdmin ? "admin" : "org"),
            password: ""
        }
    });

    const [notif, setNotif] = useState<{ message: string; type: "error" | "success" } | null>(null);

    const onSubmit = async (data: FormValues) => {
        try {
            setNotif(null);
            let endpoint = "";
            let method: "post" | "patch" = mode === "create" ? "post" : "patch";

            if (mode === "create") {
                if (data.roleName === "admin") {
                    endpoint = "/super/accounts/admin";
                } else if (data.roleName === "super-admin") {
                    endpoint = "/super/accounts/super-admin";
                } else {
                    endpoint = isSuperAdmin ? "/super/accounts" : "/admin/accounts";
                }
            } else {
                endpoint = isSuperAdmin ? `/super/accounts/${account!.id}` : `/admin/accounts/${account!.id}`;
            }

            const payload = mode === "create" ? data : {
                name: data.name,
                email: data.email,
                phone: data.phone,
                roleName: data.roleName,
                ...(data.password ? { password: data.password } : {})
            };

            const res = await axiosInstance[method](endpoint, payload);
            if ((res.data as any)?.success || res.status === 200 || res.status === 201) {
                onSuccess();
            } else {
                throw new Error((res.data as any)?.message || "Action failed");
            }
        } catch (err: any) {
            setNotif({ message: err?.response?.data?.message || err.message, type: "error" });
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">{mode === "create" ? "Create New User" : "Edit User"}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {notif && (
                        <div className={`p-4 rounded-xl mb-6 text-sm ${notif.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                            {notif.message}
                        </div>
                    )}

                    <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {isSuperAdmin && (
                                    <label className="relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all has-[:checked]:border-[#38B000] has-[:checked]:bg-[#38B000]/5 hover:border-gray-300">
                                        <input type="radio" value="super-admin" className="sr-only" {...register("roleName", { required: true })} />
                                        <ShieldCheck className="w-4 h-4 text-gray-500" />
                                        <span className="text-xs font-bold text-gray-700">Super-Admin</span>
                                    </label>
                                )}
                                {isSuperAdmin && (
                                    <label className="relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all has-[:checked]:border-[#38B000] has-[:checked]:bg-[#38B000]/5 hover:border-gray-300">
                                        <input type="radio" value="admin" className="sr-only" {...register("roleName", { required: true })} />
                                        <Shield className="w-4 h-4 text-gray-500" />
                                        <span className="text-xs font-bold text-gray-700">Admin</span>
                                    </label>
                                )}
                                <label className="relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all has-[:checked]:border-[#38B000] has-[:checked]:bg-[#38B000]/5 hover:border-gray-300">
                                    <input type="radio" value="org" className="sr-only" {...register("roleName", { required: true })} />
                                    <Building2 className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs font-bold text-gray-700">Org</span>
                                </label>
                                <label className="relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all has-[:checked]:border-[#38B000] has-[:checked]:bg-[#38B000]/5 hover:border-gray-300">
                                    <input type="radio" value="emp" className="sr-only" {...register("roleName", { required: true })} />
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs font-bold text-gray-700">Employee</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                            <input
                                {...register("name", { required: "Name is required" })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all bg-gray-50 focus:bg-white"
                                placeholder="John Doe"
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-1.5">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Details</label>
                            <input
                                type="email"
                                {...register("email", { required: "Email is required", pattern: /^\S+@\S+$/i })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all bg-gray-50 focus:bg-white"
                                placeholder="john@example.com"
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1.5">Valid email is required</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                            <input
                                {...register("phone", { required: "Phone is required", minLength: 6 })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all bg-gray-50 focus:bg-white"
                                placeholder="+1 (555) 000-0000"
                            />
                            {errors.phone && <p className="text-xs text-red-500 mt-1.5">Phone number is required</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Password {mode === "edit" && <span className="text-gray-400 font-normal">(Leave blank to keep unchanged)</span>}
                            </label>
                            <input
                                type="password"
                                {...register("password", { required: mode === "create" ? "Password is required" : false, minLength: 6 })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all bg-gray-50 focus:bg-white"
                                placeholder={mode === "create" ? "Create a strong password" : "Enter new password (optional)"}
                            />
                            {errors.password && <p className="text-xs text-red-500 mt-1.5">Minimum 6 characters required</p>}
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4 justify-end">
                    <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="user-form"
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-xl font-bold text-white bg-[#38B000] hover:bg-[#2d8c00] transition-colors disabled:opacity-70 shadow-lg shadow-[#38B000]/20"
                    >
                        {isSubmitting ? "Saving..." : "Save User"}
                    </button>
                </div>
            </div>
        </div>
    );
};
