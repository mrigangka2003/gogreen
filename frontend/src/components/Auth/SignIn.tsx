import { Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";

const inputClass =
    "w-full pl-10 pr-3 py-2 mt-1 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm text-gray-700 leading-tight";

const SignIn = () => {
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = (data:FieldValues)=>{
        console.log("Signin payload:", data);
    }

    return (
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
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

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-60 m-2"
            >
                {isSubmitting ? "Logging..." : "Login"}
            </button>
        </form>
    );
};

export default SignIn;
