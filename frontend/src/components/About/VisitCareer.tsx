import { Link } from "react-router-dom";


const VisitCareer = () => {
    return (
        <section className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-semibold text-green-600 mb-6">
                    Join Our Mission
                </h2>
                <p className="text-gray-700 mb-6">
                    Be part of Go Green+ and help transform India into a
                    cleaner, safer, and healthier nation. Explore exciting
                    opportunities in sales, service, production, and more.
                </p>
                <Link
                    to="/careers"
                    className="inline-block bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition"
                >
                    View Career Opportunities
                </Link>
            </div>
        </section>
    );
};

export default VisitCareer;
