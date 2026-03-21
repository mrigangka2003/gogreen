import { ArrowLeft, MapPin, Calendar, Clock } from "lucide-react";
import { Booking } from "../../types/booking";
import { statusColor, formatDate } from "./utils";

type BookingHeaderProps = {
    booking: Booking;
    goBack: () => void;
    isPending: boolean;
    newStatus: string;
    setNewStatus: (val: string) => void;
    allocatedTime: number;
    setAllocatedTime: (val: number) => void;
    updatingStatus: boolean;
    handleStatusChange: () => void;
};

export default function BookingHeader({
    booking,
    goBack,
    isPending,
    newStatus,
    setNewStatus,
    allocatedTime,
    setAllocatedTime,
    updatingStatus,
    handleStatusChange
}: BookingHeaderProps) {
    return (
        <>
            <button
                onClick={goBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Bookings
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 capitalize">
                            {booking.serviceType || "Booking"}
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">ID: {booking._id}</p>
                    </div>
                    <span className={`self-start text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border ${statusColor(booking.status)}`}>
                        {booking.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Address</p>
                            <p className="font-medium">{booking.address}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                        <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Booking Date</p>
                            <p className="font-medium">{formatDate(booking.date)}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                        <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Time Slot</p>
                            <p className="font-medium">{booking.timeSlot}</p>
                        </div>
                    </div>
                    {booking.createdAt && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                            <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Booking Created At</p>
                                <p className="font-medium">{formatDate(booking.createdAt)}</p>
                            </div>
                        </div>
                    )}

                    {!isPending && (
                        <>
                            <div className="flex flex-col justify-center bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5 block">Set Job Status</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-white"
                                >
                                    <option value="">Select a status...</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="started">Started</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            {newStatus === "started" && (
                                <div className="flex flex-col justify-center bg-gray-50 rounded-xl p-3 border border-gray-100 animate-in fade-in zoom-in duration-200">
                                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5 block">Time (Mins)</label>
                                    <input
                                        type="number"
                                        value={allocatedTime || ""}
                                        onChange={(e) => setAllocatedTime(Number(e.target.value))}
                                        placeholder="e.g. 60"
                                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-white"
                                    />
                                </div>
                            )}
                            <div className="flex flex-col justify-end">
                                <button
                                    onClick={handleStatusChange}
                                    disabled={!newStatus || updatingStatus}
                                    className="w-full px-4 py-1.5 mt-auto rounded-lg text-sm font-bold bg-gray-800 text-white hover:bg-gray-900 transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center"
                                >
                                    {updatingStatus ? "Updating..." : "Update Status"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
