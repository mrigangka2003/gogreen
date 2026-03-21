import { FileText, User, Mail, Phone } from "lucide-react";
import { Booking } from "../../types/booking";
import { formatDate } from "./utils";

type OperationalDetailsProps = {
    booking: Booking;
};

export default function OperationalDetails({ booking }: OperationalDetailsProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">
                Operational Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Instructions */}
                <div>
                    <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        Instructions
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3 border border-gray-100 min-h-[5rem]">
                        {booking.instruction || "No instructions provided."}
                    </p>
                </div>

                {/* Customer Info */}
                <div>
                    <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2">
                        <User className="h-3.5 w-3.5 text-primary" />
                        Requested By
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 min-h-[5rem]">
                        {booking.userId ? (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-3 w-3 text-gray-400 font-bold" />
                                    <span className="text-gray-700 font-medium">{booking.userId.name || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-3 w-3 text-gray-400 font-bold" />
                                    <span className="text-gray-600">{booking.userId.email || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-3 w-3 text-gray-400 font-bold" />
                                    <span className="text-gray-600">{booking.phoneNumber}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 mt-2">No customer info available</p>
                        )}
                    </div>
                </div>

                {/* Status Details */}
                <div className="lg:col-span-2 space-y-2">
                    <h3 className="text-xs font-bold text-gray-700 mb-2">Status Timeline</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                            <span className="text-gray-500 font-medium tracking-wide">Status</span>
                            <span className={`font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${statusColor(booking.status)}`}>
                                {booking.status}
                            </span>
                        </div> */}
                        {booking.timerStartedAt && (
                            <div className="flex items-center justify-between bg-purple-50 rounded-xl p-2.5 border border-purple-100">
                                <span className="text-purple-600 font-medium tracking-wide">Timer Started</span>
                                <span className="font-bold text-purple-800">{formatDate(booking.timerStartedAt)}</span>
                            </div>
                        )}
                        {booking.completedAt && (
                            <div className="flex items-center justify-between bg-green-50 rounded-xl p-2.5 border border-green-100">
                                <span className="text-green-600 font-medium tracking-wide">Completed</span>
                                <span className="font-bold text-green-800">{formatDate(booking.completedAt)}</span>
                            </div>
                        )}
                        {booking.allocatedTime !== undefined && booking.allocatedTime > 0 && (
                            <div className="flex items-center justify-between bg-blue-50 rounded-xl p-2.5 border border-blue-100">
                                <span className="text-blue-600 font-medium tracking-wide">Time Allocation</span>
                                <span className="font-bold text-blue-800">{booking.allocatedTime} mins</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
