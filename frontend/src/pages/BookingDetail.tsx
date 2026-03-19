import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import axiosInstance from "../api";
import {
    ArrowLeft, MapPin, Calendar, Clock, Phone, FileText, User,
    Users, Search, X, Check, Loader2, Navigation,
    Timer, Play, Square, Camera, AlertCircle, CheckCircle2, XCircle,
    TrendingUp, CreditCard, Activity, Zap, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";
import AssignEmployeeModal from "../components/AssignEmployeeModal";
import { Booking, AvailableEmployee } from "../types/booking";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(d?: string | Date | null) {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d?: string | Date | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}
function duration(start?: string, end?: string) {
    if (!start || !end) return null;
    const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
function statusStyle(s: string) {
    const m: Record<string, string> = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        assigned: "bg-blue-50 text-blue-700 border-blue-200",
        started: "bg-purple-50 text-purple-700 border-purple-200",
        ended: "bg-indigo-50 text-indigo-700 border-indigo-200",
        completed: "bg-green-50 text-green-700 border-green-200",
        cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return m[s?.toLowerCase()] ?? "bg-gray-100 text-gray-600 border-gray-200";
}
function statusDot(s: string) {
    const m: Record<string, string> = {
        pending: "bg-amber-500 animate-pulse",
        assigned: "bg-blue-500",
        started: "bg-purple-500 animate-pulse",
        ended: "bg-indigo-500",
        completed: "bg-green-500",
        cancelled: "bg-red-500",
    };
    return m[s?.toLowerCase()] ?? "bg-gray-400";
}
function asgnBadge(s: string) {
    const m: Record<string, string> = {
        assigned: "bg-blue-100 text-blue-700",
        started: "bg-purple-100 text-purple-700",
        ended: "bg-indigo-100 text-indigo-700",
        removed: "bg-red-100 text-red-400",
    };
    return m[s] ?? "bg-gray-100 text-gray-600";
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-white rounded-2xl border border-green-700/40 shadow-md overflow-hidden ${className}`}>{children}</div>;
}
/** Sidebar card */
function SideCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-white rounded-2xl border border-green-700/40 shadow-md overflow-hidden ${className}`}>{children}</div>;
}
function CardHead({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#38B000]/10 flex items-center justify-center shrink-0">{icon}</span>
                {title}
            </h3>
            {action && <div>{action}</div>}
        </div>
    );
}

// ─── Photo lightbox ───────────────────────────────────────────────────────────
function Thumb({ url, label }: { url?: string; label: string }) {
    const [open, setOpen] = useState(false);
    if (!url) return (
        <div className="flex flex-col items-center justify-center h-16 w-16 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 shrink-0">
            <Camera className="w-4 h-4 text-gray-300" />
        </div>
    );
    return (
        <>
            <button onClick={() => setOpen(true)}
                className="relative h-16 w-16 rounded-xl overflow-hidden border border-gray-200 shadow-sm shrink-0 hover:scale-105 transition-transform">
                <img src={url} alt={label} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-black/40 text-[8px] text-white text-center font-semibold py-0.5">{label}</div>
            </button>
            {open && (
                <div className="fixed inset-0 z-[500] bg-black/80 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
                    <img src={url} alt={label} className="max-w-2xl max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
                    <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-xl text-white"><X className="w-5 h-5" /></button>
                </div>
            )}
        </>
    );
}
function PhotoBig({ url, label, placeholder }: { url?: string; label: string; placeholder?: string }) {
    const [open, setOpen] = useState(false);
    if (!url) return (
        <div className="flex flex-col items-center justify-center gap-2 h-36 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60">
            <Camera className="w-7 h-7 text-gray-200" />
            <p className="text-xs text-gray-400">{placeholder ?? label}</p>
        </div>
    );
    return (
        <>
            <button onClick={() => setOpen(true)} className="relative group w-full h-36 rounded-xl overflow-hidden border border-green-700/15 shadow-sm">
                <img src={url} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                <div className="absolute bottom-1.5 left-1.5 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-white">{label}</div>
            </button>
            {open && (
                <div className="fixed inset-0 z-[500] bg-black/80 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
                    <img src={url} alt={label} className="max-w-2xl max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
                    <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-xl text-white"><X className="w-5 h-5" /></button>
                </div>
            )}
        </>
    );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, multiline }: { icon: React.ReactNode; label: string; value?: string | null; multiline?: boolean }) {
    return (
        <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">{icon}{label}</p>
            <p className={`text-sm font-semibold text-gray-800 ${multiline ? "leading-relaxed whitespace-pre-line" : "truncate"}`}>{value || "—"}</p>
        </div>
    );
}

