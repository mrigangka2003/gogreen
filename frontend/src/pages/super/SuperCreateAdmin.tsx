import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
    UserPlus,
    Mail,
    User,
    CheckCircle,
    Phone,
    Lock,
    Eye,
    EyeOff,
} from "lucide-react";

import axiosInstance from "../../api";
import { Notification } from "../../components";

const PRIMARY = "#38B000";
const FOURTH = "#141414";
const FIFTH = "#6C584C";

type FormValues = {
    name: string;
    email: string;
    phone: string;
    password: string;
};

const SuperCreateAdmin: React.FC = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
        },
    });

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [notification, setNotification] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const onSubmit = async (data: FormValues) => {
        try {

            const res = await axiosInstance.post('/accounts/admin',data)


            if ((res.data as any).success) {
                setNotification({ message: (res.data as any).message, type: "success" });
                setSubmitted(true);
                reset();

                
                setTimeout(() => {
                    setSubmitted(false);
                }, 2000);
            } else {
                setNotification({
                    message: (res.data as any).message || "Something went wrong",
                    type: "error",
                });
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.message || "Server or network error";
            setNotification({ message: msg, type: "error" });
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl mx-auto py-2 sm:py-4">
                {/* Header Section */}
                <div className="text-center mb-3 sm:mb-4">
                    <div
                        className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl mb-2 shadow-lg"
                        style={{
                            backgroundColor: PRIMARY,
                            boxShadow: `0 8px 24px ${PRIMARY}40`,
                        }}
                    >
                        <UserPlus
                            className="w-5 h-5 sm:w-6 sm:h-6"
                            color="white"
                            strokeWidth={2.5}
                        />
                    </div>
                    <h2
                        className="text-lg sm:text-xl lg:text-2xl font-bold mb-1"
                        style={{ color: FOURTH }}
                    >
                        Create New Admin
                    </h2>
                    <p className="text-xs px-4" style={{ color: `${FIFTH}99` }}>
                        Add a new administrator to your platform
                    </p>
                </div>

                {/* Form Card */}
                <div
                    className="rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl"
                    style={{
                        backgroundColor: "white",
                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
                    }}
                >
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-3 sm:space-y-4"
                    >
                        {/* Name Input */}
                        <div className="relative">
                            <label
                                className="block text-sm font-semibold mb-2 transition-colors duration-200"
                                style={{
                                    color:
                                        focusedField === "name"
                                            ? PRIMARY
                                            : FIFTH,
                                }}
                            >
                                Full Name
                            </label>
                            <div className="relative">
                                <div
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                                    style={{
                                        color:
                                            focusedField === "name"
                                                ? PRIMARY
                                                : `${FIFTH}66`,
                                    }}
                                >
                                    <User size={20} />
                                </div>
                                <input
                                    {...register("name", {
                                        required: "Name is required",
                                    })}
                                    onFocus={() => setFocusedField("name")}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pl-12 pr-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all duration-200 outline-none"
                                    placeholder="Enter admin's full name"
                                    style={{
                                        borderColor:
                                            focusedField === "name"
                                                ? PRIMARY
                                                : `${FIFTH}22`,
                                        backgroundColor:
                                            focusedField === "name"
                                                ? `${PRIMARY}05`
                                                : "white",
                                    }}
                                    aria-invalid={!!errors.name}
                                />
                                {errors.name && (
                                    <p className="text-xs mt-1 text-red-600">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="relative">
                            <label
                                className="block text-sm font-semibold mb-2 transition-colors duration-200"
                                style={{
                                    color:
                                        focusedField === "email"
                                            ? PRIMARY
                                            : FIFTH,
                                }}
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <div
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                                    style={{
                                        color:
                                            focusedField === "email"
                                                ? PRIMARY
                                                : `${FIFTH}66`,
                                    }}
                                >
                                    <Mail size={20} />
                                </div>
                                <input
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^\S+@\S+$/i,
                                            message: "Enter a valid email",
                                        },
                                    })}
                                    onFocus={() => setFocusedField("email")}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pl-12 pr-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all duration-200 outline-none"
                                    placeholder="admin@example.com"
                                    style={{
                                        borderColor:
                                            focusedField === "email"
                                                ? PRIMARY
                                                : `${FIFTH}22`,
                                        backgroundColor:
                                            focusedField === "email"
                                                ? `${PRIMARY}05`
                                                : "white",
                                    }}
                                    aria-invalid={!!errors.email}
                                />
                                {errors.email && (
                                    <p className="text-xs mt-1 text-red-600">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div className="relative">
                            <label
                                className="block text-sm font-semibold mb-2 transition-colors duration-200"
                                style={{
                                    color:
                                        focusedField === "phone"
                                            ? PRIMARY
                                            : FIFTH,
                                }}
                            >
                                Phone Number
                            </label>
                            <div className="relative">
                                <div
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                                    style={{
                                        color:
                                            focusedField === "phone"
                                                ? PRIMARY
                                                : `${FIFTH}66`,
                                    }}
                                >
                                    <Phone size={20} />
                                </div>
                                <input
                                    {...register("phone", {
                                        required: "Phone is required",
                                        minLength: {
                                            value: 6,
                                            message: "Phone number too short",
                                        },
                                    })}
                                    onFocus={() => setFocusedField("phone")}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pl-12 pr-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all duration-200 outline-none"
                                    placeholder="+1 (555) 000-0000"
                                    style={{
                                        borderColor:
                                            focusedField === "phone"
                                                ? PRIMARY
                                                : `${FIFTH}22`,
                                        backgroundColor:
                                            focusedField === "phone"
                                                ? `${PRIMARY}05`
                                                : "white",
                                    }}
                                    aria-invalid={!!errors.phone}
                                />
                                {errors.phone && (
                                    <p className="text-xs mt-1 text-red-600">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <label
                                className="block text-sm font-semibold mb-2 transition-colors duration-200"
                                style={{
                                    color:
                                        focusedField === "password"
                                            ? PRIMARY
                                            : FIFTH,
                                }}
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                                    style={{
                                        color:
                                            focusedField === "password"
                                                ? PRIMARY
                                                : `${FIFTH}66`,
                                    }}
                                >
                                    <Lock size={20} />
                                </div>
                                <input
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message:
                                                "Use at least 6 characters",
                                        },
                                    })}
                                    type={showPassword ? "text" : "password"}
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pl-12 pr-12 py-2.5 sm:py-3 rounded-xl border-2 transition-all duration-200 outline-none"
                                    placeholder="Create a strong password"
                                    style={{
                                        borderColor:
                                            focusedField === "password"
                                                ? PRIMARY
                                                : `${FIFTH}22`,
                                        backgroundColor:
                                            focusedField === "password"
                                                ? `${PRIMARY}05`
                                                : "white",
                                    }}
                                    aria-invalid={!!errors.password}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                                    style={{ color: `${FIFTH}66` }}
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                                {errors.password && (
                                    <p className="text-xs mt-1 text-red-600">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2.5 sm:py-3 rounded-xl text-white font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-lg mt-4"
                            style={{
                                backgroundColor: PRIMARY,
                                boxShadow: `0 4px 16px ${PRIMARY}50`,
                                opacity: isSubmitting ? 0.9 : 1,
                                transform: isSubmitting
                                    ? "scale(0.98)"
                                    : "scale(1)",
                            }}
                        >
                            {submitted ? (
                                <>
                                    <CheckCircle size={20} />
                                    Admin Created Successfully
                                </>
                            ) : (
                                <>
                                    <UserPlus size={20} />
                                    {isSubmitting
                                        ? "Creating..."
                                        : "Create Admin Account"}
                                </>
                            )}
                        </button>
                    </form>

                    <div>
                        {notification && (
                            <Notification
                                message={notification.message}
                                type={notification.type}
                                onClose={() => setNotification(null)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperCreateAdmin;
