import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";

interface HeaderProps {
    logoSrc?: string;
}

const Header: React.FC<HeaderProps> = ({ logoSrc = "/images/logo.jpg" }) => {
    const [navOpen, setNavOpen] = useState(false);
    const [careersDropdownOpen, setCareersDropdownOpen] = useState(false);

    const toggleNavBar = () => {
        setNavOpen(!navOpen);
    };

    const closeNavBar = () => {
        setNavOpen(false);
    };

    const toggleCareersDropdown = () => {
        setCareersDropdownOpen(!careersDropdownOpen);
    };

    const navItems = [
        {
            name: "Home",
            slug: "/",
            active: true,
        },
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
        {
            name: "Community Impact",
            slug: "/community-impact",
            active: true,
        },
        {
            name: "Media",
            slug: "/media",
            active: true,
        },
        {
            name: "About",
            slug: "/about",
            active: true,
        },
    ];

    const careersItems = [
        {
            name: "Job Search",
            slug: "/careers/job-search",
        },
        {
            name: "Internships",
            slug: "/careers/students/internships",
        },
        {
            name: "Events",
            slug: "/careers/students/events",
        },
        {
            name: "Working Here",
            slug: "/careers/working-here",
        },
        {
            name: "Our Process",
            slug: "/careers/our-process",
        },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" onClick={closeNavBar} className="block">
                            <img
                                src={logoSrc}
                                alt="GoGreen+ Logo"
                                className="h-12 w-auto transition-transform duration-200 hover:scale-105"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex lg:items-center lg:space-x-8">
                        {navItems.map((item) =>
                            item.active ? (
                                <Link
                                    key={item.name}
                                    to={item.slug}
                                    className="relative text-gray-700 hover:text-primary-600 font-medium text-sm transition-colors duration-200 group"
                                >
                                    {item.name}
                                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                                </Link>
                            ) : null
                        )}

                        {/* Careers Dropdown */}
                        <div className="relative">
                            <button
                                onClick={toggleCareersDropdown}
                                className="relative text-gray-700 hover:text-primary-600 font-medium text-sm transition-colors duration-200 flex items-center group"
                            >
                                Careers
                                <ChevronDown
                                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                                        careersDropdownOpen ? "rotate-180" : ""
                                    }`}
                                />
                                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                            </button>

                            {careersDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                    {careersItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.slug}
                                            onClick={() => {
                                                closeNavBar();
                                                setCareersDropdownOpen(false);
                                            }}
                                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <button
                            onClick={toggleNavBar}
                            className="p-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            {navOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </nav>

                {/* Mobile Navigation */}
                {navOpen && (
                    <div className="lg:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                            {navItems.map((item) =>
                                item.active ? (
                                    <Link
                                        key={item.name}
                                        to={item.slug}
                                        onClick={closeNavBar}
                                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                                    >
                                        {item.name}
                                    </Link>
                                ) : null
                            )}

                            {/* Mobile Careers Section */}
                            <div className="pt-2">
                                <button
                                    onClick={toggleCareersDropdown}
                                    className="flex items-center justify-between w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                                >
                                    Careers
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform duration-200 ${
                                            careersDropdownOpen
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </button>

                                {careersDropdownOpen && (
                                    <div className="mt-2 space-y-1">
                                        {careersItems.map((item) => (
                                            <Link
                                                key={item.name}
                                                to={item.slug}
                                                onClick={() => {
                                                    closeNavBar();
                                                    setCareersDropdownOpen(
                                                        false
                                                    );
                                                }}
                                                className="block px-6 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
