import { useEffect, useState } from "react";
import axiosInstance from "../api";
import { useAuthStore } from "../stores/auth";
import { toast } from "react-toastify";
import { Calendar, Clock, User, X } from "lucide-react";

/* ---------- role-based endpoints ---------- */
const ENDPOINTS: Record<string, string> = {
    user: "/user/my-bookings",
    org: "/org/my-bookings",
};

type Booking = {
    _id: string;
    address: string;
    phoneNumber: string;
    date: string;
    timeSlot: string;
    status: string;
    amount?: number;
    employeeId?: { name: string; phone: string };
    review?: { rating: number; comment: string };
};

export default function MyBookings() {
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Booking | null>(null);

    /* ---------- fetch ---------- */
    useEffect(() => {
        if (!user) return;

        (async () => {
            try {
                const endpoint = ENDPOINTS[user.role] ?? ENDPOINTS.user;
                const { data } = await axiosInstance.get(endpoint);
                console.log(axiosInstance.get(endpoint))
                setBookings((data as any).data.bookings);
            } catch (err: any) {
                toast.error(
                    err?.response?.data?.message || "Failed to load bookings"
                );
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    /* ---------- util ---------- */
    const statusColor = (s: string) =>
        ({
            pending: "bg-yellow-100 text-yellow-700",
            assigned: "bg-blue-100 text-blue-700",
            in_progress: "bg-purple-100 text-purple-700",
            completed: "bg-green-100 text-green-700",
            cancelled: "bg-red-100 text-red-700",
        }[s] ?? "bg-gray-100 text-gray-700");

    /* ---------- render ---------- */
    if (loading)
        return (
            <div className="p-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="h-40 bg-gray-200 animate-pulse rounded-xl"
                    />
                ))}
            </div>
        );

    if (!bookings.length)
        return (
            <div className="p-8 text-center text-gray-500">
                No bookings yet. Create one first!
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">
                {user?.role === "org" ? "Organisation" : "My"} Bookings
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((b) => (
                    <div
                        key={b._id}
                        onClick={() => setSelected(b)}
                        className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-lg transition space-y-2"
                    >
                        <div className="flex justify-between items-center">
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${statusColor(
                                    b.status
                                )}`}
                            >
                                {b.status}
                            </span>
                            {b.review && (
                                <span className="text-yellow-400 text-sm">
                                    ★ {b.review.rating}
                                </span>
                            )}
                        </div>

                        <p className="text-gray-800 font-medium">{b.address}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />{" "}
                                {new Date(b.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={14} /> {b.timeSlot}
                            </div>
                        </div>

                        {b.employeeId && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <User size={14} /> {b.employeeId.name}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ---------- detail sheet ---------- */}
            {selected && (
                <div
                    className="fixed inset-0 bg-black/30 flex items-center justify-center p-4"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 max-w-md w-full space-y-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">
                                Booking Details
                            </h3>
                            <button
                                onClick={() => setSelected(null)}
                                className="text-gray-500 hover:text-black"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p>
                            <span className="font-medium">Address:</span>{" "}
                            {selected.address}
                        </p>
                        <p>
                            <span className="font-medium">Date:</span>{" "}
                            {new Date(selected.date).toLocaleDateString()}
                        </p>
                        <p>
                            <span className="font-medium">Slot:</span>{" "}
                            {selected.timeSlot}
                        </p>
                        <p>
                            <span className="font-medium">Status:</span>{" "}
                            {selected.status}
                        </p>

                        <button
                            onClick={() => setSelected(null)}
                            className="mt-4 w-full py-2.5 rounded-lg font-semibold text-white bg-primary hover:bg-hover-color"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
