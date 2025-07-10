import AboutCover from "../../assets/About_cover.jpg";

const AboutBanner = () => {
    return (
        <div className="bg-white text-[#2D3748] font-sans">
            <section
                className="relative bg-cover bg-center h-[90vh] flex items-center justify-center text-white"
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0,0,0,0.3)), url(${AboutCover})`,
                }}
            >
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        I Help To Make India Cleaner, Safer and Healthier
                    </h1>
                    <p className="text-xl md:text-2xl">
                        Own your future. Impact what matters
                    </p>
                </div>
            </section>
        </div>
    );
};

export default AboutBanner;
