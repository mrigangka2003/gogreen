import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, User, Mail, Phone, MapPin, Calendar, Clock,
    ClipboardList, ChevronLeft, ChevronRight, Edit2, Loader2,
    CheckCircle2, AlertCircle, Play, XCircle,
} from "lucide-react";
import axiosInstance from "../../api";
import { useAuthStore } from "../../stores/auth";

type EmployeeInfo = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    isActive: boolean;
    createdAt?: string;
};

type Assignment = {
    employeeId: { _id: string; id?: string; name?: string } | string;
    status: string;
    assignedAt?: string;
    startTime?: string;
    endTime?: string;
};

type BookingItem = {
    _id: string;
    serviceType: string;
    address: string;
    date: string;
    timeSlot?: string;
    status: string;
    userId?: { name?: string; email?: string };
    assignments: Assignment[];
};

function fmtDate(d?: string | Date | null) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function statusStyle(s: string) {
    const m: Record<string, string> = {
        pending: "bg-amber-50 text-amber-700",
        assigned: "bg-blue-50 text-blue-700",
        started: "bg-purple-50 text-purple-700",
        completed: "bg-green-50 text-green-700",
        cancelled: "bg-red-50 text-red-700",
        removed: "bg-gray-100 text-gray-500",
    };
    return m[s?.toLowerCase()] ?? "bg-gray-100 text-gray-600";
}

function statusIcon(s: string) {
    const map: Record<string, React.ElementType> = {
        assigned: AlertCircle,
        started: Play,
        completed: CheckCircle2,
        cancelled: XCircle,
        removed: XCircle,
    };
    return map[s?.toLowerCase()] ?? AlertCircle;
}

// ─── Attendance Calendar (UI only) ─────────────────────────────────
const AttendanceCalendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const monthName = currentDate.toLocaleString("en-US", { month: "long", year: "numeric" });
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Placeholder attendance data (UI only)
    const placeholderPresent = new Set<number>();
    const placeholderAbsent = new Set<number>();

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="font-bold text-gray-800">{monthName}</h3>
                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {weekDays.map(d => (
                    <div key={d} className="text-center text-xs font-bold text-gray-400 py-2">{d}</div>
                ))}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isToday = isCurrentMonth && day === today.getDate();
                    const isPresent = placeholderPresent.has(day);
                    const isAbsent = placeholderAbsent.has(day);

                    return (
                        <div
                            key={day}
                            className={`text-center py-2 rounded-lg text-sm transition-colors cursor-default
                                ${isToday ? "ring-2 ring-[#38B000] font-bold" : ""}
                                ${isPresent ? "bg-emerald-100 text-emerald-700 font-semibold" : ""}
                                ${isAbsent ? "bg-red-100 text-red-700 font-semibold" : ""}
                                ${!isPresent && !isAbsent ? "text-gray-700 hover:bg-gray-50" : ""}
                            `}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    Present
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    Absent
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-3 h-3 rounded-full ring-2 ring-[#38B000] bg-white" />
                    Today
                </div>
            </div>

            <p className="text-xs text-gray-400 mt-3 italic">Attendance tracking will be implemented soon.</p>
        </div>
    );
};

