import { Link } from "react-router-dom";

import { Quote, Hero } from "../components";

const Home = () => {
    return (
        <main className="flex flex-col">
            <Hero />
            <Quote />
            <AboutButton />
        </main>
    );
};

const AboutButton = () => {
    return (
        <div className="w-full px-4 py-8 flex justify-center">
            <Link to={"/about"} className="w-full max-w-2xl">
                <button
                    className="
                        w-full bg-[#98CD00] text-white font-semibold 
                        py-4 px-8 rounded-lg shadow-lg 
                        hover:bg-[#85B800] transition-colors duration-300 
                        focus:outline-none focus:ring-2 focus:ring-[#98CD00] focus:ring-opacity-75 
                        text-lg md:text-xl
                    "
                >
                    Get to Know GO GreenPlus
                </button>
            </Link>
        </div>
    );
};

export default Home;
