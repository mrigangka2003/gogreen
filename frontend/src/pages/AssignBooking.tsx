import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import axiosInstance from "../api";
import { Search, Filter, MapPin, Calendar, Clock, User, RefreshCw, Plus } from "lucide-react";

type Booking = {
    _id: string;
    serviceType?: string;
    address: string;
    phoneNumber: string;
    instruction: string;
    date: string;
    timeSlot: string;
    status: string;
    amount?: number;
    paymentStatus?: string;
    userId: { _id?: string; name?: string; email?: string; phone?: string } | null;
    assignments?: {
        employeeId: { _id?: string; name?: string; email?: string; phone?: string; role?: any };
        status: string;
    }[];
    startPhoto?: string;
    endPhoto?: string;
    completedAt?: string;
    createdAt?: string;
};

type StatusTab = "all" | "pending" | "assigned" | "started" | "completed";

const STATUS_TABS: { key: StatusTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "assigned", label: "Assigned" },
    { key: "started", label: "Started" },
    { key: "completed", label: "Completed" },
];

const statusColor = (s: string) => {
    switch (s?.toLowerCase()) {
        case "pending": return "bg-amber-100 text-amber-800";
        case "assigned": return "bg-blue-100 text-blue-800";
        case "started": return "bg-cyan-100 text-cyan-800";
        case "completed": return "bg-green-100 text-green-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

const AssignBookings = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<StatusTab>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const isSuperAdmin = user?.role === "super-admin";
    const basePath = isSuperAdmin ? "/dashboard/super-admin" : "/dashboard/admin";

    const REFRESH_INTERVAL = 30; // seconds
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
    const countdownRef = useRef(REFRESH_INTERVAL);

    const fetchBookings = useCallback(async () => {
        if (!user) return;
        const endpoint = isSuperAdmin ? "super/bookings" : "admin/bookings";
        try {
            setLoading(true);
            const { data } = await axiosInstance.get<{
                success: boolean;
                data: Booking[];
            }>(endpoint);
            if (data?.success) {
                setBookings(data.data);
            }
        } catch (err) {
            console.error("Error fetching bookings:", err);
        } finally {
            setLoading(false);
        }
        countdownRef.current = REFRESH_INTERVAL;
        setCountdown(REFRESH_INTERVAL);
    }, [user, isSuperAdmin]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Auto-refresh countdown — only when there are non-completed bookings
    const hasActiveBookings = bookings.some(b => b.status?.toLowerCase() !== "completed");

    useEffect(() => {
        if (!hasActiveBookings) return;
        const timer = setInterval(() => {
            countdownRef.current -= 1;
            setCountdown(countdownRef.current);
            if (countdownRef.current <= 0) {
                fetchBookings();
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [fetchBookings, hasActiveBookings]);

    const filteredBookings = bookings.filter((b) => {
        const matchesTab = activeTab === "all" || b.status?.toLowerCase() === activeTab;
        const matchesSearch =
            searchQuery === "" ||
            b.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.instruction?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getTabCount = (tab: StatusTab) => {
        if (tab === "all") return bookings.length;
        return bookings.filter((b) => b.status?.toLowerCase() === tab).length;
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {bookings.length} total bookings
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(`${basePath}/create-booking`)}
                        className="flex items-center gap-2 bg-[#38B000] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#2d8c00] transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Booking</span>
                    </button>
                    <button
                        onClick={fetchBookings}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        {hasActiveBookings
                            ? <span className="tabular-nums text-xs font-bold text-gray-400 min-w-[20px] text-center">{countdown}s</span>
                            : <span className="text-xs font-medium">Refresh</span>
                        }
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by address, customer, or instruction..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
                {STATUS_TABS.map((tab) => {
                    const count = getTabCount(tab.key);
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === tab.key
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab.label}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key
                                ? "bg-primary/10 text-primary"
                                : "bg-gray-200 text-gray-500"
                                }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Booking Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <RefreshCw className="h-8 w-8 text-primary animate-spin mb-3" />
                    <p className="text-sm text-gray-400">Loading bookings...</p>
                </div>
            ) : filteredBookings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBookings.map((b) => (
                        <div
                            key={b._id}
                            className="rounded-2xl p-4 bg-white shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow"
                        >
                            {/* Status + Service Type */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-gray-800 capitalize">
                                        {b.serviceType || "Booking"}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        <span className="line-clamp-1">{b.address}</span>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${statusColor(b.status)}`}>
                                    {b.status}
                                </span>
                            </div>

                            {/* Instruction */}
                            {b.instruction && (
                                <p className="text-xs text-gray-500 line-clamp-2">{b.instruction}</p>
                            )}

                            {/* Date & Time */}
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(b.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {b.timeSlot}
                                </span>
                            </div>

                            {/* Customer */}
                            {b.userId?.name && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-2 border-t border-gray-50">
                                    <User className="h-3 w-3" />
                                    <span>{b.userId.name}</span>
                                    <span className="text-gray-300">·</span>
                                    <span>{b.userId.email}</span>
                                </div>
                            )}

                            {/* Assigned Employee */}
                            {b.assignments && b.assignments.filter(a => a.status !== "removed").length > 0 && (
                                <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg flex flex-col gap-0.5">
                                    <span className="text-gray-500 mb-0.5">Assigned to:</span>
                                    {b.assignments.filter(a => a.status !== "removed").map((assignment, idx) => (
                                        <div key={idx} className="font-semibold">• {assignment.employeeId?.name || "Unknown"}</div>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-1">
                                {b.status?.toLowerCase() === "pending" && (
                                    <button
                                        onClick={() => navigate(`${basePath}/booking/${b._id}`)}
                                        className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-hover-color transition-colors"
                                    >
                                        Assign
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate(`${basePath}/booking/${b._id}`)}
                                    className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Filter className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">No bookings found</p>
                    <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
                </div>
            )}
        </div>
    );
};

export default AssignBookings;
