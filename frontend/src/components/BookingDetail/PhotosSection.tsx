import { Image } from "lucide-react";
import { Booking } from "../../types/booking";
import { useState } from "react";

type PhotosSectionProps = {
    booking: Booking;
    onUpdatePhoto?: (type: "startPhoto" | "endPhoto", url: string) => void;
};

export default function PhotosSection({ booking, onUpdatePhoto }: PhotosSectionProps) {
    const [editingType, setEditingType] = useState<"startPhoto" | "endPhoto" | null>(null);
    const [photoUrl, setPhotoUrl] = useState("");

    if (!booking.startPhoto && !booking.endPhoto && (!booking.assignments || booking.assignments.length === 0) && !onUpdatePhoto) return null;

    const handleSave = () => {
        if (editingType && onUpdatePhoto && photoUrl.trim()) {
            onUpdatePhoto(editingType, photoUrl.trim());
            setEditingType(null);
            setPhotoUrl("");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-4">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Image className="h-4 w-4 text-primary" />
                Photos
            </h2>

            {/* Top Level Photos */}
            <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-600 mb-3 border-b border-gray-100 pb-2 flex justify-between items-center">
                    Main Job Photos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Photo */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5 ml-1">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Start Photo (Main)</p>
                            {onUpdatePhoto && (
                                <button
                                    onClick={() => { setEditingType("startPhoto"); setPhotoUrl(""); }}
                                    className="text-primary text-[10px] font-bold hover:underline"
                                >
                                    {booking.startPhoto ? "Edit" : "Add"}
                                </button>
                            )}
                        </div>
                        {editingType === "startPhoto" ? (
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={photoUrl}
                                    onChange={(e) => setPhotoUrl(e.target.value)}
                                    placeholder="Enter photo URL"
                                    className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg"
                                />
                                <button onClick={handleSave} className="bg-primary text-white px-3 space-x-1 rounded-lg text-xs font-bold">Save</button>
                                <button onClick={() => setEditingType(null)} className="px-3 rounded-lg text-xs border border-gray-200 text-gray-500">Cancel</button>
                            </div>
                        ) : booking.startPhoto ? (
                            <img
                                src={booking.startPhoto}
                                alt="Start"
                                className="w-full h-56 object-cover rounded-2xl border border-gray-100 shadow-sm"
                            />
                        ) : (
                            <div className="w-full h-56 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                No start photo
                            </div>
                        )}
                    </div>

                    {/* End Photo */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5 ml-1">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">End Photo (Main)</p>
                            {onUpdatePhoto && (
                                <button
                                    onClick={() => { setEditingType("endPhoto"); setPhotoUrl(""); }}
                                    className="text-primary text-[10px] font-bold hover:underline"
                                >
                                    {booking.endPhoto ? "Edit" : "Add"}
                                </button>
                            )}
                        </div>
                        {editingType === "endPhoto" ? (
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={photoUrl}
                                    onChange={(e) => setPhotoUrl(e.target.value)}
                                    placeholder="Enter photo URL"
                                    className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg"
                                />
                                <button onClick={handleSave} className="bg-primary text-white px-3 rounded-lg text-xs font-bold">Save</button>
                                <button onClick={() => setEditingType(null)} className="px-3 rounded-lg text-xs border border-gray-200 text-gray-500">Cancel</button>
                            </div>
                        ) : booking.endPhoto ? (
                            <img
                                src={booking.endPhoto}
                                alt="End"
                                className="w-full h-56 object-cover rounded-2xl border border-gray-100 shadow-sm"
                            />
                        ) : (
                            <div className="w-full h-56 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                No end photo
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Employee Level Photos */}
            {booking.assignments && booking.assignments.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-gray-600 mb-3 border-b border-gray-100 pb-2">Employee Validation Photos</h3>
                    <div className="space-y-6">
                        {booking.assignments.filter(a => a.status !== "removed" && (a.startPhoto || a.endPhoto)).map((assignment) => {
                            const emp = assignment.employeeId;
                            return (
                                <div key={emp?._id || Math.random()} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="font-bold text-sm text-gray-800 mb-3">{emp?.name || "Unknown Employee"}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {assignment.startPhoto && (
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1.5 ml-1">Assigned Start Photo</p>
                                                <img
                                                    src={assignment.startPhoto}
                                                    alt="Start"
                                                    className="w-full h-40 object-cover rounded-xl border border-gray-100 shadow-sm"
                                                />
                                            </div>
                                        )}
                                        {assignment.endPhoto && (
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1.5 ml-1">Assigned End Photo</p>
                                                <img
                                                    src={assignment.endPhoto}
                                                    alt="End"
                                                    className="w-full h-40 object-cover rounded-xl border border-gray-100 shadow-sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
