import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
    ArrowLeft, MapPin, Calendar, Clock, Phone, FileText,
    Sparkles, Trash2, Trees, Droplets, Leaf, Wrench,
    Recycle, Wind, ShoppingBag, Blend, Sun, Zap,
    CheckCircle2, Plus, Navigation, LocateFixed,
    Loader2, X, Search, Check, Users, Camera, User,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axiosInstance from "../api";
import { useAuthStore } from "../stores/auth";
import { Notification } from "../components";

// ─── Leaflet marker icon fix ──────────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Icon registry ────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
    Sparkles: <Sparkles className="w-5 h-5" />,
    Trash2: <Trash2 className="w-5 h-5" />,
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

const TIME_SLOTS = ["08:00-10:00", "10:00-12:00", "12:00-14:00", "14:00-16:00", "16:00-18:00"];

type ServiceOption = { _id: string; title: string; description: string; icon: string; color: string; };
type AccountOption = { _id: string; name: string; email: string; role?: { name: string }; };
type FormValues = { phoneNumber: string; instruction: string; date: string; timeSlot: string; };

// ─── Vanilla Leaflet Map Picker ───────────────────────────────────────────────
interface MapPickerDialogProps {
    open: boolean;
    title: string;
    onClose: () => void;
    onConfirm: (loc: { lat: number; lng: number; address: string }) => void;
    initialLat?: number;
    initialLng?: number;
}

