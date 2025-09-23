import { useEffect, useState } from "react";
import axiosInstance from "../api";
import { useAuthStore } from "../stores/auth";
import { toast } from "react-toastify";
import { Edit, Trash2, Star, Calendar, Clock } from "lucide-react";

/* ---------- role-based endpoints ---------- */
const ENDPOINTS: Record<string, string> = {
    user: "/user/reviews",
    org: "/org/reviews",
};

type Review = {
    _id: string;
    rating: number;
    comment: string;
    bookingId: {
        address: string;
        date: string;
        timeSlot: string;
    };
};

export default function MyReviews() {
    const { user } = useAuthStore();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    /* ---------- fetch ---------- */
    useEffect(() => {
        if (!user) return;
        const endpoint = ENDPOINTS[user.role] ?? ENDPOINTS.user;

        (async () => {
            try {
                const { data } = await axiosInstance.get(endpoint);
                setReviews((data as any).data.reviews);
            } catch (err: any) {
                toast.error(
                    err?.response?.data?.message || "Failed to load reviews"
                );
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    /* ---------- delete ---------- */
    const handleDelete = async (id: string) => {
        if (!confirm("Delete this review?")) return;
        try {
            await axiosInstance.delete(`/reviews/${id}`);
            setReviews((prev) => prev.filter((r) => r._id !== id));
            toast.success("Review deleted");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Delete failed");
        }
    };

    /* ---------- update ---------- */
    const handleUpdate = async (id: string) => {
        try {
            await axiosInstance.patch(`/reviews/${id}`, { rating, comment });
            setReviews((prev) =>
                prev.map((r) => (r._id === id ? { ...r, rating, comment } : r))
            );
            toast.success("Review updated");
            setEditId(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Update failed");
        }
    };

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

    if (!reviews.length)
        return (
            <div className="p-8 text-center text-gray-500">
                You haven’t left any reviews yet.
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">My Reviews</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((r) => (
                    <div
                        key={r._id}
                        className="bg-white rounded-xl shadow p-4 space-y-2"
                    >
                        {/* booking info */}
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-800 font-medium">
                                    {r.bookingId.address}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />{" "}
                                        {new Date(
                                            r.bookingId.date
                                        ).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />{" "}
                                        {r.bookingId.timeSlot}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setEditId(r._id);
                                        setRating(r.rating);
                                        setComment(r.comment);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(r._id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* stars + comment */}
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <Star
                                    key={n}
                                    size={14}
                                    className={
                                        n <= r.rating
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-300"
                                    }
                                />
                            ))}
                        </div>
                        <p className="text-sm text-gray-700">{r.comment}</p>

                        {/* inline edit form */}
                        {editId === r._id && (
                            <div className="border-t pt-3 space-y-2">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <button
                                            type="button"
                                            key={n}
                                            onClick={() => setRating(n)}
                                        >
                                            <Star
                                                size={16}
                                                className={
                                                    n <= rating
                                                        ? "text-yellow-400 fill-current"
                                                        : "text-gray-300"
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full border rounded-lg p-2 resize-none"
                                    rows={2}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdate(r._id)}
                                        className="px-3 py-1.5 rounded-lg font-semibold text-white bg-primary hover:bg-hover-color"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditId(null)}
                                        className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
