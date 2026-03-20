import { useEffect, useState } from "react";
import axiosInstance from "../api";
import { useAuthStore } from "../stores/auth";
import { toast } from "react-toastify";
import {
    Calendar, Clock, X, MapPin, Timer, Play, Square,
    Camera, CheckCircle2, AlertCircle, RefreshCw,
} from "lucide-react";

/* ---------- role-based endpoints ---------- */
const ENDPOINTS: Record<string, string> = {
    user: "/user/my-bookings",
    org: "/org/my-bookings",
};

type Assignment = {
    employeeId: { _id?: string; /* name & phone intentionally hidden */ };
    status: string;
    assignedAt?: string;
    startTime?: string;
    endTime?: string;
    startPhoto?: string;
    endPhoto?: string;
};

type Booking = {
    _id: string;
    address: string;
    phoneNumber?: string;
    date: string;
    timeSlot: string;
    status: string;
    serviceType?: string;
    instruction?: string;
    amount?: number;
    createdAt?: string;
    completedAt?: string;
    timerStartedAt?: string;
    startPhoto?: string;
    endPhoto?: string;
    assignments?: Assignment[];
    review?: { rating: number; comment: string };
};

/* ---------- helpers ---------- */
function fmt(d?: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}
function fmtDate(d?: string) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}
function dur(start?: string, end?: string) {
    if (!start || !end) return null;
    const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    assigned: "bg-blue-100 text-blue-700 border-blue-200",
    started: "bg-purple-100 text-purple-700 border-purple-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
};
function StatusBadge({ s }: { s: string }) {
    const cls = statusColors[s?.toLowerCase()] ?? "bg-gray-100 text-gray-600 border-gray-200";
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${cls}`}>
            {s}
        </span>
    );
}

/* ---------- Photo thumbnail ---------- */
function PhotoThumb({ url, label }: { url?: string; label: string }) {
    const [open, setOpen] = useState(false);
    if (!url) return (
        <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
            <Camera className="w-4 h-4 text-gray-300" />
        </div>
    );
    return (
        <>
            <button onClick={() => setOpen(true)} className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 shrink-0 hover:scale-105 transition-transform">
                <img src={url} alt={label} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-[8px] text-white text-center py-0.5 font-semibold">{label}</div>
            </button>
            {open && (
                <div className="fixed inset-0 z-[600] bg-black/80 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
                    <img src={url} alt={label} className="max-w-lg max-h-[80vh] rounded-2xl object-contain shadow-2xl" />
                    <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-xl text-white"><X className="w-5 h-5" /></button>
                </div>
            )}
        </>
    );
}

/* ---------- Assignment progress row (privacy-safe) ---------- */
function AssignmentRow({ asgn, index }: { asgn: Assignment; index: number }) {
    const empId = (asgn.employeeId as any)?._id ?? `EMP-${index + 1}`;
    const short = empId.slice(-6).toUpperCase(); // last 6 chars of ID
    const duration = dur(asgn.startTime, asgn.endTime);
    const asnColors: Record<string, string> = {
        assigned: "bg-blue-100 text-blue-700",
        started: "bg-purple-100 text-purple-700",
        completed: "bg-green-100 text-green-700",
    };
    const cls = asnColors[asgn.status] ?? "bg-gray-100 text-gray-600";

    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-2">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    {/* Employee ID only - name/phone hidden for privacy */}
                    <span className="font-mono text-xs font-bold text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded-md">
                        #{short}
                    </span>
                    {/* {asgn.employeeId?.name} — hidden for privacy */}
                    {/* {asgn.employeeId?.phone} — hidden for privacy */}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${cls}`}>{asgn.status}</span>
            </div>

            {/* Timeline chips */}
            <div className="flex flex-wrap gap-2 text-[10px]">
                {asgn.startTime && (
                    <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-semibold">
                        <Play className="w-2.5 h-2.5" /> Started: {fmt(asgn.startTime)}
                    </span>
                )}
                {asgn.endTime && (
                    <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-semibold">
                        <Square className="w-2.5 h-2.5" /> Ended: {fmt(asgn.endTime)}
                    </span>
                )}
                {duration && (
                    <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold">
                        <Timer className="w-2.5 h-2.5" /> {duration}
                    </span>
                )}
            </div>

            {/* Photos */}
            {(asgn.startPhoto || asgn.endPhoto) && (
                <div className="flex items-center gap-2 pt-1">
                    <PhotoThumb url={asgn.startPhoto} label="Start" />
                    <PhotoThumb url={asgn.endPhoto} label="End" />
                </div>
            )}
        </div>
    );
}

