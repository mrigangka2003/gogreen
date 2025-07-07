import { Link } from "react-router-dom";

import { Quote, Hero, ServicesSpaces, Manufacturing, JoinUs } from "../components";

const Home = () => {
    return (
        <main className="flex flex-col gap-10">
            <Hero />
            <Quote />
            <ServicesSpaces/>
            <AboutButton />
            <Manufacturing/>
            <JoinUs/>
        </main>
    );
};

const AboutButton = () => {
    return (
        <div className="w-full px-4 py-8 flex justify-center">
            <Link to={"/about"} className="w-full max-w-2xl">
                <button
                    className="
                        w-full bg-primary text-white font-semibold 
                        py-4 px-8 rounded-lg shadow-lg 
                        hover:bg-hover-color transition-colors duration-300 
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
