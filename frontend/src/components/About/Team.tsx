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
                                className="group bg-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col items-center text-center p-6 transform hover:-translate-y-2 hover:scale-105 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary-50 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
                                onClick={() => navigate(`/about/${exec.id}`)}
                            >
                                <div className="relative mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {exec.image ? (
                                        <img
                                            src={exec.image}
                                            alt={exec.name}
                                            className="w-40 h-40 object-cover border-4 border-white shadow-lg relative z-10"
                                        />
                                    ) : (
                                        <div className="w-40 h-40 flex items-center justify-center bg-gray-100 border-4 border-white shadow-lg rounded-2xl">
                                            <User
                                                size={64}
                                                className="text-gray-400"
                                            />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-primary-700 transition-colors duration-300">
                                        {exec.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 italic">
                                        {exec.role}
                                    </p>
                                </div>

                                {/* Subtle accent line */}
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
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
                    <div className="flex items-center justify-center mb-8">
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full mx-4"></div>
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                        {advisors.map((advisor, idx) => (
                            <div
                                key={idx}
                                className="group bg-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col items-center text-center p-6 transform hover:-translate-y-2 hover:scale-105 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary-50 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
                                onClick={() => navigate(`/about/${advisor.id}`)}
                            >
                                {advisor.image && (
                                    <div className="relative mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <img
                                            src={advisor.image}
                                            alt={advisor.name}
                                            className="w-40 h-40 object-cover border-4 border-white shadow-lg relative z-10 rounded-2xl"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    </div>
                                )}

                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary-700 transition-colors duration-300">
                                        {advisor.name}
                                    </h3>
                                </div>

                                {/* Subtle accent line */}
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