/* ---------- Detail Modal ---------- */
function DetailModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
    // Only active (non-removed) assignments
    const activeAssignments = booking.assignments?.filter(a => a.status !== "removed") ?? [];

    return (
        <div className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 pt-10 overflow-y-auto"
            onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                    <div>
                        <h3 className="text-base font-bold text-gray-800 capitalize">{booking.serviceType || "Booking Details"}</h3>
                        <p className="text-[10px] font-mono text-gray-400 mt-0.5">ID: {booking._id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge s={booking.status} />
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
                    </div>
                </div>

                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Quick info */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: <Calendar className="w-3 h-3" />, label: "Date", val: fmtDate(booking.date) },
                            { icon: <Clock className="w-3 h-3" />, label: "Time Slot", val: booking.timeSlot },
                            { icon: <MapPin className="w-3 h-3" />, label: "Location", val: booking.address },
                            { icon: <CheckCircle2 className="w-3 h-3" />, label: "Booked On", val: fmt(booking.createdAt) },
                        ].map(r => (
                            <div key={r.label} className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-1">{r.icon}{r.label}</p>
                                <p className="text-xs font-semibold text-gray-800">{r.val}</p>
                            </div>
                        ))}
                    </div>

                    {/* Instructions */}
                    {booking.instruction && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Instructions</p>
                            <p className="text-xs text-gray-700 leading-relaxed">{booking.instruction}</p>
                        </div>
                    )}

                    {/* Completion info */}
                    {booking.completedAt && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Completed</p>
                                <p className="text-xs font-semibold text-gray-700">{fmt(booking.completedAt)}</p>
                            </div>
                        </div>
                    )}

                    {/* Job timer */}
                    {booking.timerStartedAt && (
                        <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2">
                            <Timer className="w-4 h-4 text-purple-500 shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Job Timer Started</p>
                                <p className="text-xs font-semibold text-gray-700">{fmt(booking.timerStartedAt)}</p>
                            </div>
                        </div>
                    )}

                    {/* Final job photos */}
                    {(booking.startPhoto || booking.endPhoto) && (
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Camera className="w-3 h-3" /> Job Photos
                            </p>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <p className="text-[9px] text-gray-400 font-semibold mb-1.5 flex items-center gap-1"><Play className="w-2.5 h-2.5 text-purple-400" /> Start</p>
                                    <PhotoThumb url={booking.startPhoto} label="Job Start" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] text-gray-400 font-semibold mb-1.5 flex items-center gap-1"><Square className="w-2.5 h-2.5 text-green-400" /> End</p>
                                    <PhotoThumb url={booking.endPhoto} label="Job End" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Task Progress — active employees only, privacy-safe */}
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Task Progress
                            <span className="ml-1 text-gray-300 font-normal">(employee IDs only for privacy)</span>
                        </p>
                        {activeAssignments.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                                <p className="text-xs text-gray-400">No employees currently assigned</p>
                            </div>
                        ) : activeAssignments.map((asgn, i) => (
                            <AssignmentRow key={i} asgn={asgn} index={i} />
                        ))}
                    </div>

                    {/* Rating */}
                    {booking.review && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Your Rating</p>
                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <span key={n} className={`text-lg ${n <= booking.review!.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                                ))}
                                <span className="text-xs font-bold text-gray-600 ml-1">{booking.review.rating}/5</span>
                            </div>
                            {booking.review.comment && <p className="text-xs text-gray-600 mt-1 italic">"{booking.review.comment}"</p>}
                        </div>
                    )}
                </div>

                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60">
                    <button onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-[#38B000] text-white text-sm font-bold hover:bg-[#2d8c00] transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ---------- Main ---------- */
export default function MyBookings() {
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Booking | null>(null);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const endpoint = ENDPOINTS[user.role] ?? ENDPOINTS.user;
                const { data } = await axiosInstance.get(endpoint);
                setBookings((data as any).data?.bookings ?? (data as any).data ?? []);
            } catch (err: any) {
                toast.error(err?.response?.data?.message || "Failed to load bookings");
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
            <RefreshCw className="w-8 h-8 text-[#38B000] animate-spin" />
            <p className="text-sm text-gray-400">Loading your bookings...</p>
        </div>
    );

    if (!bookings.length) return (
        <div className="p-8 text-center text-gray-500">No bookings yet.</div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">
                {user?.role === "org" ? "Organisation" : "My"} Bookings
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((b) => {
                    const activeCount = b.assignments?.filter(a => a.status !== "removed").length ?? 0;
                    return (
                        <div key={b._id}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow space-y-3"
                            onClick={() => setSelected(b)}>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 capitalize truncate">{b.serviceType || "Booking"}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{b.address}</span>
                                    </div>
                                </div>
                                <StatusBadge s={b.status} />
                            </div>

                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(b.date)}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.timeSlot}</span>
                            </div>

                            {activeCount > 0 && (
                                <div className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                    {activeCount} employee{activeCount !== 1 ? "s" : ""} assigned
                                </div>
                            )}

                            {b.review && (
                                <p className="text-xs text-amber-500 font-semibold">★ Rated {b.review.rating}/5</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {selected && <DetailModal booking={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}
