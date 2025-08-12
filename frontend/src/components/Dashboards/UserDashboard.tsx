import { useNavigate } from "react-router-dom";
import { Calendar, User, FileText } from "lucide-react";

const UserDashboard = () => {
    const navigate = useNavigate();

    const actions = [
        {
            label: "Book Now",
            icon: <Calendar size={20} />,
            onClick: () => navigate("/book-now"),
            primary: true,
        },
        {
            label: "My Profile",
            icon: <User size={20} />,
            onClick: () => navigate("/my-profile"),
        },
        {
            label: "My Bookings",
            icon: <FileText size={20} />,
            onClick: () => navigate("/my-bookings"),
        },
    ];

    return (
        <div className="min-h-screen bg-green-600 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-3xl p-8 rounded-2xl shadow-lg">
                <h1 className="text-2xl font-semibold text-green-700 text-center mb-8">
                    Welcome to Your Dashboard
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {actions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={action.onClick}
                            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-md text-lg font-medium transition-all duration-300
                ${
                    action.primary
                        ? "bg-green-600 text-white hover:bg-green-500"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                        >
                            {action.icon}
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