function MapPickerDialog({ open, title, onClose, onConfirm, initialLat, initialLng }: MapPickerDialogProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const [lat, setLat] = useState(initialLat ?? 20.5937);
    const [lng, setLng] = useState(initialLng ?? 78.9629);
    const [address, setAddress] = useState("Click on the map to pick a location");
    const [loading, setLoading] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [hasPicked, setHasPicked] = useState(false);

    const reverseGeocode = async (la: number, ln: number) => {
        setLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${la}&lon=${ln}&format=json`,
                { headers: { "Accept-Language": "en" } }
            );
            const data = await res.json();
            setAddress(data.display_name || `${la.toFixed(5)}, ${ln.toFixed(5)}`);
        } catch { setAddress(`${la.toFixed(5)}, ${ln.toFixed(5)}`); }
        setLoading(false);
    };

    const placeMarker = useCallback((la: number, ln: number) => {
        setLat(la); setLng(ln); setHasPicked(true);
        reverseGeocode(la, ln);
        if (leafletMap.current) {
            markerRef.current?.remove();
            markerRef.current = L.marker([la, ln]).addTo(leafletMap.current);
            leafletMap.current.flyTo([la, ln], leafletMap.current.getZoom());
        }
    }, []);

    // Init Leaflet map (vanilla, no react-leaflet)
    useEffect(() => {
        if (!open || !mapRef.current) return;

        // Small delay to ensure DOM is painted
        const timer = setTimeout(() => {
            if (!mapRef.current || leafletMap.current) return;
            const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false });
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
            map.setView([initialLat ?? lat, initialLng ?? lng], 14);

            map.on("click", (e: L.LeafletMouseEvent) => {
                placeMarker(e.latlng.lat, e.latlng.lng);
            });

            leafletMap.current = map;

            // If initial coords already set, place marker
            if (initialLat && initialLng) {
                placeMarker(initialLat, initialLng);
            }
        }, 80);

        return () => {
            clearTimeout(timer);
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
                markerRef.current = null;
            }
        };
    }, [open]);

    const handleGPS = () => {
        if (!navigator.geolocation) return;
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => { placeMarker(pos.coords.latitude, pos.coords.longitude); setGpsLoading(false); },
            () => setGpsLoading(false),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
                { headers: { "Accept-Language": "en" } }
            );
            const data = await res.json();
            if (data.length > 0) placeMarker(parseFloat(data[0].lat), parseFloat(data[0].lon));
        } catch { }
        setSearching(false);
    };

    useEffect(() => { if (open && !initialLat && !initialLng) handleGPS(); }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ height: "82vh" }}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                    <div>
                        <p className="text-base font-bold text-gray-900">{title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Click map, search, or use GPS</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleGPS} disabled={gpsLoading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#38B000]/10 text-[#38B000] text-sm font-semibold hover:bg-[#38B000]/20 transition-colors disabled:opacity-50">
                            {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                            My Location
                        </button>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="px-5 py-3 border-b border-gray-100 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search for a place..."
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#38B000]/30 transition-all"
                        />
                        <button onClick={handleSearch} disabled={searching}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#38B000] text-white text-xs font-bold rounded-lg hover:bg-[#2d8c00] disabled:opacity-50 transition-colors">
                            {searching ? "..." : "Search"}
                        </button>
                    </div>
                </div>

                {/* Vanilla Leaflet container */}
                <div ref={mapRef} className="flex-1 min-h-0" style={{ zIndex: 0 }} />

                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-400 mb-0.5">
                                {loading ? "Finding address..." : "Selected location"}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                                {hasPicked ? address : "Click on the map to select a point"}
                            </p>
                            {hasPicked && <p className="text-xs text-gray-400 mt-0.5">{lat.toFixed(5)}, {lng.toFixed(5)}</p>}
                        </div>
                        <button onClick={() => onConfirm({ lat, lng, address })} disabled={!hasPicked || loading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#38B000] text-white rounded-xl font-bold text-sm hover:bg-[#2d8c00] transition-colors disabled:opacity-40 shadow-md shadow-green-500/20 shrink-0">
                            <Check className="w-4 h-4" /> Use Location
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Assign to Account Dialog ─────────────────────────────────────────────────
interface AccountPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (acc: AccountOption | null) => void;
    baseEndpoint: string;
}

const ROLE_TABS = [
    { key: "org", label: "Org" },
    { key: "user", label: "User" },
    { key: "emp", label: "Employee" },
    { key: "admin", label: "Admin" },
    { key: "super-admin", label: "Super Admin" },
    { key: "", label: "All" },
] as const;

const PAGE_SIZE = 10;

function AccountPickerDialog({ open, onClose, onSelect, baseEndpoint }: AccountPickerProps) {
    const [accounts, setAccounts] = useState<AccountOption[]>([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("org");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        axiosInstance.get(`${baseEndpoint}/accounts`)
            .then((res) => { if ((res.data as any).success) setAccounts((res.data as any).data ?? []); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [open, baseEndpoint]);

    // Reset page when filters change
    useEffect(() => { setPage(1); }, [search, roleFilter]);

    const filtered = accounts.filter((a) => {
        const q = search.toLowerCase();
        const matchesSearch = !q || (
            a.name?.toLowerCase().includes(q) ||
            a.email?.toLowerCase().includes(q) ||
            a._id?.toLowerCase().includes(q)
        );
        const roleName = (a.role as any)?.name ?? "";
        const matchesRole = !roleFilter || roleName === roleFilter;
        return matchesSearch && matchesRole;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden" style={{ maxHeight: "80vh" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                    <div>
                        <p className="text-base font-bold text-gray-900">Assign to Account</p>
                        <p className="text-xs text-gray-400 mt-0.5">Search by name, email, or ID</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 pt-4 pb-3 border-b border-gray-100 shrink-0 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search name, email, or ID..."
                            value={search} onChange={(e) => setSearch(e.target.value)} autoFocus
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#38B000]/30 transition-all"
                        />
                    </div>
                    {/* Role Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                        {ROLE_TABS.map((tab) => (
                            <button key={tab.key} type="button" onClick={() => setRoleFilter(tab.key)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${roleFilter === tab.key
                                    ? "bg-[#38B000] text-white shadow-sm shadow-green-500/20"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    }`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                    {/* Default myself option */}
                    <button onClick={() => { onSelect(null); onClose(); }}
                        className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors text-left">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Assign to myself (default)</p>
                            <p className="text-xs text-gray-400">Booking will be created under your account</p>
                        </div>
                    </button>

                    {loading ? (
                        <div className="py-12 text-center text-gray-400 text-sm">Loading accounts...</div>
                    ) : paginated.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm">No accounts match your filter</div>
                    ) : (
                        paginated.map((acc) => (
                            <button key={acc._id} onClick={() => { onSelect(acc); onClose(); }}
                                className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-[#38B000]/5 transition-colors text-left group">
                                <div className="w-10 h-10 rounded-xl bg-[#38B000]/10 flex items-center justify-center shrink-0 group-hover:bg-[#38B000]/20 transition-colors">
                                    <User className="w-5 h-5 text-[#38B000]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{acc.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{acc.email}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-500">
                                        {(acc.role as any)?.name ?? "—"}
                                    </span>
                                    <span className="text-[9px] font-mono text-gray-300 hidden sm:block">
                                        {acc._id.slice(-6)}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {!loading && filtered.length > PAGE_SIZE && (
                    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
                        <p className="text-xs text-gray-400">
                            {filtered.length} accounts · page {page} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-40 transition-all">
                                ← Prev
                            </button>
                            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-40 transition-all">
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CreateBookingAdmin() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role === "super-admin";
    const baseEndpoint = isSuperAdmin ? "/super" : "/admin";
    const basePath = isSuperAdmin ? "/dashboard/super-admin" : "/dashboard/admin";

    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [services, setServices] = useState<ServiceOption[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);

    // Assign to account
    const [assignedAccount, setAssignedAccount] = useState<AccountOption | null>(null);
    const [accountPickerOpen, setAccountPickerOpen] = useState(false);

    // Photo reference
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Location
    const [locationMode, setLocationMode] = useState<"single" | "range">("single");
    const [address, setAddress] = useState("");
    const [startAddress, setStartAddress] = useState("");
    const [endAddress, setEndAddress] = useState("");
    const [mapOpen, setMapOpen] = useState(false);
    const [mapTarget, setMapTarget] = useState<"single" | "start" | "end">("single");
    const [singleCoords, setSingleCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [endCoords, setEndCoords] = useState<{ lat: number; lng: number } | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();

    const locationValid = locationMode === "single" ? !!address : (!!startAddress && !!endAddress);

    useEffect(() => {
        axiosInstance.get(`${baseEndpoint}/services/all`)
            .then((res) => { if ((res.data as any).success) setServices((res.data as any).data?.filter((s: any) => s.isActive) ?? []); })
            .catch(() => { })
            .finally(() => setLoadingServices(false));
    }, [baseEndpoint]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setPhotoFile(f);
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
        reader.readAsDataURL(f);
    };

    const openMap = (target: "single" | "start" | "end") => { setMapTarget(target); setMapOpen(true); };

    const handleMapConfirm = (loc: { lat: number; lng: number; address: string }) => {
        if (mapTarget === "single") { setAddress(loc.address); setSingleCoords(loc); }
        else if (mapTarget === "start") { setStartAddress(loc.address); setStartCoords(loc); }
        else { setEndAddress(loc.address); setEndCoords(loc); }
        setMapOpen(false);
    };

    const onSubmit = async (data: FormValues) => {
        if (!selectedServiceId || !locationValid) return;
        const finalAddress = locationMode === "single" ? address : `${startAddress} → ${endAddress}`;
        try {
            const payload: any = {
                ...data,
                serviceId: selectedServiceId,
                address: finalAddress,
            };
            if (assignedAccount) payload.userId = assignedAccount._id;

            const res = await axiosInstance.post(`${baseEndpoint}/bookings`, payload);
            if ((res.data as any).success) {
                setNotification({ message: "Booking created successfully!", type: "success" });
                setTimeout(() => navigate(`${basePath}/all-bookings`), 1500);
            } else {
                setNotification({ message: (res.data as any).message || "Something went wrong", type: "error" });
            }
        } catch (err: any) {
            setNotification({ message: err?.response?.data?.message || "Failed to create booking", type: "error" });
        }
    };

    const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38B000]/50 focus:border-[#38B000] transition-all text-sm";
    const sectionCls = "bg-white rounded-2xl border border-green-700/15 shadow-sm p-6";
    const sectionHead = "text-sm font-bold text-gray-800 mb-5 flex items-center gap-2.5";

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-green-700/20 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Booking</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Schedule a new service booking</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* ── Service Selection ──────────────────────────────────────── */}
                <div className={sectionCls}>
                    <h2 className={sectionHead}>
                        <span className="w-8 h-8 rounded-xl bg-[#38B000]/10 flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-[#38B000]" /></span>
                        Select Service
                    </h2>
                    {loadingServices ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 animate-pulse">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-100 border border-gray-100" />)}
                        </div>
                    ) : services.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
                            <Sparkles className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-500">No active services. Add some in Services Manager.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                            {services.map((svc) => {
                                const active = selectedServiceId === svc._id;
                                return (
                                    <button key={svc._id} type="button" onClick={() => setSelectedServiceId(svc._id)}
                                        className={`relative text-left p-4 rounded-2xl transition-all border-2 ${active ? "border-[#38B000] bg-[#38B000]/5 shadow-md shadow-green-500/10" : "border-green-700/15 bg-white hover:border-green-700/30"}`}>
                                        {active && <div className="absolute top-2 right-2"><CheckCircle2 className="w-4 h-4 text-[#38B000]" /></div>}
                                        <div className={`w-10 h-10 rounded-xl ${svc.color} flex items-center justify-center mb-3`}>
                                            {ICON_MAP[svc.icon] ?? <Sparkles className="w-5 h-5" />}
                                        </div>
                                        <p className="text-sm font-bold text-gray-800 leading-tight">{svc.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{svc.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {!selectedServiceId && !loadingServices && services.length > 0 && (
                        <p className="text-xs text-amber-600 mt-3 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                            Please select a service type to continue
                        </p>
                    )}
                </div>

                {/* ── Location ──────────────────────────────────────────────── */}
                <div className={sectionCls}>
                    <h2 className={sectionHead}>
                        <span className="w-8 h-8 rounded-xl bg-[#38B000]/10 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-[#38B000]" /></span>
                        Service Location
                    </h2>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        {(["single", "range"] as const).map((mode) => (
                            <button key={mode} type="button" onClick={() => setLocationMode(mode)}
                                className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 text-left transition-all ${locationMode === mode ? "border-[#38B000] bg-[#38B000]/5" : "border-green-700/15 bg-white hover:border-green-700/25"}`}>
                                {mode === "single"
                                    ? <MapPin className={`w-4 h-4 shrink-0 ${locationMode === "single" ? "text-[#38B000]" : "text-gray-400"}`} />
                                    : <Navigation className={`w-4 h-4 shrink-0 ${locationMode === "range" ? "text-[#38B000]" : "text-gray-400"}`} />}
                                <div>
                                    <p className={`text-sm font-bold ${locationMode === mode ? "text-[#38B000]" : "text-gray-700"}`}>
                                        {mode === "single" ? "Single Location" : "Start → End"}
                                    </p>
                                    <p className="text-xs text-gray-400">{mode === "single" ? "One address" : "Pickup & drop-off"}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {locationMode === "single" ? (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                            <div className="relative">
                                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Click 'Pick on Map' or type address" className={inputCls + " pr-36"} />
                                <button type="button" onClick={() => openMap("single")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-[#38B000]/10 text-[#38B000] rounded-lg text-xs font-bold hover:bg-[#38B000]/20 transition-colors">
                                    <MapPin className="w-3 h-3" /> Pick on Map
                                </button>
                            </div>
                            {singleCoords && <p className="text-xs text-gray-400 mt-1.5 ml-1">📍 {singleCoords.lat.toFixed(5)}, {singleCoords.lng.toFixed(5)}</p>}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Start */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#38B000]" /> Starting Location *
                                </label>
                                <div className="relative">
                                    <input type="text" value={startAddress} onChange={(e) => setStartAddress(e.target.value)}
                                        placeholder="Start address..." className={inputCls + " pr-36"} />
                                    <button type="button" onClick={() => openMap("start")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-[#38B000]/10 text-[#38B000] rounded-lg text-xs font-bold hover:bg-[#38B000]/20 transition-colors">
                                        <MapPin className="w-3 h-3" /> Pick on Map
                                    </button>
                                </div>
                                {startCoords && <p className="text-xs text-gray-400 mt-1 ml-1">📍 {startCoords.lat.toFixed(5)}, {startCoords.lng.toFixed(5)}</p>}
                            </div>
                            <div className="flex items-center gap-3 px-2">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-[#38B000]" />
                                    <div className="w-px h-5 border-l border-dashed border-[#38B000]/50" />
                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                </div>
                                <span className="text-xs text-gray-400 font-medium">Route</span>
                            </div>
                            {/* End */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Ending Location *
                                </label>
                                <div className="relative">
                                    <input type="text" value={endAddress} onChange={(e) => setEndAddress(e.target.value)}
                                        placeholder="End address..." className={inputCls + " pr-36"} />
                                    <button type="button" onClick={() => openMap("end")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-[#38B000]/10 text-[#38B000] rounded-lg text-xs font-bold hover:bg-[#38B000]/20 transition-colors">
                                        <MapPin className="w-3 h-3" /> Pick on Map
                                    </button>
                                </div>
                                {endCoords && <p className="text-xs text-gray-400 mt-1 ml-1">📍 {endCoords.lat.toFixed(5)}, {endCoords.lng.toFixed(5)}</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Booking Details ────────────────────────────────────────── */}
                <div className={sectionCls}>
                    <h2 className={sectionHead}>
                        <span className="w-8 h-8 rounded-xl bg-[#38B000]/10 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-[#38B000]" /></span>
                        Booking Details
                    </h2>
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone Number *
                                </label>
                                <input type="tel" {...register("phoneNumber", {
                                    required: "Phone is required",
                                    pattern: { value: /^[0-9+\s-]{7,15}$/, message: "Invalid phone" },
                                })} placeholder="e.g. +91 98765 43210" className={inputCls} />
                                {errors.phoneNumber && <p className="text-xs text-red-500 mt-1.5">{errors.phoneNumber.message}</p>}
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Date *
                                </label>
                                <input type="date" {...register("date", { required: "Date is required" })}
                                    min={new Date().toISOString().split("T")[0]} className={inputCls} />
                                {errors.date && <p className="text-xs text-red-500 mt-1.5">{errors.date.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" /> Time Slot *
                                </label>
                                <select {...register("timeSlot", { required: "Time slot is required" })} className={inputCls}>
                                    <option value="">Select a time slot</option>
                                    {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {errors.timeSlot && <p className="text-xs text-red-500 mt-1.5">{errors.timeSlot.message}</p>}
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                                    <FileText className="w-3.5 h-3.5 text-gray-400" /> Special Instructions
                                </label>
                                <input {...register("instruction")} placeholder="Gate code, access notes..." className={inputCls} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Assign to Account + Photo ──────────────────────────────── */}
                <div className={sectionCls}>
                    <h2 className={sectionHead}>
                        <span className="w-8 h-8 rounded-xl bg-[#38B000]/10 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-[#38B000]" /></span>
                        Assignment & Reference
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Assign to Account */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Assign to Account</label>
                            <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-green-700/15 bg-gray-50">
                                <div className="w-9 h-9 rounded-xl bg-[#38B000]/10 flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-[#38B000]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {assignedAccount ? (
                                        <>
                                            <p className="text-sm font-bold text-gray-800 truncate">{assignedAccount.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{assignedAccount.email}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm font-semibold text-gray-500">Myself (default)</p>
                                            <p className="text-xs text-gray-400">Booking under your account</p>
                                        </>
                                    )}
                                </div>
                                <button type="button" onClick={() => setAccountPickerOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#38B000] text-white text-xs font-bold hover:bg-[#2d8c00] transition-colors shrink-0">
                                    <Users className="w-3.5 h-3.5" /> Choose
                                </button>
                            </div>
                            {assignedAccount && (
                                <button type="button" onClick={() => setAssignedAccount(null)}
                                    className="text-xs text-gray-400 hover:text-gray-600 mt-1.5 ml-1 underline">
                                    Reset to myself
                                </button>
                            )}
                        </div>

                        {/* Photo Reference */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Photo Reference <span className="font-normal text-gray-400">(optional)</span></label>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            {photoPreview ? (
                                <div className="relative rounded-2xl overflow-hidden border-2 border-green-700/15" style={{ height: "100px" }}>
                                    <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border-2 border-dashed border-green-700/20 bg-gray-50 hover:border-[#38B000]/50 hover:bg-[#38B000]/5 transition-all text-gray-400 hover:text-[#38B000]">
                                    <Camera className="w-6 h-6" />
                                    <span className="text-xs font-semibold">Upload reference photo</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Actions ────────────────────────────────────────────────── */}
                <div className="flex gap-4">
                    <button type="button" onClick={() => navigate(-1)}
                        className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-600 bg-white hover:bg-gray-50 border border-green-700/20 transition-colors shadow-sm">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting || !selectedServiceId || !locationValid}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-[#38B000] hover:bg-[#2d8c00] transition-colors disabled:opacity-50 shadow-lg shadow-[#38B000]/20">
                        {isSubmitting
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                            : <><Plus className="w-4 h-4" /> Create Booking</>}
                    </button>
                </div>
            </form>

            {/* Dialogs */}
            <MapPickerDialog
                open={mapOpen} title={mapTarget === "single" ? "Pick Service Location" : mapTarget === "start" ? "Pick Starting Location" : "Pick Ending Location"}
                onClose={() => setMapOpen(false)} onConfirm={handleMapConfirm}
                initialLat={mapTarget === "single" ? singleCoords?.lat : mapTarget === "start" ? startCoords?.lat : endCoords?.lat}
                initialLng={mapTarget === "single" ? singleCoords?.lng : mapTarget === "start" ? startCoords?.lng : endCoords?.lng}
            />
            <AccountPickerDialog open={accountPickerOpen} onClose={() => setAccountPickerOpen(false)}
                onSelect={setAssignedAccount} baseEndpoint={baseEndpoint} />

            {notification && (
                <div className="fixed top-5 right-5 z-50">
                    <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
                </div>
            )}
        </div>
    );
}
