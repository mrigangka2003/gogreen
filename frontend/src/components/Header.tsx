import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";

import logo from "../assets/logo.svg";
import { useAuthStore } from "../stores/auth";

type MenuItem = {
    label: string;
    slug: string;
};

const Header = () => {
    const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
    const [showCareersMenu, setShowCareersMenu] = useState<boolean>(false);

    const user = useAuthStore((state)=>state.user);
    const clearUser = useAuthStore((state)=>state.clearUser);


    const navigate = useNavigate();

    const navItems = [
        { name: "Home", slug: "/", active: true },
        {
            name: "Product & Services",
            slug: "/product-and-services",
            active: true,
        },
        {
            name: "Corporate Responsibility",
            slug: "/corporate-responsibility",
            active: true,
        },
        { name: "Community Impact", slug: "/community-impact", active: true },
        { name: "Media", slug: "/media", active: true },
        { name: "About", slug: "/about", active: true },
    ];

    const careersItems = [
        { name: "Job Search", slug: "/careers/job-search" },
        { name: "Internships", slug: "/careers/students/internships" },
        { name: "Events", slug: "/careers/students/events" },
        { name: "Working Here", slug: "/careers/working-here" },
        { name: "Our Process", slug: "/careers/our-process" },
    ];

    const userMenuItems: MenuItem[] = [
        { label: "My Bookings", slug: "/my-bookings" },
        {label:"Dashboard" ,slug:"/dashboard"}
    ];

    return (
        <header className="relative z-40">
            <nav className="relative flex items-center justify-between px-6 py-3 bg-white/95 backdrop-blur-xl border-b border-green-100 shadow-lg shadow-green-500/10">
                <div className="flex-shrink-0">
                    <Link to="/">
                        <img
                            src={logo}
                            alt="GoGreen+ Logo"
                            className="h-12 w-auto transition-transform duration-200 hover:scale-105"
                        />
                    </Link>
                </div>

                {/* Navigation Items - Professional white/green glass effect */}
                <ul className="hidden lg:flex gap-6 bg-green-50/80 backdrop-blur-md border border-green-200/50 px-6 py-2 rounded-2xl shadow-lg shadow-green-500/10">
                    {navItems.map((item) => (
                        <li key={item.slug}>
                            <NavLink
                                to={item.slug}
                                className={({ isActive }) =>
                                    isActive
                                        ? "text-green-700 font-bold relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-green-600 before:rounded-full pb-1 transition-all duration-300 tracking-wide text-sm"
                                        : "text-gray-700 hover:text-green-700 transition-all duration-300 hover:scale-105 font-medium tracking-wide text-sm"
                                }
                            >
                                {item.name}
                            </NavLink>
                        </li>
                    ))}

                    {/* Careers Dropdown */}
                    <li className="relative group">
                        <div
                            className="flex items-center gap-1 text-gray-700 hover:text-green-700 transition-all duration-300 hover:scale-105 font-medium tracking-wide text-sm cursor-pointer"
                            onMouseEnter={() => setShowCareersMenu(true)}
                            onMouseLeave={() => setShowCareersMenu(false)}
                        >
                            Careers
                            <ChevronDown
                                className="transition-transform duration-300 group-hover:rotate-180"
                                size={14}
                            />
                        </div>

                        {/* Careers Dropdown Menu */}
                        <div
                            className={`absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-green-200 rounded-xl shadow-xl shadow-green-500/20 transition-all duration-300 ${
                                showCareersMenu
                                    ? "opacity-100 visible translate-y-0"
                                    : "opacity-0 invisible -translate-y-2"
                            }`}
                            onMouseEnter={() => setShowCareersMenu(true)}
                            onMouseLeave={() => setShowCareersMenu(false)}
                        >
                            <div className="p-3">
                                {careersItems.map((item) => (
                                    <Link
                                        key={item.slug}
                                        to={item.slug}
                                        className="block px-4 py-3 text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 font-medium text-sm"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </li>
                </ul>

                {/* User Section */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div>
                            <div className="flex items-center gap-3 cursor-pointer group relative">
                                {/* Professional avatar with green accent */}
                                <div className="w-10 h-10 rounded-full bg-green-100/80 backdrop-blur-sm border border-green-200 p-0.5 shadow-lg shadow-green-500/20">
                                    <div className="w-full h-full rounded-full bg-gradient-to-b from-white to-gray-50 flex items-center justify-center border border-green-100">
                                        <span className="text-green-700 font-bold text-sm">
                                            U
                                        </span>
                                    </div>
                                </div>
                                <ChevronDown
                                    className="text-green-600 group-hover:text-green-700 transition-all duration-300 group-hover:rotate-180"
                                    size={18}
                                />

                                {/* Dropdown Menu - Professional glass panel */}
                                <div className="absolute top-0 right-0 pt-16 text-base font-medium z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-2">
                                    <div className="min-w-56 bg-white/95 backdrop-blur-xl border border-green-200 rounded-2xl p-5 text-gray-800 shadow-xl shadow-green-500/20">
                                        {userMenuItems.map((item) => (
                                            <div
                                                key={item.slug}
                                                className="mb-3 last:mb-0"
                                            >
                                                <Link
                                                    className="block w-full text-left hover:text-green-700 cursor-pointer transition-all duration-300 hover:translate-x-2 py-3 px-4 rounded-xl hover:bg-green-50 font-medium tracking-wide border border-transparent hover:border-green-200"
                                                    to={item.slug}
                                                >
                                                    {item.label}
                                                </Link>
                                            </div>
                                        ))}
                                        <hr className="border-green-200 my-4" />
                                        <div
                                            className="py-3 px-4 rounded-xl hover:bg-red-50 hover:text-red-600 cursor-pointer transition-all duration-300 hover:translate-x-2 font-medium tracking-wide border border-transparent hover:border-red-200"
                                            onClick={() => {
                                                clearUser();
                                                navigate("/");
                                            }}
                                        >
                                            LOGOUT
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            className="relative px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30"
                            onClick={() => navigate("/login")}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10 tracking-wide">
                                Login
                            </span>
                        </button>
                    )}

                    <div className="lg:hidden">
                        {showUserMenu ? (
                            <X
                                className="w-6 h-6 text-gray-700 cursor-pointer hover:text-green-700 transition-colors"
                                onClick={() => setShowUserMenu(false)}
                            />
                        ) : (
                            <Menu
                                className="w-6 h-6 text-gray-700 cursor-pointer hover:text-green-700 transition-colors"
                                onClick={() => setShowUserMenu(true)}
                            />
                        )}
                    </div>

                    {/* Mobile Navigation Menu - full screen overlay */}
                    {showUserMenu && (
                        <div className="fixed top-0 left-0 w-full h-screen bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-8 lg:hidden">
                            <div className="flex flex-col items-center gap-6">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.slug}
                                        to={item.slug}
                                        className={({ isActive }) =>
                                            isActive
                                                ? "text-green-700 text-xl font-bold tracking-wide"
                                                : "text-gray-700 text-xl hover:text-green-700 transition duration-300 tracking-wide"
                                        }
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        {item.name}
                                    </NavLink>
                                ))}

                                {/* Mobile Careers Section with Dropdown */}
                                <div className="border-t border-green-200 pt-4 mt-4 relative">
                                    <div
                                        className="flex items-center justify-center gap-2 text-gray-700 text-xl hover:text-green-700 transition duration-300 tracking-wide cursor-pointer group"
                                        onClick={() =>
                                            setShowCareersMenu(!showCareersMenu)
                                        }
                                    >
                                        careers
                                        <ChevronDown
                                            className={`transition-transform duration-300 ${
                                                showCareersMenu
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                            size={20}
                                        />
                                    </div>

                                    {/* Mobile Careers Dropdown */}
                                    <div
                                        className={`mt-4 transition-all duration-300 overflow-hidden ${
                                            showCareersMenu
                                                ? "max-h-96 opacity-100"
                                                : "max-h-0 opacity-0"
                                        }`}
                                    >
                                        <div className="bg-green-50/50 rounded-xl p-4 border border-green-200/30">
                                            {careersItems.map((item) => (
                                                <Link
                                                    key={item.slug}
                                                    to={item.slug}
                                                    className="block text-gray-600 hover:text-green-600 transition duration-300 mb-3 text-center py-2 px-4 rounded-lg hover:bg-green-100/50"
                                                    onClick={() => {
                                                        setShowUserMenu(false);
                                                        setShowCareersMenu(
                                                            false
                                                        );
                                                    }}
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <X
                                size={28}
                                className="text-white bg-green-600 hover:bg-green-700 p-2 rounded-full transition duration-300 shadow-md"
                                onClick={() => setShowUserMenu(false)}
                            />
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;