// ─── Booking Card ───────────────────────────────────────────────────
const BookingCard: React.FC<{
    booking: BookingItem;
    employeeId: string;
    onClick: () => void;
}> = ({ booking, employeeId, onClick }) => {
    const empAssignment = booking.assignments?.find(
        (a) => ( (a.employeeId as any)?._id || a.employeeId) === employeeId || ( (a.employeeId as any)?.id || a.employeeId) === employeeId
    );
    const assignmentStatus = empAssignment?.status || booking.status;
    const StatusIcon = statusIcon(assignmentStatus);

    return (
        <div
            onClick={onClick}
            className="p-4 rounded-xl border border-gray-100 hover:border-[#38B000]/30 hover:shadow-md cursor-pointer transition-all bg-white"
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{booking.serviceType}</h4>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{booking.address}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${statusStyle(assignmentStatus)}`}>
                    <StatusIcon className="w-3 h-3" />
                    {assignmentStatus}
                </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
                <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {fmtDate(booking.date)}
                </span>
                {booking.timeSlot && (
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {booking.timeSlot}
                    </span>
                )}
                {booking.userId?.name && (
                    <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {booking.userId.name}
                    </span>
                )}
            </div>
        </div>
    );
};

// ─── Main Component ─────────────────────────────────────────────────
const EmployeeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role === "super-admin";
    const basePath = isSuperAdmin ? "/dashboard/super-admin" : "/dashboard/admin";

    const [employee, setEmployee] = useState<EmployeeInfo | null>(null);
    const [activeBookings, setActiveBookings] = useState<BookingItem[]>([]);
    const [pastBookings, setPastBookings] = useState<BookingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const endpoint = isSuperAdmin ? `/super/employees/${id}` : `/admin/employees/${id}`;
                const res = await axiosInstance.get<{ success: boolean; data: any }>(endpoint);
                if (res.data?.success) {
                    const data = res.data.data;
                    setEmployee(data.employee);
                    setActiveBookings(data.activeBookings ?? []);
                    setPastBookings(data.pastBookings ?? []);
                } else {
                    throw new Error(res.data?.message || "Failed to fetch");
                }
            } catch (err: any) {
                setError(err?.response?.data?.message || err?.message || "Network error");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetail();
    }, [id, isSuperAdmin]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#38B000]" />
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-100">
                    {error || "Employee not found"}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
            {/* Back button */}
            <button
                onClick={() => navigate(`${basePath}/employee-management`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Employees
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ─── Left Column: Profile Info ─── */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Green header banner */}
                        <div className="h-24 bg-gradient-to-br from-[#38B000] to-[#2d8c00]" />
                        <div className="px-6 pb-6 -mt-10">
                            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-[#38B000] font-bold text-2xl uppercase">
                                {employee.name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mt-3">{employee.name}</h2>
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mt-2 ${employee.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                {employee.isActive ? "Active" : "Inactive"}
                            </span>

                            <div className="mt-5 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{employee.email}</span>
                                </div>
                                {employee.phone && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span>{employee.phone}</span>
                                    </div>
                                )}
                                {employee.address && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span>{employee.address}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span>Joined {fmtDate(employee.createdAt)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`${basePath}/account/${id}`)}
                                className="mt-5 w-full flex items-center justify-center gap-2 bg-[#38B000] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#2d8c00] transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Overview</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-blue-700">{activeBookings.length}</p>
                                <p className="text-xs text-blue-600 mt-1">Active Tasks</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-gray-700">{pastBookings.length}</p>
                                <p className="text-xs text-gray-600 mt-1">Past Tasks</p>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Calendar */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#38B000]" />
                            Attendance
                        </h3>
                        <AttendanceCalendar />
                    </div>
                </div>

                {/* ─── Right Column: Tasks ─── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Current Assigned Tasks */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-blue-600" />
                            Current Assigned Tasks
                            {activeBookings.length > 0 && (
                                <span className="ml-auto px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">
                                    {activeBookings.length}
                                </span>
                            )}
                        </h3>
                        {activeBookings.length === 0 ? (
                            <div className="text-center py-8">
                                <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">No active tasks assigned</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activeBookings.map((b) => (
                                    <BookingCard
                                        key={b._id}
                                        booking={b}
                                        employeeId={id!}
                                        onClick={() => navigate(`${basePath}/booking/${b._id}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Past Assigned Tasks */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-gray-400" />
                            Past Assigned Tasks
                            {pastBookings.length > 0 && (
                                <span className="ml-auto px-2.5 py-0.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600">
                                    {pastBookings.length}
                                </span>
                            )}
                        </h3>
                        {pastBookings.length === 0 ? (
                            <div className="text-center py-8">
                                <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">No past tasks</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pastBookings.map((b) => (
                                    <BookingCard
                                        key={b._id}
                                        booking={b}
                                        employeeId={id!}
                                        onClick={() => navigate(`${basePath}/booking/${b._id}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetail;
