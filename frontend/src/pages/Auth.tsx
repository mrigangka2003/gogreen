import { useState } from "react";

import { Signup, SignIn } from "../components";

const Login = () => {
    const [isSignin, setIsSignin] = useState<boolean>(true);

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        GoGreenplus
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {isSignin
                            ? "Welcome back! Please sign in"
                            : "Join us today! Create your account"}
                    </p>
                </div>

                {/* Toggle Buttons */}
                <div className="relative flex rounded-lg bg-gray-100 p-1 text-sm font-medium mb-8">
                    {/* Animated background */}
                    <div
                        className={`absolute top-1 bottom-1 w-1/2 rounded-md bg-white shadow-sm transition-all duration-300 ${
                            isSignin ? "left-1" : "left-1/2"
                        }`}
                    />
                    {["Sign In", "Sign Up"].map((label) => {
                        const active =
                            label === "Sign In" ? isSignin : !isSignin;
                        return (
                            <button
                                key={label}
                                onClick={() => setIsSignin(label === "Sign In")}
                                className={`z-10 flex-1 py-3 rounded-md transition-colors duration-300 ${
                                    active
                                        ? "text-primary font-semibold"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Form */}
                <div className="mt-2">{isSignin ? <SignIn /> : <Signup />}</div>
            </div>
        </main>
    );
};


export default Login;
