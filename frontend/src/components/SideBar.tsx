// src/components/Sidebar.tsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    Home,
    CalendarCheck,
    ClipboardList,
    Star,
    User,
    Users,
    ClipboardPlus,
    Settings,
    Menu,
    X,
    LogOut,
    UserPlus,
} from "lucide-react";
import { useAuthStore } from "../stores/auth";

type UserRole = "user" | "admin" | "org" | "emp" | "super-admin";

type SideBarItem = {
    title: string;
    path: string;
    icon: React.ReactNode;
};

/* --------------  ROLE MAP  -------------- */
const sidebarMap: Record<UserRole, SideBarItem[]> = {
    user: [
        { title: "Book Now", path: "book-now", icon: <Home size={20} /> },
        {
            title: "My Bookings",
            path: "my-bookings",
            icon: <CalendarCheck size={20} />,
        },
        { title: "Reviews", path: "my-reviews", icon: <Star size={20} /> },
        { title: "Profile", path: "profile/:id", icon: <User size={20} /> },
    ],
    admin: [
        {
            title: "Bookings",
            path: "current-bookings",
            icon: <Users size={20} />,
        },
        { title: "All Users", path: "all-users", icon: <Users size={20} /> },
        {
            title: "Past Bookings",
            path: "past-bookings",
            icon: <ClipboardPlus size={20} />,
        },
        {
            title: "Add Management",
            path: "add-management",
            icon: <Settings size={20} />,
        },
        { title: "Profile", path: "profile/:id", icon: <User size={20} /> },
    ],
    org: [
        { title: "Book Now", path: "book-now", icon: <Home size={20} /> },
        {
            title: "My Bookings",
            path: "my-bookings",
            icon: <CalendarCheck size={20} />,
        },
        { title: "Reviews", path: "my-reviews", icon: <Star size={20} /> },
        { title: "Profile", path: "profile/:id", icon: <User size={20} /> },
    ],
    emp: [
        {
            title: "My Tasks",
            path: "tasks/assigned",
            icon: <ClipboardList size={20} />,
        },
        {
            title: "Past Works",
            path: "tasks/in-progress",
            icon: <ClipboardList size={20} />,
        },
        { title: "Profile", path: "profile/:id", icon: <User size={20} /> },
    ],
    "super-admin": [
        { title: "Accounts", path: "accounts", icon: <Users size={20} /> },
        {
            title: "Bookings",
            path: "bookings",
            icon: <ClipboardList size={20} />,
        },
        {
            title: "Add Admin",
            path: "create-admin",
            icon: <UserPlus size={20} />,
        },
        { title: "All Reviews", path: "all-reviews", icon: <Star size={20} /> },
        { title: "Profile", path: "profile", icon: <User size={20} /> },
    ],
};

