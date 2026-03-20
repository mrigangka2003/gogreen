import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
    ArrowLeft, Loader2, Save, User, Mail, Phone, MapPin,
    Shield, Users, Building2, ShieldCheck,
} from "lucide-react";
import axiosInstance from "../../api";
import { useAuthStore } from "../../stores/auth";
import { Notification } from "../../components";

type FormValues = {
    name: string;
    email: string;
    phone: string;
    address: string;
    roleName: string;
    password: string;
};

const ROLE_OPTIONS = [
    { key: "super-admin", label: "Super Admin", icon: ShieldCheck, superOnly: true },
    { key: "admin", label: "Admin", icon: Shield, superOnly: true },
    { key: "org", label: "Organization", icon: Building2, superOnly: false },
    { key: "emp", label: "Employee", icon: Users, superOnly: false },
];

const AccountEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role === "super-admin";
    const basePath = isSuperAdmin ? "/dashboard/super-admin" : "/dashboard/admin";

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [accountRole, setAccountRole] = useState<string>("");

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

    useEffect(() => {
        const fetchAccount = async () => {
            setLoading(true);
            setError(null);
            try {
                const endpoint = isSuperAdmin ? "/super/accounts" : "/admin/accounts";
                const res = await axiosInstance.get(endpoint);
                if ((res.data as any)?.success) {
                    const accounts = (res.data as any).data ?? [];
                    const account = accounts.find((a: any) => a._id === id);
                    if (!account) {
                        setError("Account not found");
                        return;
                    }
                    const roleName = account.role?.name || "";
                    setAccountRole(roleName);
                    reset({
                        name: account.name || "",
                        email: account.email || "",
                        phone: account.phone || "",
                        address: account.address || "",
                        roleName: roleName,
                        password: "",
                    });
                } else {
                    throw new Error("Failed to fetch account");
                }
            } catch (err: any) {
                setError(err?.response?.data?.message || err?.message || "Network error");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchAccount();
    }, [id, isSuperAdmin, reset]);

    const onSubmit = async (data: FormValues) => {
        setSaving(true);
        try {
            const endpoint = isSuperAdmin ? `/super/accounts/${id}` : `/admin/accounts/${id}`;
            const payload: any = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                roleName: data.roleName,
            };
            if (data.password) payload.password = data.password;

            const res = await axiosInstance.patch(endpoint, payload);
            if ((res.data as any)?.success || res.status === 200) {
                setNotification({ message: "Account updated successfully", type: "success" });
                setTimeout(() => navigate(-1), 1500);
            } else {
                throw new Error((res.data as any)?.message || "Update failed");
            }
        } catch (err: any) {
            setNotification({ message: err?.response?.data?.message || err?.message || "Failed to update", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const visibleRoles = isSuperAdmin ? ROLE_OPTIONS : ROLE_OPTIONS.filter(r => !r.superOnly);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#38B000]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto min-h-screen">
            {/* Header */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Back
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Edit Account</h1>
                <p className="text-gray-500 mt-1">Update account details and role.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Role Selection */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Role</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {visibleRoles.map(role => (
                            <label
                                key={role.key}
                                className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all has-[:checked]:border-[#38B000] has-[:checked]:bg-[#38B000]/5 hover:border-gray-300"
                            >
                                <input
                                    type="radio"
                                    value={role.key}
                                    className="sr-only"
                                    {...register("roleName", { required: true })}
                                />
                                <role.icon className="w-5 h-5 text-gray-500" />
                                <span className="text-xs font-bold text-gray-700">{role.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            <span className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> Full Name</span>
                        </label>
                        <input
                            {...register("name", { required: "Name is required" })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all bg-gray-50 focus:bg-white"
                            placeholder="John Doe"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1.5">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> Email</span>
                        </label>
                        <input
                            type="email"
                            {...register("email", { required: "Email is required", pattern: /^\S+@\S+$/i })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all bg-gray-50 focus:bg-white"
                            placeholder="john@example.com"
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1.5">Valid email is required</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> Phone</span>
                        </label>
                        <input
                            {...register("phone")}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all bg-gray-50 focus:bg-white"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> Address</span>
                        </label>
                        <input
                            {...register("address")}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all bg-gray-50 focus:bg-white"
                            placeholder="123 Main St, City"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Password <span className="text-gray-400 font-normal">(Leave blank to keep unchanged)</span>
                        </label>
                        <input
                            type="password"
                            {...register("password", { minLength: { value: 6, message: "Minimum 6 characters" } })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all bg-gray-50 focus:bg-white"
                            placeholder="Enter new password (optional)"
                        />
                        {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password.message}</p>}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-end">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#38B000] hover:bg-[#2d8c00] transition-colors disabled:opacity-70 shadow-lg shadow-[#38B000]/20"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>

            {notification && (
                <div className="fixed top-5 right-5 z-50">
                    <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
                </div>
            )}
        </div>
    );
};

export default AccountEdit;
