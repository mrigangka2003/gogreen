import React, { useEffect, useState } from "react";
import {
    Plus, Edit2, Trash2, RefreshCw, X, CheckCircle2,
    Sparkles, Trash2 as TrashIcon, Trees, Droplets, Leaf,
    Wrench, Recycle, Wind, ShoppingBag, Blend, Sun, Zap,
    ToggleLeft, ToggleRight
} from "lucide-react";
import axiosInstance from "../api";
import { useAuthStore } from "../stores/auth";
import { Notification } from "../components";

// ------ Icon Registry ------
export const ICON_MAP: Record<string, React.ReactNode> = {
    Sparkles: <Sparkles className="w-5 h-5" />,
    Trash2: <TrashIcon className="w-5 h-5" />,
    Trees: <Trees className="w-5 h-5" />,
    Droplets: <Droplets className="w-5 h-5" />,
    Leaf: <Leaf className="w-5 h-5" />,
    Wrench: <Wrench className="w-5 h-5" />,
    Recycle: <Recycle className="w-5 h-5" />,
    Wind: <Wind className="w-5 h-5" />,
    ShoppingBag: <ShoppingBag className="w-5 h-5" />,
    Blend: <Blend className="w-5 h-5" />,
    Sun: <Sun className="w-5 h-5" />,
    Zap: <Zap className="w-5 h-5" />,
};

// ------ Color presets ------
const COLOR_PRESETS = [
    { label: "Blue", value: "bg-blue-50 text-blue-600" },
    { label: "Green", value: "bg-green-50 text-green-600" },
    { label: "Amber", value: "bg-amber-50 text-amber-500" },
    { label: "Red", value: "bg-red-50 text-red-500" },
    { label: "Purple", value: "bg-purple-50 text-purple-600" },
    { label: "Emerald", value: "bg-emerald-50 text-emerald-600" },
    { label: "Sky", value: "bg-sky-50 text-sky-600" },
    { label: "Rose", value: "bg-rose-50 text-rose-500" },
];

type Service = {
    _id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    isActive: boolean;
    order: number;
};

type ServiceFormData = {
    title: string;
    description: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
};

const defaultForm: ServiceFormData = {
    title: "",
    description: "",
    icon: "Sparkles",
    color: "bg-blue-50 text-blue-600",
    order: 0,
    isActive: true,
};

