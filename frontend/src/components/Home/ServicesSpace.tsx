const ServicesSpaces = () => {
    const spacesData = [
        {
            title: "Public & Institutional Spaces",
            items: [
                "Government Offices",
                "Semi-Government Establishments",
                "Private Institutions",
                "Public Toilets",
                "Heritage Sites",
                "Tourist Attractions",
                "Parks & Gardens",
            ],
        },
        {
            title: "Sports & Entertainment",
            items: ["Sports Complexes", "Stadiums", "Event Venues"],
        },
        {
            title: "Residential & Lifestyle",
            items: ["Private Homes", "Apartments & Housing Complexes"],
        },
        {
            title: "Commercial & Retail",
            items: [
                "Shops & Showrooms",
                "Restaurants & Cafes",
                "Hotels & Resorts",
                "Petrol Pumps",
                "Cinema Halls",
            ],
        },
        {
            title: "Healthcare & Education",
            items: [
                "Hospitals & Clinics",
                "Colleges & Universities",
                "Coaching Centres",
                "Hostels",
                "Schools",
            ],
        },
    ];
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <div className="group flex flex-col justify-center items-center bg-white border border-primary rounded-2xl my-6 px-6 py-8 text-center hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg">
                <h2 className="text-3xl sm:text-4xl font-bold text-primary group-hover:text-white transition-colors duration-300">
                    Services We Provide
                </h2>
                <p className="mt-3 text-base sm:text-lg font-medium text-hover-color group-hover:text-white transition-colors duration-300 max-w-xl">
                    Discover all the spaces where our services are available
                </p>
            </div>
            {/* Cards Grid */}
            <div className="flex flex-wrap justify-center gap-6">
                {spacesData.map((category, index) => (
                    <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-5 w-full sm:w-[calc(50%-12px)] lg:w-[calc(20%-19.2px)]"
                    >
                        <h3 className="text-lg font-semibold text-green-700 mb-4">
                            {category.title}
                        </h3>
                        <ul className="space-y-2">
                            {category.items.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md border border-gray-100 hover:border-green-200 hover:text-green-700 transition"
                                >
                                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ServicesSpaces;