import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { useAuthStore } from "../stores/auth";
import axiosInstance from "../api";
import { Notification } from "../components";
import { useState } from "react";

type FormValues = {
    address: string;
    phoneNumber: string;
    instruction?: string;
    date: string;
    timeSlot: string;
};

const ENDPOINTS: Record<string, string> = {
    user: "/user/bookings",
    org: "/org/bookings",
};

export default function BookingForm({ className = "" }) {
    const [notification, setNotification] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const { user } = useAuthStore();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>();

    const onSubmit = async (data: FormValues) => {
        const role = user?.role;
        const endpoint =
            role === "org"
                ? ENDPOINTS.org
                : role === "user"
                ? ENDPOINTS.user
                : undefined;

        if (!endpoint) {
            console.error("No booking endpoint for role:", role);
            toast.error(
                "Your account type cannot create bookings. Contact support."
            );
            return;
        }

        try {
            const res = await axiosInstance.post(endpoint, data);

            if ((res.data as any).success) {
                setNotification({
                    message: (res.data as any).message,
                    type: "success",
                });
                setTimeout(() => reset(), 200);
            } else {
                setNotification({
                    message:
                        (res.data as any).message || "Something went wrong",
                    type: "error",
                });
            }
        } catch (err: any) {
            console.error("Booking error:", err);
            setNotification({
                message:
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to create booking" ||
                    "Server or network error",
                type: "error",
            });
        }
    };

    return (
        <>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className={`w-full max-w-2xl mx-auto bg-white rounded-2xl shadow p-6 space-y-4 ${className}`}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Phone *
                        </label>
                        <input
                            {...register("phoneNumber", {
                                required: "Required",
                                pattern: {
                                    value: /^[0-9]{10,15}$/,
                                    message: "Invalid number",
                                },
                            })}
                            type="tel"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {errors.phoneNumber && (
                            <span className="text-xs text-red-600">
                                {errors.phoneNumber.message}
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Date *
                        </label>
                        <input
                            {...register("date", { required: "Required" })}
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {errors.date && (
                            <span className="text-xs text-red-600">
                                {errors.date.message}
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Address *
                    </label>
                    <textarea
                        {...register("address", {
                            required: "Required",
                            minLength: { value: 5, message: "Too short" },
                        })}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    {errors.address && (
                        <span className="text-xs text-red-600">
                            {errors.address.message}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Time slot *
                        </label>
                        <select
                            {...register("timeSlot", { required: "Required" })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Select</option>
                            <option>08:00-10:00</option>
                            <option>10:00-12:00</option>
                            <option>12:00-14:00</option>
                            <option>14:00-16:00</option>
                            <option>16:00-18:00</option>
                        </select>
                        {errors.timeSlot && (
                            <span className="text-xs text-red-600">
                                {errors.timeSlot.message}
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Instructions
                        </label>
                        <input
                            {...register("instruction")}
                            placeholder="Gate code, etc."
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2.5 rounded-lg font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-60`}
                >
                    {isSubmitting ? "Booking..." : "Create booking"}
                </button>
            </form>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </>
    );
}
