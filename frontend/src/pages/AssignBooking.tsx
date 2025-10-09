import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth"; // ← adjust to your zustand file
import axiosInstance from "../api"; // ← adjust to your axios file

type Booking = {
    _id: string;
    address: string;
    phoneNumber: string;
    instruction: string;
    date: string;
    timeSlot: string;
    status: "pending" | "completed";
    amount: number;
    paymentStatus: string;
    userId: { name?: string; email?: string; phone?: string } | null;
    employeeId: any;
};

const AssignBookings = () => {
    const { user } = useAuthStore();
    const [completed, setCompleted] = useState<Booking[]>([]);
    const [pending, setPending] = useState<Booking[]>([]);

    useEffect(() => {
        if (!user) return;

        const endpoint = "super/bookings"

        if (!endpoint) return;

        const getBookings = async () => {
            try {
                const { data } = await axiosInstance.get<{
                    success: boolean;
                    data: Booking[];
                }>(endpoint);
                if (data?.success) {
                    const done: Booking[] = [];
                    const pend: Booking[] = [];
                    data.data.forEach((b) =>
                        b.status === "completed" ? done.push(b) : pend.push(b)
                    );
                    setCompleted(done);
                    setPending(pend);
                }
            } catch (err) {
                console.error(err);
            }
        };

        getBookings();
    }, [user]);

    const BookingCard = ({ b }: { b: Booking }) => (
        <div className="rounded-2xl p-4 bg-white shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                        {b.address}
                    </h3>
                    <p className="text-xs text-gray-500">{b.phoneNumber}</p>
                </div>
                <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        b.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                    }`}
                >
                    {b.status}
                </span>
            </div>

            <p className="text-xs text-gray-600">{b.instruction}</p>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(b.date).toLocaleDateString()}</span>
                <span>{b.timeSlot}</span>
            </div>

            {b.userId?.name && (
                <div className="text-xs text-gray-500">
                    Customer: {b.userId.name} · {b.userId.email}
                </div>
            )}

            <div className="mt-2 flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-xl text-sm bg-primary text-white hover:bg-hover">
                    Assign
                </button>
                <button className="px-3 py-1.5 rounded-xl text-sm bg-white border border-gray-200 hover:shadow-sm">
                    View
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-4 max-w-6xl mx-auto space-y-6">
            <h2 className="text-xl font-bold">Pending ({pending.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pending.map((b) => (
                    <BookingCard b={b} key={b._id} />
                ))}
            </div>

            <h2 className="text-xl font-bold">
                Completed ({completed.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map((b) => (
                    <BookingCard b={b} key={b._id} />
                ))}
            </div>
        </div>
    );
};

export default AssignBookings;
