import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

import { advisors, executives } from "../../data/data";

const Team = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-10">
            <section className="bg-gradient-to-br from-gray-50 to-white py-16 px-4 md:px-8 lg:px-16">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl text-primary md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text mb-4">
                            Our Team
                        </h2>
                    </div>
                    <div className="flex items-center justify-center mb-8">
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full mx-4"></div>
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                    </div>

                    <div className="flex justify-center gap-8 flex-wrap">
                        {executives.map((exec, idx) => (
                            <div
                                key={idx}
                                className="group relative w-64 h-80 bg-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer"
                                onClick={() => navigate(`/about/${exec.id}`)}
                            >
                                {exec.image ? (
                                    <img
                                        src={exec.image}
                                        alt={exec.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <User
                                            size={64}
                                            className="text-gray-400"
                                        />
                                    </div>
                                )}

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                                {/* Text Content */}
                                <div className="absolute bottom-0 left-0 w-full p-4 text-center text-white z-10">
                                    <h3 className="text-lg font-bold mb-1">
                                        {exec.name}
                                    </h3>
                                    <p className="text-sm italic">
                                        {exec.role}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-br from-gray-50 to-white py-16 px-4 md:px-8 lg:px-16">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl text-primary md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text mb-4">
                            Our Advisors
                        </h2>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full mx-4"></div>
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                    </div>

                    {/* Advisors Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                        {advisors.map((advisor, idx) => (
                            <div
                                key={idx}
                                className="group relative w-full h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer"
                                onClick={() => navigate(`/about/${advisor.id}`)}
                            >
                                {/* Full Image */}
                                {advisor.image ? (
                                    <img
                                        src={advisor.image}
                                        alt={advisor.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <User
                                            size={64}
                                            className="text-gray-400"
                                        />
                                    </div>
                                )}

                                {/* Gradient Overlay for readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                                {/* Text Content */}
                                <div className="absolute bottom-0 left-0 w-full p-4 text-center text-white z-10">
                                    <h3 className="text-lg font-bold mb-1">
                                        {advisor.name}
                                    </h3>
                                </div>

                                {/* Accent Line (optional, animates on hover) */}
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Team;
