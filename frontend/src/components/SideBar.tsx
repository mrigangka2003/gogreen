import { NavLink } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

interface SideBarItem {
    title: string;
    path: string;
}

const SideBar = () => {
    const user = useAuthStore((state) => state.user);

    /* ---------- per-role nav ---------- */
    const adminRoutes: SideBarItem[] = [
        { title: "All Users", path: "/admin/users" },
        { title: "Analytics", path: "/admin/analytics" },
        { title: "Settings", path: "/admin/settings" },
    ];

    const userRoutes: SideBarItem[] = [
        { title: "Dashboard", path: "/dashboard" },
        { title: "Profile", path: "/profile" },
    ];

    const orgRoutes: SideBarItem[] = [
        { title: "Org Home", path: "/org" },
        { title: "Members", path: "/org/members" },
    ];

    /* ---------- pick list ---------- */
    const routes =
        user?.role === "admin" ? adminRoutes :
            user?.role === "org" ? orgRoutes :
                user?.role === "user" ? userRoutes :
                    [];

    /* ---------- helpers ---------- */
    const NavItem = ({ item }: { item: SideBarItem }) => (
        <NavLink
            to={item.path}
            className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition ` +
                (isActive
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100")
            }
        >
            {item.title}
        </NavLink>
    );

    /* ---------- desktop sidebar ---------- */
    const DesktopBar = () => (
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="px-4 space-y-1">
                    {routes.map((r) => (
                        <NavItem key={r.path} item={r} />
                    ))}
                </nav>
            </div>
        </aside>
    );

    /* ---------- mobile bottom bar ---------- */
    const MobileBar = () => (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
            <div className="flex justify-around py-2">
                {routes.map((r) => (
                    <NavLink
                        key={r.path}
                        to={r.path}
                        className={({ isActive }) =>
                            `px-3 py-1 text-xs rounded ` +
                            (isActive
                                ? "bg-indigo-100 text-indigo-700"
                                : "text-gray-600 hover:bg-gray-100")
                        }
                    >
                        {r.title}
                    </NavLink>
                ))}
            </div>
        </nav>
    );

    return (
        <>
            <DesktopBar />
            <MobileBar />
        </>
    );
};

export default SideBar;