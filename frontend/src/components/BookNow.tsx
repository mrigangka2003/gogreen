import { PhoneCall } from "lucide-react";
import { Link } from "react-router-dom";

const BookNowButton = () => {
    return (
        <Link to="/book-now">
            <button className="fixed bottom-6 right-6 z-50 bg-primary text-white text-xl font-bold px-8 py-5 rounded-full shadow-2xl hover:bg-green-700 transition-all duration-300 flex items-center gap-3 md:px-10 md:py-6 md:text-2xl">
                <PhoneCall className="w-6 h-6 md:w-7 md:h-7" />
                Book Now
            </button>
        </Link>
    );
};

export default BookNowButton;
