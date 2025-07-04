import React from "react";

interface FooterProps {
    className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
    return (
        <footer className={`bg-white ${className}`}>
            <div className="mx-auto w-full">
                <div className="grid grid-cols-2 gap-8 px-4 py-6 lg:py-8 md:grid-cols-3">
                    <div>
                        <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">
                            Company
                        </h2>
                        <ul className="text-gray-500 font-medium">
                            <li className="mb-4">
                                <a href="#" className="hover:underline">
                                    About
                                </a>
                            </li>
                            <li className="mb-4">
                                <a href="#" className="hover:underline">
                                    Careers
                                </a>
                            </li>
                            <li className="mb-4">
                                <a href="#" className="hover:underline">
                                    Board Members
                                </a>
                            </li>
                            <li className="mb-4">
                                <a href="#" className="hover:underline">
                                    Blog
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">
                            Help center
                        </h2>
                        <ul className="text-gray-500 font-medium">
                            <li className="mb-4">
                                <a href="#" className="hover:underline">
                                    Facebook
                                </a>
                            </li>
                            <li className="mb-4">
                                <a href="#" className="hover:underline">
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">
                            Legal
                        </h2>
                        <ul className="text-gray-500 font-medium">
                            <li className="mb-4">
                                <a href="#" className="hover:underline">
                                    Privacy Policy
                                </a>
                            </li>
                            <li className="mb-4">
                                <a href="#" className="hover:underline">
                                    Licensing
                                </a>
                            </li>
                            <li className="mb-4">
                                <a href="#" className="hover:underline">
                                    Terms & Conditions
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="px-4 py-6 bg-gray-100 md:flex md:items-center md:justify-between">
                    <span className="text-sm text-gray-500 sm:text-center">
                        © 2025 <a href="#">Gogreen+</a>. All Rights Reserved.
                    </span>
                    <div className="flex mt-4 sm:justify-center md:mt-0 space-x-5 rtl:space-x-reverse">
                        {/* Facebook */}
                        <a
                            href="#"
                            className="text-gray-400 hover:text-gray-900"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 8 19"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z" />
                            </svg>
                            <span className="sr-only">Facebook page</span>
                        </a>

                        {/* Instagram */}
                        <a
                            href="#"
                            className="text-gray-400 hover:text-gray-900"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5Zm0 1.5h8.5A4.25 4.25 0 0 1 20.5 7.75v8.5A4.25 4.25 0 0 1 16.25 20.5h-8.5A4.25 4.25 0 0 1 3.5 16.25v-8.5A4.25 4.25 0 0 1 7.75 3.5ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm4.75-.88a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
                            </svg>
                            <span className="sr-only">Instagram</span>
                        </a>

                        {/* WhatsApp */}
                        <a
                            href="#"
                            className="text-gray-400 hover:text-gray-900"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 32 32"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M16.006 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.46 1.76 6.38L3.2 28.8l6.72-1.78c1.84 1 3.92 1.54 6.08 1.54 7.06 0 12.8-5.74 12.8-12.8s-5.74-12.8-12.8-12.8zm0 23.04c-1.82 0-3.6-.5-5.16-1.44l-.36-.2-3.98 1.06 1.06-3.86-.24-.4a10.934 10.934 0 0 1-1.66-5.8c0-6.06 4.94-11 11-11s11 4.94 11 11-4.94 11-11 11zm6.14-8.18c-.34-.17-2.02-1-2.34-1.12-.32-.12-.56-.17-.8.17-.24.34-.92 1.12-1.12 1.36-.2.24-.4.26-.74.09s-1.44-.53-2.74-1.7c-1.02-.91-1.72-2.04-1.92-2.38-.2-.34 0-.52.15-.68.15-.15.34-.4.52-.6.17-.2.23-.34.34-.57.12-.24.06-.43 0-.6s-.8-1.92-1.1-2.64c-.29-.7-.58-.61-.8-.62-.2-.01-.43-.01-.66-.01s-.6.09-.92.43c-.32.34-1.22 1.2-1.22 2.93s1.25 3.4 1.42 3.64c.17.23 2.46 3.76 5.96 5.27 2.18.94 3.03 1.02 4.12.86.66-.1 2.02-.83 2.3-1.64.28-.82.28-1.53.2-1.68-.08-.14-.3-.22-.64-.39z" />
                            </svg>
                            <span className="sr-only">WhatsApp</span>
                        </a>

                        {/* YouTube */}
                        <a
                            href="#"
                            className="text-gray-400 hover:text-gray-900"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 576 512"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M549.7 124.1c-6.3-23.7-24.9-42.3-48.6-48.6C456.1 64 288 64 288 64S119.9 64 74.9 75.5c-23.7 6.3-42.3 24.9-48.6 48.6C16 169.1 16 256 16 256s0 86.9 10.3 131.9c6.3 23.7 24.9 42.3 48.6 48.6C119.9 448 288 448 288 448s168.1 0 213.1-11.5c23.7-6.3 42.3-24.9 48.6-48.6C560 342.9 560 256 560 256s0-86.9-10.3-131.9zM232 336V176l142.7 80L232 336z" />
                            </svg>
                            <span className="sr-only">YouTube channel</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