/* --------------  COMPONENT  -------------- */
const Sidebar = ({
    UserRoles,
    userId,
    basePath = "/dashboard",
}: {
    UserRoles: UserRole;
    userId?: string;
    basePath?: string;
}) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const navigate = useNavigate();
    const items = sidebarMap[UserRoles] ?? [];

    const currentUser = useAuthStore((s: any) => s.user);
    const clearUser = useAuthStore((s) => s.clearUser);

    const resolvedUserId =
        userId ?? (currentUser && (currentUser.id || currentUser._id));

    const toggleMobileSidebar = () => setIsMobileOpen((v) => !v);

    const makeLink = (rawPath: string) => {
        let path = rawPath;
        if (rawPath.includes(":id")) {
            if (resolvedUserId) path = rawPath.replace(":id", resolvedUserId);
            else path = "profile";
        }
        if (path.startsWith("/")) return path;
        const base = basePath ? basePath.replace(/\/$/, "") : "";
        return `${base}/${path}`.replace(/\/+/g, "/");
    };

    const handleLogout = async () => {
        try {
            clearUser();
        } finally {
            navigate("/login", { replace: true });
        }
    };

    return (
        <div>
            {/* Mobile toggle button */}
            <button
                onClick={toggleMobileSidebar}
                aria-label="Toggle menu"
                className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl shadow-lg bg-primary text-white border border-white/10"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-30 md:hidden bg-black/30"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-col w-72 h-screen fixed top-0 left-0 shadow-2xl bg-white border-r border-gray-100">
                {/* header */}
                <div className="p-8 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-primary">
                            <Home size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-gray-800">
                                Dashboard
                            </h2>
                            <p className="text-sm capitalize text-gray-500">
                                {UserRoles} Portal
                            </p>
                        </div>
                    </div>
                </div>

                {/* nav */}
                <nav className="flex flex-col gap-2 p-6 overflow-y-auto">
                    {items.map((item, idx) => (
                        <NavLink
                            key={`${item.path}-${idx}`}
                            to={makeLink(item.path)}
                            end
                            className={({ isActive }) =>
                                `group flex items-center gap-4 px-5 py-3 rounded-2xl transition-transform duration-150 ${
                                    isActive
                                        ? "bg-primary text-white shadow-md transform scale-[1.02]"
                                        : "text-gray-700 hover:bg-hover-color hover:text-white"
                                }`
                            }
                        >
                            {/* icon inherits current text color from the parent */}
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="font-medium truncate">
                                {item.title}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                {/* footer */}
                <div className="mt-auto p-6 border-t border-gray-100">
                    <div className="rounded-2xl p-4 mb-3 border bg-white/60 border-gray-100 backdrop-blur-sm">
                        <p className="text-xs font-medium text-gray-600">
                            Need help?
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                            Contact Support
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        aria-label="Logout"
                        className="w-full flex items-center gap-3 justify-center px-4 py-3 rounded-2xl bg-primary text-white hover:opacity-95 transition-opacity"
                    >
                        <LogOut size={18} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-80 shadow-2xl z-40 transform transition-transform duration-300 md:hidden ${
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                } bg-white`}
            >
                <div className="p-6 pt-16 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-primary">
                            <Home size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Dashboard
                            </h2>
                            <p className="text-sm capitalize text-gray-500">
                                {UserRoles} Portal
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 p-4 overflow-y-auto">
                    {items.map((item, idx) => (
                        <NavLink
                            key={`mobile-${item.path}-${idx}`}
                            to={makeLink(item.path)}
                            onClick={() => setIsMobileOpen(false)}
                            end
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-xl transition-colors duration-150 ${
                                    isActive
                                        ? "bg-primary text-white"
                                        : "text-gray-700 hover:bg-hover-color hover:text-primary"
                                }`
                            }
                        >
                            <span>{item.icon}</span>
                            <span className="font-medium">{item.title}</span>
                        </NavLink>
                    ))}

                    <button
                        onClick={() => {
                            setIsMobileOpen(false);
                            handleLogout();
                        }}
                        className="mt-4 mx-4 px-4 py-3 rounded-xl flex items-center gap-3 bg-primary text-white hover:opacity-95 transition-opacity"
                    >
                        <LogOut size={18} />
                        <span className="font-medium">Logout</span>
                    </button>
                </nav>
            </div>

            {/* Mobile bottom bar */}
            <div className="fixed bottom-0 left-0 w-full backdrop-blur-md md:hidden shadow-2xl bg-white/95 border-t border-gray-100">
                <div className="flex justify-around items-center py-2 px-2">
                    {items.slice(0, 4).map((item, idx) => (
                        <NavLink
                            key={`bottom-${item.path}-${idx}`}
                            to={makeLink(item.path)}
                            end
                            className={({ isActive }) =>
                                `flex flex-col items-center text-xs px-3 py-3 rounded-xl transition-transform duration-150 min-w-0 flex-1 mx-1 ${
                                    isActive
                                        ? "text-white bg-primary font-semibold transform scale-105"
                                        : "text-gray-600 hover:bg-hover-color hover:text-white"
                                }`
                            }
                        >
                            {item.icon}
                            <span className="mt-1 truncate w-full text-center leading-tight">
                                {item.title}
                            </span>
                        </NavLink>
                    ))}

                    {items.length > 4 && (
                        <button
                            onClick={toggleMobileSidebar}
                            className="flex flex-col items-center text-xs px-3 py-3 rounded-xl transition-colors duration-150 min-w-0 flex-1 mx-1 text-gray-600 hover:bg-hover-color hover:text-primary"
                        >
                            <Menu size={20} />
                            <span className="mt-1 truncate w-full text-center leading-tight">
                                More
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