export default function ServicesManager() {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role === "super-admin";
    const baseEndpoint = isSuperAdmin ? "/super/services" : "/admin/services";

    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [form, setForm] = useState<ServiceFormData>(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${baseEndpoint}/all`);
            if ((res.data as any).success) {
                setServices((res.data as any).data ?? []);
            }
        } catch (err: any) {
            setNotification({ message: err?.response?.data?.message || "Failed to load services", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchServices(); }, []);

    const openCreate = () => {
        setEditingService(null);
        setForm(defaultForm);
        setShowModal(true);
    };

    const openEdit = (svc: Service) => {
        setEditingService(svc);
        setForm({
            title: svc.title,
            description: svc.description,
            icon: svc.icon,
            color: svc.color,
            order: svc.order,
            isActive: svc.isActive,
        });
        setShowModal(true);
    };

    const handleToggleActive = async (svc: Service) => {
        try {
            await axiosInstance.patch(`${baseEndpoint}/${svc._id}`, { isActive: !svc.isActive });
            fetchServices();
            setNotification({ message: `Service ${svc.isActive ? "deactivated" : "activated"}`, type: "success" });
        } catch (err: any) {
            setNotification({ message: "Failed to toggle service", type: "error" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this service? This cannot be undone.")) return;
        try {
            await axiosInstance.delete(`${baseEndpoint}/${id}`);
            setNotification({ message: "Service deleted", type: "success" });
            fetchServices();
        } catch (err: any) {
            setNotification({ message: "Failed to delete service", type: "error" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingService) {
                await axiosInstance.patch(`${baseEndpoint}/${editingService._id}`, form);
                setNotification({ message: "Service updated!", type: "success" });
            } else {
                await axiosInstance.post(baseEndpoint, form);
                setNotification({ message: "Service created!", type: "success" });
            }
            setShowModal(false);
            fetchServices();
        } catch (err: any) {
            setNotification({ message: err?.response?.data?.message || "Action failed", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Services</h1>
                    <p className="text-gray-500 mt-1">Manage the services customers can book.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchServices} className="p-3 bg-white text-gray-600 rounded-xl hover:bg-gray-50 border border-green-700/20 transition-colors shadow-sm">
                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <button onClick={openCreate} className="flex items-center gap-2 bg-[#38B000] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#2d8c00] transition-colors shadow-sm">
                        <Plus className="w-5 h-5" />
                        <span>Add Service</span>
                    </button>
                </div>
            </div>

            {/* Services Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-2xl h-36 border border-green-700/20 shadow-sm" />
                    ))}
                </div>
            ) : services.length === 0 ? (
                <div className="bg-white rounded-2xl p-14 text-center border border-green-700/20 shadow-sm">
                    <Sparkles className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No services yet</h3>
                    <p className="text-gray-500 mb-6">Add your first service to let users book it.</p>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 bg-[#38B000] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#2d8c00] transition-colors">
                        <Plus className="w-4 h-4" /> Add Service
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {services.map(svc => (
                        <div key={svc._id} className={`bg-white p-5 rounded-2xl border border-green-700/20 shadow-sm hover:shadow-md transition-shadow group ${!svc.isActive ? "opacity-60" : ""}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${svc.color}`}>
                                    {ICON_MAP[svc.icon] ?? <Sparkles className="w-5 h-5" />}
                                </div>
                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleToggleActive(svc)}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                        title={svc.isActive ? "Deactivate" : "Activate"}
                                    >
                                        {svc.isActive
                                            ? <ToggleRight className="w-4 h-4 text-green-600" />
                                            : <ToggleLeft className="w-4 h-4 text-gray-400" />
                                        }
                                    </button>
                                    <button onClick={() => openEdit(svc)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(svc._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">{svc.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{svc.description}</p>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                <span className="text-xs text-gray-400">Order: {svc.order}</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${svc.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                    {svc.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingService ? "Edit Service" : "Add New Service"}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
                                <input
                                    required
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="e.g. Deep Cleaning"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all bg-gray-50 focus:bg-white"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Short description of the service..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all bg-gray-50 focus:bg-white resize-none"
                                />
                            </div>

                            {/* Icon Picker */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Icon *</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {Object.keys(ICON_MAP).map(iconKey => (
                                        <button
                                            key={iconKey}
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, icon: iconKey }))}
                                            title={iconKey}
                                            className={`p-3 rounded-xl border-2 flex items-center justify-center transition-all ${
                                                form.icon === iconKey
                                                    ? "border-[#38B000] bg-[#38B000]/5 text-[#38B000]"
                                                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                                            }`}
                                        >
                                            {ICON_MAP[iconKey]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Color *</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {COLOR_PRESETS.map(preset => (
                                        <button
                                            key={preset.value}
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, color: preset.value }))}
                                            className={`p-2.5 rounded-xl border-2 flex items-center gap-2 transition-all ${
                                                form.color === preset.value
                                                    ? "border-[#38B000] scale-105"
                                                    : "border-transparent hover:border-gray-200"
                                            }`}
                                        >
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${preset.value}`}>
                                                {ICON_MAP[form.icon] ?? <Sparkles className="w-4 h-4" />}
                                            </span>
                                            <span className="text-xs font-medium text-gray-600">{preset.label}</span>
                                            {form.color === preset.value && <CheckCircle2 className="w-3 h-3 text-[#38B000] ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Order & Active */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Display Order</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.order}
                                        onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                                            form.isActive
                                                ? "bg-green-50 border-green-200 text-green-700"
                                                : "bg-gray-50 border-gray-200 text-gray-500"
                                        }`}
                                    >
                                        <span>{form.isActive ? "Active" : "Inactive"}</span>
                                        {form.isActive
                                            ? <ToggleRight className="w-5 h-5" />
                                            : <ToggleLeft className="w-5 h-5" />
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Submit buttons */}
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-5 py-3 rounded-xl font-bold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-5 py-3 rounded-xl font-bold text-white bg-[#38B000] hover:bg-[#2d8c00] transition-colors disabled:opacity-60 shadow-lg shadow-[#38B000]/20"
                                >
                                    {submitting ? "Saving..." : editingService ? "Update Service" : "Create Service"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification && (
                <div className="fixed top-5 right-5 z-50">
                    <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
                </div>
            )}
        </div>
    );
}