// ─── Employee Progress Card ───────────────────────────────────────────────────
function EmployeeProgressCard({ asgn, onStatusChange }: {
    asgn: any;
    onStatusChange?: (employeeId: string, status: string) => Promise<void>;
}) {
    const [expanded, setExpanded] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState("");
    const [confirmStatus, setConfirmStatus] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const emp = asgn.employeeId as any;
    const dur = duration(asgn.startTime, asgn.endTime);
    const startLat = asgn.startLocation?.lat ?? asgn.startLocation?.latitude;
    const startLng = asgn.startLocation?.lng ?? asgn.startLocation?.longitude;
    const endLat = asgn.endLocation?.lat ?? asgn.endLocation?.latitude;
    const endLng = asgn.endLocation?.lng ?? asgn.endLocation?.longitude;

    const openModal = () => { setModalOpen(true); setPendingStatus(""); setConfirmStatus(null); };
    const closeModal = () => { setModalOpen(false); setPendingStatus(""); setConfirmStatus(null); };

    const handleConfirm = async () => {
        if (!confirmStatus || !onStatusChange) return;
        try {
            setSaving(true);
            await onStatusChange(emp?._id, confirmStatus);
            closeModal();
        } finally {
            setSaving(false);
        }
    };

    return (<>
        <div className="border border-green-700/15 rounded-2xl overflow-hidden bg-white shadow-sm">
            {/* Compact header row: avatar, name, status badge, timer, start time, photo thumbs, expand */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-gray-50/80 to-white">
                <div className="w-10 h-10 rounded-xl bg-[#38B000]/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-[#38B000]" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-800 truncate">{emp?.name ?? "Employee"}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wide ${asgnBadge(asgn.status)}`}>{asgn.status}</span>
                        {onStatusChange && (
                            <button onClick={openModal}
                                className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#38B000]/10 text-[#38B000] hover:bg-[#38B000]/20 transition-colors flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" /> Change Status
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {asgn.startTime && (
                            <span className="flex items-center gap-1 text-[11px] text-purple-600 font-semibold">
                                <Play className="w-3 h-3" /> {fmt(asgn.startTime)}
                            </span>
                        )}
                        {dur && (
                            <span className="flex items-center gap-1 text-[11px] text-indigo-600 font-semibold">
                                <Timer className="w-3 h-3" /> {dur}
                            </span>
                        )}
                        {(startLat || endLat) && (
                            <span className="flex items-center gap-1 text-[11px] text-[#38B000] font-semibold">
                                <Navigation className="w-3 h-3" /> Has location data
                            </span>
                        )}
                    </div>
                </div>
                {/* Thumb photos */}
                <div className="flex items-center gap-2 shrink-0">
                    <Thumb url={asgn.startPhoto} label="Start" />
                    <Thumb url={asgn.endPhoto} label="End" />
                </div>
                {/* Expand toggle */}
                <button onClick={() => setExpanded(e => !e)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>


            {/* Expanded detail panel */}
            {expanded && (
                <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50/30">
                    {/* Contact */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {emp?.email && <InfoRow icon={<span className="text-[10px]">✉</span>} label="Email" value={emp.email} />}
                        {emp?.phone && <InfoRow icon={<Phone className="w-3 h-3" />} label="Phone" value={emp.phone} />}
                        <InfoRow icon={<Calendar className="w-3 h-3" />} label="Assigned At" value={fmt(asgn.assignedAt)} />
                        {asgn.startTime && <InfoRow icon={<Play className="w-3 h-3" />} label="Started" value={fmt(asgn.startTime)} />}
                        {asgn.endTime && <InfoRow icon={<Square className="w-3 h-3" />} label="Ended" value={fmt(asgn.endTime)} />}
                        {dur && <InfoRow icon={<Timer className="w-3 h-3" />} label="Duration" value={dur} />}
                    </div>

                    {/* Full size photos */}
                    {(asgn.startPhoto || asgn.endPhoto) && (
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Photos</p>
                            <div className="grid grid-cols-2 gap-3">
                                <PhotoBig url={asgn.startPhoto} label="Start Photo" placeholder="No start photo" />
                                <PhotoBig url={asgn.endPhoto} label="End Photo" placeholder="No end photo" />
                            </div>
                        </div>
                    )}

                    {/* Location maps */}
                    {(startLat || endLat) && (
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Navigation className="w-3 h-3" /> Location Data
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {startLat && (
                                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                        <p className="text-[10px] font-bold text-purple-500 px-3 py-1.5 bg-purple-50 border-b border-purple-100 flex items-center gap-1"><Play className="w-3 h-3" /> Start Location</p>
                                        <div className="p-3">
                                            <p className="text-xs font-mono text-gray-400">{startLat?.toFixed(5)}, {startLng?.toFixed(5)}</p>
                                            {asgn.startLocation?.timestamp && <p className="text-[10px] text-gray-400 mt-0.5">{fmt(asgn.startLocation.timestamp)}</p>}
                                        </div>
                                    </div>
                                )}
                                {endLat && (
                                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                        <p className="text-[10px] font-bold text-green-500 px-3 py-1.5 bg-green-50 border-b border-green-100 flex items-center gap-1"><Square className="w-3 h-3" /> End Location</p>
                                        <div className="p-3">
                                            <p className="text-xs font-mono text-gray-400">{endLat?.toFixed(5)}, {endLng?.toFixed(5)}</p>
                                            {asgn.endLocation?.timestamp && <p className="text-[10px] text-gray-400 mt-0.5">{fmt(asgn.endLocation.timestamp)}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Change Status Modal */}
        {modalOpen && onStatusChange && (
            <div className="fixed inset-0 z-[600] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={closeModal}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                    onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                        <div>
                            <p className="text-sm font-bold text-gray-800">Change Assignment Status</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{emp?.name ?? "Employee"}</p>
                        </div>
                        <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-9 h-9 rounded-lg bg-[#38B000]/10 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-[#38B000]" /></div>
                            <div>
                                <p className="text-xs font-bold text-gray-700">{emp?.name ?? "Employee"}</p>
                                <p className="text-[10px] text-gray-400">Current: <span className="font-bold uppercase">{asgn.status}</span></p>
                            </div>
                        </div>
                        {!confirmStatus ? (
                            <>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">New Status</label>
                                    <select value={pendingStatus} onChange={e => setPendingStatus(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#38B000]/30 bg-white">
                                        <option value="">Select new status...</option>
                                        <option value="assigned">Assigned</option>
                                        <option value="started">Started</option>
                                        <option value="ended">Ended</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                                    <button onClick={() => pendingStatus && setConfirmStatus(pendingStatus)}
                                        disabled={!pendingStatus}
                                        className="flex-1 py-2.5 rounded-xl bg-[#38B000] text-white text-sm font-bold hover:bg-[#2d8c00] transition-colors disabled:opacity-40">
                                        Set Status →
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                                    <p className="text-sm font-semibold text-amber-700">
                                        Change status to <span className="font-black uppercase">{confirmStatus}</span>?
                                    </p>
                                    <p className="text-[11px] text-amber-500 mt-1">This will update the assignment record.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setConfirmStatus(null)}
                                        className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50">Back</button>
                                    <button onClick={handleConfirm} disabled={saving}
                                        className="flex-1 py-2.5 rounded-xl bg-[#38B000] text-white text-sm font-bold hover:bg-[#2d8c00] disabled:opacity-40">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Confirm ✓"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </>);
}

// ─── Reassign Dialog ─────────────────────────────────────────────────────────
type AccountOption = { _id: string; name: string; email: string; role?: any; };
const ROLE_TABS_REASSIGN = [
    { key: "org", label: "Org" }, { key: "user", label: "User" },
    { key: "emp", label: "Employee" }, { key: "admin", label: "Admin" },
    { key: "super-admin", label: "Super Admin" }, { key: "", label: "All" },
] as const;
const PAGE_SIZE = 10;

function ReassignDialog({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (acc: AccountOption) => void; }) {
    const isSuperAdmin = useAuthStore((s) => s.user?.role === "super-admin");
    const ep = isSuperAdmin ? "/super" : "/admin";
    const [accounts, setAccounts] = useState<AccountOption[]>([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("org");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => { setPage(1); }, [search, roleFilter]);
    useEffect(() => {
        if (!open) return;
        setLoading(true);
        axiosInstance.get(`${ep}/accounts`).then((r) => { if ((r.data as any).success) setAccounts((r.data as any).data ?? []); }).catch(() => { }).finally(() => setLoading(false));
    }, [open, ep]);

    const filtered = accounts.filter((a) => {
        const q = search.toLowerCase();
        return (!q || a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a._id?.toLowerCase().includes(q))
            && (!roleFilter || a.role?.name === roleFilter);
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden" style={{ maxHeight: "80vh" }}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                    <div><p className="text-base font-bold text-gray-900">Reassign Booking</p><p className="text-xs text-gray-400 mt-0.5">Select the new account</p></div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="px-6 pt-4 pb-3 border-b border-gray-100 shrink-0 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input autoFocus type="text" placeholder="Search name, email, or ID..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-[#38B000]/30 transition-all" />
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                        {ROLE_TABS_REASSIGN.map((t) => (
                            <button key={t.key} type="button" onClick={() => setRoleFilter(t.key)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${roleFilter === t.key ? "bg-[#38B000] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                    {loading ? <div className="py-12 text-center text-gray-400 text-sm">Loading...</div>
                        : paginated.length === 0 ? <div className="py-12 text-center text-gray-400 text-sm">No accounts match</div>
                            : paginated.map((acc) => (
                                <button key={acc._id} onClick={() => { onSelect(acc); onClose(); }}
                                    className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-[#38B000]/5 transition-colors text-left group">
                                    <div className="w-10 h-10 rounded-xl bg-[#38B000]/10 flex items-center justify-center shrink-0"><User className="w-5 h-5 text-[#38B000]" /></div>
                                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{acc.name}</p><p className="text-xs text-gray-400 truncate">{acc.email}</p></div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-500 shrink-0">{acc.role?.name ?? "—"}</span>
                                </button>
                            ))}
                </div>
                {!loading && filtered.length > PAGE_SIZE && (
                    <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between shrink-0">
                        <p className="text-xs text-gray-400">{filtered.length} accounts · page {page}/{totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 disabled:opacity-40">← Prev</button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 disabled:opacity-40">Next →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BookingDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role === "super-admin";
    const rolePrefix = isSuperAdmin ? "super" : "admin";

    const [booking, setBooking] = useState<Booking | null>(null);
    const [employees, setEmployees] = useState<AvailableEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [newStatus, setNewStatus] = useState("");
    const [allocatedTime, setAllocatedTime] = useState(0);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [confirmStatus, setConfirmStatus] = useState<string | null>(null);
    const [reassignOpen, setReassignOpen] = useState(false);
    const [reassigning, setReassigning] = useState(false);
    const [reassignNotif, setReassignNotif] = useState<string | null>(null);

    const refreshBooking = async () => {
        const { data } = await axiosInstance.get<{ success: boolean; data: Booking[] }>(`${rolePrefix}/bookings`);
        if (data?.success) {
            const found = data.data.find((b) => b._id === id);
            if (found) { setBooking(found); setNewStatus(found.status.toLowerCase()); }
        }
    };

    useEffect(() => {
        if (!id || !user) return;
        setLoading(true);
        refreshBooking().finally(() => setLoading(false));
    }, [id, user, rolePrefix]);

    useEffect(() => {
        if (!user) return;
        axiosInstance.get<{ success: boolean; data: { employees: AvailableEmployee[] } }>(`${rolePrefix}/employees/available`)
            .then(({ data }) => { if (data?.success) setEmployees(data.data.employees || []); }).catch(() => { });
    }, [user, rolePrefix]);

    const handleAssign = async (selectedIds: string[], timeAllocated: number) => {
        if (!id) return;
        try {
            setAssigning(true);
            await axiosInstance.post(`${rolePrefix}/bookings/assign-task`, { bookingId: id, employeeIds: selectedIds, allocatedTime: timeAllocated > 0 ? timeAllocated : undefined });
            await refreshBooking();
            const r = await axiosInstance.get<{ success: boolean; data: { employees: AvailableEmployee[] } }>(`${rolePrefix}/employees/available`);
            if (r.data?.success) setEmployees(r.data.data.employees || []);
            setIsAssignModalOpen(false);
        } catch (err: any) { alert(err?.response?.data?.message || "Failed to assign employee"); }
        finally { setAssigning(false); }
    };

    const handleRemoveEmployee = async (employeeId: string) => {
        if (!id || !window.confirm("Remove this employee from the booking?")) return;
        try {
            setRemovingId(employeeId);
            await axiosInstance.delete(`${rolePrefix}/bookings/${id}/employees/${employeeId}`);
            await refreshBooking();
            const r = await axiosInstance.get<{ success: boolean; data: { employees: AvailableEmployee[] } }>(`${rolePrefix}/employees/available`);
            if (r.data?.success) setEmployees(r.data.data.employees || []);
        } catch (err: any) { alert(err?.response?.data?.message || "Failed to remove employee"); }
        finally { setRemovingId(null); }
    };

    const handleStatusChange = async () => {
        if (!confirmStatus || !id) return;
        try {
            setUpdatingStatus(true);
            await axiosInstance.patch(`${rolePrefix}/bookings/${id}/status`, {
                status: confirmStatus,
                allocatedTime: allocatedTime > 0 ? allocatedTime : undefined,
            });
            await refreshBooking();
            setConfirmStatus(null);
            setNewStatus("");
        } catch (err: any) { alert(err?.response?.data?.message || "Failed to update status"); }
        finally { setUpdatingStatus(false); }
    };

    const handleAssignmentStatusChange = async (employeeId: string, status: string) => {
        if (!id) return;
        await axiosInstance.patch(
            `${rolePrefix}/bookings/${id}/assignments/${employeeId}/status`,
            { status }
        );
        await refreshBooking();
    };

    const handleUpdatePhoto = async (type: "startPhoto" | "endPhoto", url: string) => {
        if (!id) return;
        try {
            await axiosInstance.patch(`${rolePrefix}/bookings/${id}/photos`, { [type]: url });
            await refreshBooking();
        } catch (err: any) { alert(err?.response?.data?.message || "Failed to update photo"); }
    };

    const handleReassign = async (acc: AccountOption) => {
        if (!id) return;
        setReassigning(true);
        try {
            await axiosInstance.patch(`${rolePrefix}/bookings/${id}/reassign`, { userId: acc._id });
            await refreshBooking();
            setReassignNotif(`Reassigned to ${acc.name}`);
            setTimeout(() => setReassignNotif(null), 3500);
        } catch (err: any) { alert(err?.response?.data?.message || "Failed to reassign"); }
        finally { setReassigning(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <RefreshCw className="h-8 w-8 text-[#38B000] animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading booking details...</p>
        </div>
    );
    if (!booking) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <AlertCircle className="h-10 w-10 text-gray-300" />
            <p className="text-gray-500 font-medium">Booking not found</p>
            <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[#38B000] text-white rounded-xl text-sm font-bold">Go Back</button>
        </div>
    );

    const activeAssignments = booking.assignments?.filter(a => a.status !== "removed") || [];
    const removedAssignments = booking.assignments?.filter(a => a.status === "removed") || [];
    const uid = booking.userId as any;

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5 pb-10">

            {/* ── Back + Title bar ─────────────────────────────────────── */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-green-700/20 rounded-xl hover:bg-gray-50 transition-colors shadow-sm shrink-0">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-gray-900 capitalize truncate">{booking.serviceType || "Booking"}</h1>
                    <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">ID: {booking._id}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold uppercase tracking-wide shrink-0 ${statusStyle(booking.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot(booking.status)}`} />
                    {booking.status}
                </div>
            </div>

            {/* ── ROW 1: Quick stat chips ────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { icon: <Calendar className="w-4 h-4 text-[#38B000]" />, label: "Booked For", value: fmtDate(booking.date) },
                    { icon: <Clock className="w-4 h-4 text-blue-500" />, label: "Time Slot", value: booking.timeSlot || "—" },
                    { icon: <Timer className="w-4 h-4 text-purple-500" />, label: "Allocated Time", value: (booking as any).allocatedTime ? `${(booking as any).allocatedTime} min` : "—" },
                    { icon: <CreditCard className="w-4 h-4 text-amber-500" />, label: "Amount", value: (booking as any).amount ? `₹${(booking as any).amount}` : "—" },
                ].map(s => (
                    <Card key={s.label} className="p-4">
                        <div className="flex items-center gap-2 mb-1.5">{s.icon}<span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</span></div>
                        <p className="text-sm font-bold text-gray-800">{s.value}</p>
                    </Card>
                ))}
            </div>

            {/* ── ROW 2: Booking Info | Booked By + Update Status ──────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Booking Information */}
                <Card className="lg:col-span-2">
                    <CardHead icon={<Zap className="w-3.5 h-3.5 text-[#38B000]" />} title="Booking Information" />
                    <div className="p-5 bg-gradient-to-br from-gray-50/40 to-white">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <InfoRow icon={<MapPin className="w-3 h-3 text-[#38B000]" />} label="Service Location" value={booking.address} multiline />
                            <InfoRow icon={<Phone className="w-3 h-3 text-gray-400" />} label="Phone Number" value={booking.phoneNumber} />
                            <InfoRow icon={<Calendar className="w-3 h-3 text-gray-400" />} label="Created At" value={fmt((booking as any).createdAt)} />
                            <InfoRow icon={<CheckCircle2 className="w-3 h-3 text-gray-400" />} label="Completed At" value={fmt((booking as any).completedAt)} />
                            <InfoRow icon={<Activity className="w-3 h-3 text-gray-400" />} label="Payment Status" value={(booking as any).paymentStatus ?? "—"} />
                            <InfoRow icon={<Timer className="w-3 h-3 text-gray-400" />} label="Timer Started" value={fmt((booking as any).timerStartedAt)} />
                        </div>
                        {booking.instruction && (
                            <div className="mt-5 pt-4 border-t border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Special Instructions</p>
                                <p className="text-sm text-gray-700 bg-amber-50/80 border border-amber-100 rounded-xl p-3.5 leading-relaxed">{booking.instruction}</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Booked By + Update Status stacked */}
                <div className="space-y-3">
                    {/* Booked By */}
                    <SideCard>
                        <CardHead
                            icon={<User className="w-3.5 h-3.5 text-[#38B000]" />}
                            title="Booked By"
                            action={
                                <button onClick={() => setReassignOpen(true)} disabled={reassigning}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#38B000]/10 text-[#38B000] text-[11px] font-bold hover:bg-[#38B000]/20 transition-colors disabled:opacity-50">
                                    <Users className="w-3 h-3" />{reassigning ? "..." : "Reassign"}
                                </button>
                            }
                        />
                        <div className="p-3 bg-gray-50/50">
                            <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-gray-100">
                                <div className="w-9 h-9 rounded-lg bg-[#38B000]/10 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-[#38B000]" /></div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-gray-800 truncate">{uid?.name ?? "—"}</p>
                                    <p className="text-[11px] text-gray-500 truncate">{uid?.email ?? "—"}</p>
                                    {uid?.phone && <p className="text-[11px] text-gray-500">{uid.phone}</p>}
                                </div>
                            </div>
                            {reassignNotif && <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#38B000] font-semibold"><Check className="w-3.5 h-3.5" /> {reassignNotif}</div>}
                        </div>
                    </SideCard>

                    {/* Update Status */}
                    <SideCard>
                        <CardHead icon={<Activity className="w-3.5 h-3.5 text-[#38B000]" />} title="Update Status" />
                        <div className="p-3 space-y-2.5 bg-gray-50/50">
                            <select value={newStatus} onChange={(e) => { setNewStatus(e.target.value); setConfirmStatus(null); }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#38B000]/30 bg-white">
                                <option value="">Select status...</option>
                                <option value="pending">Pending</option>
                                <option value="assigned">Assigned</option>
                                <option value="started">Started</option>
                                <option value="ended">Ended</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            {(newStatus === "started" || confirmStatus === "started") && (
                                <input type="number" value={allocatedTime || ""} onChange={(e) => setAllocatedTime(Number(e.target.value))}
                                    placeholder="Allocated time (minutes)"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#38B000]/30" />
                            )}

                            {/* Step 1: Set Status button */}
                            {!confirmStatus && (
                                <button onClick={() => newStatus && setConfirmStatus(newStatus)}
                                    disabled={!newStatus}
                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#38B000] text-white text-sm font-bold hover:bg-[#2d8c00] transition-colors disabled:opacity-40">
                                    Set Status →
                                </button>
                            )}

                            {/* Step 2: Confirm row */}
                            {confirmStatus && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
                                    <p className="text-xs font-semibold text-amber-700 text-center">
                                        Change status to <span className="font-black uppercase">{confirmStatus}</span>?
                                    </p>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setConfirmStatus(null); setNewStatus(""); }}
                                            className="flex-1 py-1.5 rounded-md border border-red-200 bg-white text-red-500 text-xs font-bold hover:bg-red-50 transition-colors">
                                            Cancel
                                        </button>
                                        <button onClick={handleStatusChange} disabled={updatingStatus}
                                            className="flex-1 py-1.5 rounded-md bg-[#38B000] text-white text-xs font-bold hover:bg-[#2d8c00] transition-colors disabled:opacity-40">
                                            {updatingStatus ? <><Loader2 className="w-3 h-3 animate-spin inline mr-1" />...</> : "Confirm ✓"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </SideCard>
                </div>
            </div>

            {/* ── ROW 3: Location (full width) ──────────────────────────── */}
            <Card>
                <CardHead icon={<Navigation className="w-3.5 h-3.5 text-[#38B000]" />} title="Service Location" />
                <div className="p-5 bg-gradient-to-br from-gray-50/30 to-white">
                    {booking.address?.includes("→") ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white border border-green-700/10 rounded-xl p-4 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#38B000] inline-block" /> Starting Point</p>
                                <p className="text-sm font-semibold text-gray-800">{booking.address.split("→")[0].trim()}</p>
                            </div>
                            <div className="bg-white border border-green-700/10 rounded-xl p-4 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Ending Point</p>
                                <p className="text-sm font-semibold text-gray-800">{booking.address.split("→")[1].trim()}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-green-700/10 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                            <MapPin className="w-5 h-5 text-[#38B000] shrink-0" />
                            <p className="text-sm font-semibold text-gray-800">{booking.address}</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* ── ROW 4: Task Progress (full width) ─────────────────────── */}
            <Card>
                <CardHead icon={<TrendingUp className="w-3.5 h-3.5 text-[#38B000]" />} title={`Task Progress (${activeAssignments.length} employee${activeAssignments.length !== 1 ? "s" : ""})`} />
                <div className="p-5 space-y-3 bg-gradient-to-br from-gray-50/20 to-white">
                    {activeAssignments.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-gray-200 bg-gray-100 rounded-xl">
                            <Users className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                            <p className="text-sm text-gray-400 font-medium">No employees assigned yet</p>
                        </div>
                    ) : activeAssignments.map((asgn, i) => (
                        <EmployeeProgressCard
                            key={(asgn.employeeId as any)?._id ?? i}
                            asgn={asgn}
                            onStatusChange={handleAssignmentStatusChange}
                        />
                    ))}
                </div>
            </Card>

            {/* ── ROW 5: Assign Employees | Removed Employees ──────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Assign Employees */}
                <Card>
                    <CardHead
                        icon={<Users className="w-3.5 h-3.5 text-[#38B000]" />}
                        title="Assigned Employees"
                        action={
                            <button onClick={() => setIsAssignModalOpen(true)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#38B000] text-white text-xs font-bold hover:bg-[#2d8c00] transition-colors shadow-sm">
                                + Assign
                            </button>
                        }
                    />
                    <div className="p-4 space-y-2 bg-gradient-to-br from-gray-50/30 to-white min-h-[80px]">
                        {activeAssignments.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                                <Users className="w-6 h-6 text-gray-200 mx-auto mb-1.5" />
                                <p className="text-xs text-gray-400 font-medium">No employees assigned</p>
                            </div>
                        ) : activeAssignments.map((asgn, i) => {
                            const emp = asgn.employeeId as any;
                            return (
                                <div key={emp?._id ?? i} className="flex items-center gap-3 p-3 bg-white border border-green-700/10 rounded-xl shadow-sm">
                                    <div className="w-8 h-8 rounded-lg bg-[#38B000]/10 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-[#38B000]" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-800 truncate">{emp?.name ?? "—"}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${asgnBadge(asgn.status)}`}>{asgn.status}</span>
                                    </div>
                                    <button onClick={() => handleRemoveEmployee(emp?._id)} disabled={removingId === emp?._id}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors disabled:opacity-40">
                                        {removingId === emp?._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Removed Employees */}
                <Card>
                    <CardHead icon={<XCircle className="w-3.5 h-3.5 text-red-400" />} title={`Removed Employees (${removedAssignments.length})`} />
                    <div className="p-4 space-y-2 bg-gradient-to-br from-red-50/10 to-white min-h-[80px]">
                        {removedAssignments.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                                <p className="text-xs text-gray-400 font-medium">No removed employees</p>
                            </div>
                        ) : removedAssignments.map((asgn, i) => {
                            const emp = asgn.employeeId as any;
                            return (
                                <div key={emp?._id ?? i} className="flex items-center gap-3 p-3 bg-red-50/50 border border-red-100 rounded-xl">
                                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-red-400" /></div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-gray-500 line-through truncate">{emp?.name ?? "—"}</p>
                                        <p className="text-[10px] text-red-400 font-semibold">Removed · {fmt(asgn.assignedAt)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* ── ROW 6: Final Job Photos (full width) ─────────────────── */}
            <Card>
                <CardHead
                    icon={<Camera className="w-3.5 h-3.5 text-[#38B000]" />}
                    title="Final Job Photos"
                    action={
                        <div className="flex gap-2">
                            <button onClick={() => { const u = prompt("Start photo URL:"); if (u) handleUpdatePhoto("startPhoto", u); }}
                                className="px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-xs font-bold hover:bg-purple-100 transition-colors">+ Start</button>
                            <button onClick={() => { const u = prompt("End photo URL:"); if (u) handleUpdatePhoto("endPhoto", u); }}
                                className="px-2.5 py-1.5 rounded-lg bg-green-50 text-[#38B000] text-xs font-bold hover:bg-green-100 transition-colors">+ End</button>
                        </div>
                    }
                />
                <div className="p-5 grid grid-cols-2 gap-5 bg-gradient-to-br from-gray-50/30 to-white">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Play className="w-3 h-3 text-purple-400" /> Job Start Photo</p>
                        <PhotoBig url={booking.startPhoto} label="Job Start" placeholder="Not uploaded" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-400" /> Job End Photo</p>
                        <PhotoBig url={booking.endPhoto} label="Job End" placeholder="Not uploaded" />
                    </div>
                </div>
            </Card>

            {/* Modals */}
            <AssignEmployeeModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} employees={employees} onAssign={handleAssign} assigning={assigning} />
            <ReassignDialog open={reassignOpen} onClose={() => setReassignOpen(false)} onSelect={handleReassign} />
        </div>
    );
}
