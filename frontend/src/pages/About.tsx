const About = () => {
    return (
        <div className="bg-white text-[#2D3748] font-sans">
            <section
                className="relative bg-cover bg-center h-[90vh] flex items-center justify-center text-white"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1595433306946-233f47e4af3a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                }}
            >
                <div className="bg-black bg-opacity-50 w-full h-full absolute top-0 left-0"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        I Help To Make India Cleaner, Safer and Healthier
                    </h1>
                    <p className="text-xl md:text-2xl">
                        Own your future. Impact what matters
                    </p>
                </div>
            </section>

            <Testimonial />
            <JoinUs />
        </div>
    );
};

export default About;

const Testimonial = () => (
    <section className="py-16 bg-[#8BC34A] text-white text-center px-4">
        <blockquote className="max-w-4xl mx-auto text-xl italic">
            “GoGreen+ isn’t just about cleaning — it’s about restoring dignity
            to public spaces and creating a better tomorrow for all.”
        </blockquote>
        <p className="mt-4 font-bold">— Community Partner, Tripura</p>
    </section>
);

const JoinUs = () => (
    <section className="py-16 px-4 md:px-16">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#98CD00] mb-6">
                Join Our Talent Network
            </h2>
            <p className="mb-4">
                Explore how you can contribute to a sustainable India. Whether
                you're an experienced professional or just starting your
                journey, we're eager to meet change-makers like you.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
                <a
                    href="#"
                    className="bg-[#98CD00] text-white px-6 py-3 rounded hover:bg-[#2E7D32] transition"
                >
                    View Open Positions
                </a>
                <a
                    href="#"
                    className="bg-white border border-[#98CD00] text-[#98CD00] px-6 py-3 rounded hover:bg-[#98CD00] hover:text-white transition"
                >
                    Contact Us
                </a>
            </div>
            <p className="text-sm text-gray-500 mt-4">
                GoGreen+ is an equal opportunity employer. We value diversity
                and inclusion.
            </p>
            <p className="mt-2 font-semibold text-[#2E7D32]">
                Your future. Our mission. India's cleaner tomorrow.
            </p>
        </div>
    </section>
);
