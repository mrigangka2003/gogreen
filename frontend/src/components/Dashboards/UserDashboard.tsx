const HEADER_REM = 4; 

const UserDashboard = () => {

    const minHeightStyle = {

        minHeight: `calc(100vh - ${HEADER_REM}rem)`,
        paddingTop: `calc(env(safe-area-inset-top, 0px) + ${HEADER_REM}rem)`,
    };

    return (
        <div
            
            className="w-full h-screen bg-[#f8faf8] flex items-start justify-center p-6 box-border overflow-y-auto"
            style={minHeightStyle}
        >
            <div className="w-full max-w-3xl">
                <div className="relative z-10 bg-white p-6 sm:p-12 rounded-3xl shadow-md text-center border border-green-100">
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-green-700 leading-tight break-words">
                        Welcome to Your Dashboard
                    </h1>

                    <p className="mt-4 text-base sm:text-lg text-green-600 font-medium max-w-xl mx-auto">
                        Manage your profile, track your bookings, and stay
                        connected — all in one simple and organized place.
                    </p>

                    <div className="mt-8">
                        <div className="h-1 w-24 bg-green-500 mx-auto rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
