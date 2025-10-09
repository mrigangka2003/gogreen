// src/pages/ADD_MANAGEMENT.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "../../api";
import { Notification } from "../../components";

type RoleName = "org" | "emp";

type FormValues = {
    name: string;
    email: string;
    password: string;
    phone?: string;
    roleName: RoleName;
};

const defaultValues: Partial<FormValues> = { roleName: "org" };

/* ---------- validation patterns ---------- */
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Indian 10-digit number starting with 6–9
const phonePattern = /^[6-9]\d{9}$/;
const passwordRules = { minLength: 6 };

const AddManagement: React.FC = () => {
    const [notification, setNotification] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);
    const [showPwd, setShowPwd] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm<FormValues>({ defaultValues });

    const onSubmit = async (values: FormValues) => {
        try {
            const res = await axiosInstance.post("/admin/accounts", values);
            const ok = (res.data as any)?.success;
            const msg =
                (res.data as any)?.message ||
                (ok
                    ? "Org/Emp account created successfully"
                    : "Something went wrong");

            if (ok) {
                setNotification({ message: msg, type: "success" });
                reset(defaultValues);
            } else {
                setNotification({ message: msg, type: "error" });
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create account";
            setNotification({ message: msg, type: "error" });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Add Management
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Create <span className="font-medium">Organization</span>{" "}
                        or <span className="font-medium">Employee</span>{" "}
                        accounts. Passwords are hashed on the server.
                    </p>
                </div>

                {/* Card */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="bg-white rounded-2xl shadow-subtle border border-gray-100 p-6 sm:p-8 space-y-6"
                    noValidate
                >
                    {/* Role */}
                    <fieldset>
                        <legend className="text-sm font-semibold text-gray-700 mb-3">
                            Role <span className="text-red-500">*</span>
                        </legend>
                        <div className="flex flex-wrap gap-4">
                            {(["org", "emp"] as RoleName[]).map((r) => (
                                <label
                                    key={r}
                                    className="relative flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition
                                border-gray-200 hover:border-primary focus-within:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                                >
                                    <input
                                        type="radio"
                                        value={r}
                                        className="sr-only"
                                        {...register("roleName", {
                                            required: true,
                                        })}
                                    />
                                    <span className="text-sm font-medium text-gray-800">
                                        {r === "org"
                                            ? "Organization"
                                            : "Employee"}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {errors.roleName && (
                            <p className="text-xs text-red-600 mt-2">
                                Please select a role.
                            </p>
                        )}
                    </fieldset>

                    {/* Name / Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Input
                            label="Full Name"
                            required
                            placeholder="e.g. Karan Das"
                            error={errors.name?.message}
                            {...register("name", {
                                required: "Name is required",
                                minLength: { value: 2, message: "Too short" },
                            })}
                        />
                        <Input
                            type="email"
                            label="Email"
                            required
                            placeholder="name@company.com"
                            error={errors.email?.message}
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: emailPattern,
                                    message: "Invalid email",
                                },
                            })}
                        />
                    </div>

                    {/* Phone / Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Input
                            type="tel"
                            label="Phone"
                            required
                            placeholder="10-digit Indian number"
                            error={errors.phone?.message}
                            {...register("phone", {
                                pattern: {
                                    value: phonePattern,
                                    message: "Enter a valid 10-digit number",
                                },
                            })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPwd ? "text" : "password"}
                                    placeholder="Min 6 characters"
                                    className={inputClass(!!errors.password)}
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: passwordRules.minLength,
                                            message: `Min ${passwordRules.minLength} characters`,
                                        },
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd((s) => !s)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                                    aria-label={
                                        showPwd
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPwd ? "🙈" : "👁️"}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-600 mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                            {isSubmitting ? "Creating..." : "Create Account"}
                        </button>
                    </div>

                    {isSubmitSuccessful && (
                        <p className="text-xs text-gray-500">
                            If the email already exists, you’ll see an error
                            message.
                        </p>
                    )}
                </form>

                {/* Notification */}
                {notification && (
                    <div className="mt-6">
                        <Notification
                            message={notification.message}
                            type={notification.type}
                            onClose={() => setNotification(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

/* ---------- styled sub-components ---------- */
const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition disabled:cursor-not-allowed ${
        hasError ? "border-red-400" : "border-gray-200"
    }`;

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    required?: boolean;
    error?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, required, error, ...rest }, ref) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input ref={ref} className={inputClass(!!error)} {...rest} />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    )
);

export default AddManagement;
