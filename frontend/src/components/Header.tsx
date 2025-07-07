import React, { useState } from "react";
import { Link } from "react-router-dom";

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
        <header className="py-4 shadow-md sticky top-0 z-50 bg-white w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <nav className="flex justify-between flex-wrap items-center">
                    <div>
                        <Link to="/" onClick={closeNavBar}>
                            <div className="flex-shrink-0 text-primary text-2xl font-bold">
                                <img
                                    src={logoSrc}
                                    alt="GoGreen+ Logo"
                                    className="h-16 w-auto"
                                />
                            </div>
                        </Link>
                    </div>

                    <div className="md:hidden mr-4">
                        <button
                            onClick={toggleNavBar}
                            className="text-primary focus:outline-none"
                        >
                            {navOpen ? (
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>

                    <ul
                        className={`ml-auto md:flex md:w-auto md:items-center md:flex-row md:space-x-6 ${
                            navOpen
                                ? "w-full flex flex-col items-center space-y-2 mt-4"
                                : "hidden"
                        }`}
                    >
                        {navItems.map((item) =>
                            item.active ? (
                                <li key={item.name}>
                                    <Link
                                        to={item.slug}
                                        onClick={closeNavBar}
                                        className="inline-block font-medium text-[#333] px-4 py-2 duration-200 hover:text-hover-color transition text-base"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ) : null
                        )}

                        {/* Careers Dropdown */}
                        <li className="relative">
                            <button
                                onClick={toggleCareersDropdown}
                                className="font-medium text-[#333] px-4 py-2 duration-200 hover:text-hover-color transition text-base flex items-center focus:outline-none"
                            >
                                Careers
                                <svg
                                    className="w-4 h-4 ml-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.854a.75.75 0 111.08 1.04l-4.25 4.417a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
                                </svg>
                            </button>

                            {careersDropdownOpen && (
                                <div className="absolute bg-white shadow-lg rounded-md mt-2 py-2 w-48 z-20 md:right-0">
                                    {careersItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.slug}
                                            onClick={() => {
                                                closeNavBar();
                                                setCareersDropdownOpen(false);
                                            }}
                                            className="block px-4 py-2 text-sm text-[#333] hover:bg-hover-color hover:text-white transition duration-200"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
