
const SuperAdminDashboard = () => {
    return (
        <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-2xl p-10 sm:p-14 rounded-3xl shadow-lg text-center border border-green-100">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-green-700 leading-tight">
                    Super Admin Dashboard
                </h1>

                <p className="mt-4 text-base sm:text-lg text-green-600 font-medium max-w-lg mx-auto">
                    Welcome, Super Admin 👋 Manage users, oversee system
                    performance, and maintain platform integrity — all from this
                    centralized space.
                </p>

                <div className="mt-8">
                    <div className="h-1 w-24 bg-green-500 mx-auto rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
