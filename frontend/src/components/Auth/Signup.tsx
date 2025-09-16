import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { User as UserIcon, Mail, Lock, Phone } from "lucide-react";

import axiosInstance from "../../api";
import { useAuthStore } from "../../stores/auth";
import type { User } from "../../stores/auth";
import { useNavigate } from "react-router-dom";



const inputClass =
    "w-full pl-10 pr-3 py-2 mt-1 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm text-gray-700 leading-tight";

const Signup = () => {

    const setUser = useAuthStore((state)=>state.setUser); 
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<FieldValues>();



    const onSubmit = async (data: FieldValues) => {
        try {
            const response = await axiosInstance.post("/signup", {
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone,
                role: data.role,
            });

            const user : User = (response.data as any).data.user;
            setUser(user);
            navigate('/dashboard');

        } catch (error:any) {
            console.log(error?.response?.data);
        }
    };

    return (
        <form
            className="space-y-3"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
        >
            {/* Name */}
            <div>
                <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                >
                    Full Name
                </label>
                <div className="relative">
                    <div className="absolute bottom-2 left-0 pl-3 flex items-center pointer-events-none mt-6">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="name"
                        type="text"
                        className={inputClass}
                        placeholder="John Doe"
                        {...register("name", {
                            required: "Name is required",
                            minLength: {
                                value: 3,
                                message: "Name must be at least 3 characters",
                            },
                        })}
                    />
                </div>
                {errors.name && (
                    <p className="text-xs text-red-500 mt-1">
                        {errors.name.message as string}
                    </p>
                )}
            </div>

            {/* Email */}
            <div>
                <label
                    htmlFor="email-up"
                    className="text-sm font-medium text-gray-700"
                >
                    Email Address
                </label>
                <div className="relative">
                    <div className="absolute bottom-2 left-0 pl-3 flex items-center pointer-events-none mt-6">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="email-up"
                        type="email"
                        className={inputClass}
                        placeholder="you@example.com"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                message: "Enter a valid email address",
                            },
                        })}
                    />
                </div>
                {errors.email && (
                    <p className="text-xs text-red-500 mt-1">
                        {errors.email.message as string}
                    </p>
                )}
            </div>

            {/* Phone */}
            <div>
                <label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                >
                    Phone Number
                </label>
                <div className="relative">
                    <div className="absolute bottom-2 left-0 pl-3 flex items-center pointer-events-none mt-6">
                        <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="phone"
                        type="tel"
                        className={inputClass}
                        placeholder="9876543210"
                        {...register("phone", {
                            required: "Phone number is required",
                            pattern: {
                                // exactly 10 digits, no spaces/dashes
                                value: /^[6-9]\d{9}$/,
                                message: "Enter a valid 10-digit Indian number",
                            },
                        })}
                    />
                </div>
                {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">
                        {errors.phone.message as string}
                    </p>
                )}
            </div>

            {/* Role */}
            <div>
                <label
                    htmlFor="role"
                    className="text-sm font-medium text-gray-700"
                >
                    Account Type
                </label>
                <select
                    id="role"
                    className={inputClass.replace("pl-10", "pl-4")}
                    {...register("role", {
                        required: "Please select an account type",
                    })}
                >
                    <option value="">Select type</option>
                    <option value="user">User</option>
                    <option value="org">Organization</option>
                </select>
                {errors.role && (
                    <p className="text-xs text-red-500 mt-1">
                        {errors.role.message as string}
                    </p>
                )}
            </div>

            {/* Password */}
            <div>
                <label
                    htmlFor="password-up"
                    className="text-sm font-medium text-gray-700"
                >
                    Password
                </label>
                <div className="relative">
                    <div className="absolute bottom-2 left-0 pl-3 flex items-center pointer-events-none mt-6">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="password-up"
                        type="password"
                        className={inputClass}
                        placeholder="••••••••"
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 6,
                                message:
                                    "Password must be at least 6 characters",
                            },
                        })}
                    />
                </div>
                {errors.password && (
                    <p className="text-xs text-red-500 mt-1">
                        {errors.password.message as string}
                    </p>
                )}
            </div>

            {/* Confirm Password */}
            <div>
                <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                >
                    Confirm Password
                </label>
                <div className="relative">
                    <div className="absolute bottom-2 left-0 pl-3 flex items-center pointer-events-none mt-6">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="confirmPassword"
                        type="password"
                        className={inputClass}
                        placeholder="••••••••"
                        {...register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (value) =>
                                value === getValues("password") ||
                                "Passwords do not match",
                        })}
                    />
                </div>
                {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                        {errors.confirmPassword.message as string}
                    </p>
                )}
            </div>

            {/* Terms (optional checkbox) */}
            <div className="flex items-start">
                <input
                    id="terms"
                    type="checkbox"
                    className="h-4 w-4 mt-1 text-primary focus:ring-primary border-gray-300 rounded"
                    {...register("terms", {
                        required: "You must accept the terms and conditions",
                    })}
                />
                <label
                    htmlFor="terms"
                    className="ml-2 block text-sm text-gray-700"
                >
                    I agree to the{" "}
                    <a
                        href="#"
                        className="font-medium text-primary hover:underline"
                    >
                        Terms of Service
                    </a>
                </label>
            </div>
            {errors.terms && (
                <p className="text-xs text-red-500 -mt-3">
                    {errors.terms.message as string}
                </p>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-60"
            >
                {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
        </form>
    );
};

export default Signup;
