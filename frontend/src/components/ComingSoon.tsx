import React from "react";

const ComingSoon: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f6fef3] via-white to-[#f2f9ed] relative overflow-hidden px-4">
            {/* Background Glow */}
            <div className="absolute w-96 h-96 bg-[#98CD00]/10 rounded-full blur-3xl top-10 left-10 z-0"></div>
            <div className="absolute w-96 h-96 bg-[#7AB800]/10 rounded-full blur-3xl bottom-10 right-10 z-0"></div>

            {/* Main Content */}
            <div className="z-10 text-center max-w-2xl">
                <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-800 leading-tight">
                    We’re Developing Something Awesome
                </h1>
                <p className="mt-6 text-xl text-gray-600">
                    This page is under construction and will be live very soon.
                    Stay tuned!
                </p>

                {/* Animated Dots */}
                <div className="flex justify-center mt-8 space-x-2">
                    <span className="h-3 w-3 bg-[#98CD00] rounded-full animate-bounce [animation-delay:.1s]"></span>
                    <span className="h-3 w-3 bg-[#7AB800] rounded-full animate-bounce [animation-delay:.2s]"></span>
                    <span className="h-3 w-3 bg-[#98CD00] rounded-full animate-bounce [animation-delay:.3s]"></span>
                </div>

                {/* Optional CTA */}
                <p className="mt-10 text-sm text-gray-400">
                    © {new Date().getFullYear()} Go Green+. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default ComingSoon;
