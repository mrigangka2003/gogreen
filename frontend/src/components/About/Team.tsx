import { useNavigate } from "react-router-dom";

import { advisors } from "../../data/data";

const Team = () => {

    const navigate = useNavigate();


    return (
        <section className="bg-gradient-to-br from-gray-50 to-white py-16 px-4 md:px-8 lg:px-16">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl text-primary md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text mb-4">
                        Our Advisors
                    </h2>
                    
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                    {advisors.map((advisor, idx) => (
                        <div
                            key={idx}
                            className="group bg-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col items-center text-center p-6 transform hover:-translate-y-2 hover:scale-105 relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary-50 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
                            onClick={()=>navigate(`/about/${advisor.id}`)}
                        >
                            {advisor.image && (
                                <div className="relative mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <img
                                        src={advisor.image}
                                        alt={advisor.name}
                                        className="w-28 h-28 object-cover border-4 border-white shadow-lg relative z-10"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                </div>
                            )}

                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary-700 transition-colors duration-300">
                                    {advisor.name}
                                </h3>
                                <p className="text-sm text-gray-600 capitalize font-medium tracking-wide">
                                    {advisor.profession}
                                </p>
                            </div>

                            {/* Subtle accent line */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;
