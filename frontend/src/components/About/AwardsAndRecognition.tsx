import startupImage from "../../assets/StartupRecognizationGOT.jpeg";

const AwardsAndRecognition = () => {
    return (
        <section className="bg-gradient-to-b from-white to-gray-50 py-16 px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        🏅 Awards & Recognition
                    </h2>
                    <div className="w-20 h-1 bg-green-600 mx-auto rounded-full mb-4"></div>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Proud to be recognized and funded by the Government of India
                        for our innovative approach to sustainable waste management
                    </p>
                </div>

                {/* Certificate Display */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl border border-green-200 overflow-hidden">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                            <div className="flex items-center gap-4">
                                <span className="text-5xl">🏆</span>
                                <div>
                                    <h3 className="text-2xl font-bold">
                                        Government Recognition
                                    </h3>
                                    <p className="text-white/90 mt-1">
                                        Recognized as an Innovative Startup by Government of India
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Certificate Image */}
                        <div className="p-6 bg-gray-50">
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <img
                                    src={startupImage}
                                    alt="Government Recognition Certificate - GoGreen+ recognized as Innovative Startup by Government of India"
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        </div>
                        {/* Download Button */}
                        <div className="p-6 bg-green-50 border-t border-green-100">
                            <a
                                href={startupImage}
                                download="GoGreen_Government_Recognition_Certificate.jpg"
                                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                </svg>
                                Download Certificate
                            </a>
                        </div>
                    </div>
                </div>

                {/* Additional Info Banner */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center shadow-xl mt-8">
                    <h3 className="text-2xl font-bold mb-3">
                        Recognized for Innovation in Sustainability
                    </h3>
                    <p className="text-white/90 max-w-3xl mx-auto text-lg">
                        Our commitment to environmental sustainability and innovative
                        waste management solutions has earned us recognition from the
                        Government of India. We continue to work towards a cleaner,
                        greener future for all.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AwardsAndRecognition;
