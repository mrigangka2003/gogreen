const JoinUs = () => {
    // Replace this with your official email address
    const email = "gogreenplus.in@gmail.com";
    const subject =
        "We want to partner with you and make the city green and clean";

    const handleEmailClick = () => {
        // Encode the subject properly for email clients
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
            subject
        )}`;
        window.location.href = mailtoLink;
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-10">
            <div className="max-w-6xl mx-auto border border-gray-200 shadow-2xl rounded-3xl overflow-hidden">
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 sm:p-12 text-center overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-10 right-10 w-32 h-32 bg-[#98CD00]/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#98CD00]/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6 sm:mb-8 text-primary">
                            Join Us
                        </h2>

                        <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-4xl mx-auto text-gray-700 leading-relaxed">
                            Be part of the change you want to see! We're
                            inviting NGOs, volunteers, and community groups to
                            join us in our efforts to reduce our environmental
                            footprint and promote sustainability. Let's work
                            together to make a difference.
                        </p>

                        <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-12 leading-relaxed">
                            Together, let's shape a cleaner, fairer, and more
                            sustainable India.
                        </p>

                        {/* Updated button */}
                        <button
                            onClick={handleEmailClick}
                            className="group relative px-10 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-primary to-hover-color text-white font-bold text-lg sm:text-xl rounded-full shadow-2xl transform transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 hover:scale-105"
                        >
                            <span className="relative z-10">
                                Partner With Us
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-hover-color to-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinUs;
