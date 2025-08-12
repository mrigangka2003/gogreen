import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { Calendar, Clock, MapPin, FileText } from "lucide-react";

const BookNow = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FieldValues>();

    const onSubmit = (data: FieldValues) => {
        console.log(data);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white px-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-gray-200 space-y-6"
            >
                <h2 className="text-2xl font-semibold text-green-700 text-center">
                    Book Your Appointment
                </h2>
                <p className="text-gray-500 text-center text-sm">
                    Please fill out the form to confirm your booking
                </p>

                {/* Date */}
                <div>
                    <label className="flex items-center gap-2 text-gray-700 text-sm mb-1">
                        <Calendar size={16} /> Date
                    </label>
                    <input
                        type="date"
                        {...register("date", { required: "Date is required" })}
                        className="w-full px-4 py-2 bg-white text-gray-800 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-400 outline-none"
                    />
                    {errors.date && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.date.message as string}
                        </p>
                    )}
                </div>

                {/* Time */}
                <div>
                    <label className="flex items-center gap-2 text-gray-700 text-sm mb-1">
                        <Clock size={16} /> Time
                    </label>
                    <input
                        type="time"
                        {...register("time", { required: "Time is required" })}
                        className="w-full px-4 py-2 bg-white text-gray-800 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-400 outline-none"
                    />
                    {errors.time && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.time.message as string}
                        </p>
                    )}
                </div>

                {/* Address */}
                <div>
                    <label className="flex items-center gap-2 text-gray-700 text-sm mb-1">
                        <MapPin size={16} /> Address
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your address"
                        {...register("address", {
                            required: "Address is required",
                        })}
                        className="w-full px-4 py-2 bg-white text-gray-800 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-400 outline-none"
                    />
                    {errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.address.message as string}
                        </p>
                    )}
                </div>

                {/* Total Amount */}
                <div>
                    <label className="flex items-center gap-2 text-gray-700 text-sm mb-1">
                        ₹ Total Amount
                    </label>
                    <input
                        type="number"
                        placeholder="Enter total amount"
                        {...register("totalAmount", {
                            required: "Total amount is required",
                        })}
                        className="w-full px-4 py-2 bg-white text-gray-800 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-400 outline-none"
                    />
                    {errors.totalAmount && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.totalAmount.message as string}
                        </p>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <label className="flex items-center gap-2 text-gray-700 text-sm mb-1">
                        <FileText size={16} /> Notes (Optional)
                    </label>
                    <textarea
                        placeholder="Any special instructions..."
                        {...register("notes")}
                        className="w-full px-4 py-2 bg-white text-gray-800 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-400 outline-none resize-none"
                        rows={3}
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
                >
                    {isSubmitting ? "Booking..." : "Book Now"}
                </button>
            </form>
        </div>
    );
};

export default BookNow;
