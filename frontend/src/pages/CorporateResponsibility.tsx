import React from "react";

interface ResponsibilityCardProps {
    title: string;
    items: Array<{
        label: string;
        description: string;
    }>;
    isDark?: boolean;
    icon: React.ReactNode;
}

const ResponsibilityCard: React.FC<ResponsibilityCardProps> = ({
    title,
    items,
    isDark = false,
    icon,
}) => {
    const cardClass = isDark
        ? "bg-gradient-to-br from-green-600 to-green-700 text-white"
        : "bg-white text-gray-800 border-l-4 border-green-600";

    const itemIconClass = isDark
        ? "bg-white text-green-600"
        : "bg-green-600 text-white";

    return (
        <div
            className={`p-10 rounded-3xl shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 ${cardClass}`}
        >
            <h2
                className={`text-4xl font-bold mb-8 flex items-center transition-colors duration-300 ${
                    isDark ? "text-white hover:text-green-200" : "text-green-600 hover:text-green-700"
                }`}
            >
                <div className="mr-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110">{icon}</div>
                {title}
            </h2>
            <ul className="space-y-6 text-lg">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start group">
                        <span
                            className={`${itemIconClass} p-2 rounded-full mr-4 mt-1 flex-shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </span>
                        <div className="group-hover:translate-x-2 transition-transform duration-300">
                            <strong
                                className={`${
                                    isDark ? "text-white group-hover:text-green-200" : "text-green-600 group-hover:text-green-700"
                                } font-semibold text-xl transition-colors duration-300`}
                            >
                                {item.label}:
                            </strong>
                            <span className="ml-2 leading-relaxed group-hover:text-opacity-90 transition-all duration-300">
                                {item.description}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface ImpactCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const ImpactCard: React.FC<ImpactCardProps> = ({
    title,
    description,
    icon,
}) => {
    return (
        <div className="group relative bg-gradient-to-br from-green-600 to-green-700 text-white p-10 rounded-3xl shadow-xl transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:rotate-1 hover:bg-gradient-to-br hover:from-green-500 hover:to-green-600">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
                <div className="flex justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                    <span className="p-4 bg-white rounded-2xl inline-block shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                        <div className="text-green-600 group-hover:text-green-700 transition-colors duration-300">{icon}</div>
                    </span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center group-hover:text-green-200 transition-colors duration-300">
                    {title}
                </h3>
                <p className="text-center text-lg leading-relaxed opacity-95 group-hover:opacity-100 transition-opacity duration-300">
                    {description}
                </p>
            </div>
        </div>
    );
};

const CorporateResponsibility: React.FC = () => {
    const environmentIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
        </svg>
    );

    const communityIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
        </svg>
    );

    const integrityIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
        </svg>
    );

    const environmentItems = [
        {
            label: "Environmental Stewardship",
            description:
                "From reducing waste to conserving natural resources, we take active steps to protect the planet.",
        },
        {
            label: "Sustainable Waste Management",
            description:
                "We design smart waste systems that focus on reducing landfill dependency through recycling, sorting, and responsible disposal.",
        },
        {
            label: "Greener Public Spaces",
            description:
                "We lead tree-planting initiatives, support biodiversity, and help cities reclaim neglected spaces through eco-friendly beautification.",
        },
        {
            label: "Eco-Innovation at Work",
            description:
                "Our products and processes evolve to meet high environmental standards — because we believe innovation must serve the planet.",
        },
    ];

    const communityItems = [
        {
            label: "Education & Awareness",
            description:
                "Through workshops, school programs, and NGO partnerships, we raise awareness about hygiene, waste segregation, and sustainability.",
        },
        {
            label: "Local Development",
            description:
                "We help create and maintain essential sanitation infrastructure, especially in underserved areas.",
        },
        {
            label: "Jobs with Dignity",
            description:
                "We provide not just employment but also training and growth opportunities in green industries.",
        },
    ];

    const integrityItems = [
        {
            label: "Compliance & Transparency",
            description:
                "We follow all local regulations and maintain clear communication with our stakeholders.",
        },
        {
            label: "Accountability in Action",
            description:
                "We regularly assess our programs and publicly share our progress.",
        },
        {
            label: "Measuring What Matters",
            description:
                "We track and report results across environmental, social, and economic metrics.",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 py-24 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-green-600/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-600/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-20">
                        <h1 className="text-6xl lg:text-7xl font-bold mb-8 text-gray-800 leading-tight hover:text-gray-700 transition-colors duration-300 cursor-default">
                            A Cleaner Tomorrow,{" "}
                            <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent hover:from-green-500 hover:to-green-600 transition-all duration-300">
                                A Shared Responsibility
                            </span>
                        </h1>
                        <div className="w-32 h-2 bg-gradient-to-r from-green-600 to-green-700 rounded-full mx-auto mb-8 hover:w-40 transition-all duration-300"></div>
                        <p className="text-2xl max-w-4xl mx-auto leading-relaxed text-gray-700 hover:text-gray-600 transition-colors duration-300">
                            At{" "}
                            <span className="font-bold text-green-600 hover:text-green-700 transition-colors duration-300">
                                Go Green+
                            </span>
                            , corporate responsibility isn't a side initiative —
                            it's the way we do business. We're building a future
                            where environmental care, community upliftment, and
                            ethical practices go hand in hand.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="space-y-20">
                        {/* Environment Section */}
                        <ResponsibilityCard
                            title="Caring for the Environment"
                            items={environmentItems}
                            icon={environmentIcon}
                        />

                        {/* Communities Section */}
                        <ResponsibilityCard
                            title="Strengthening Communities"
                            items={communityItems}
                            isDark={true}
                            icon={communityIcon}
                        />

                        {/* Integrity Section */}
                        <ResponsibilityCard
                            title="Acting with Integrity"
                            items={integrityItems}
                            icon={integrityIcon}
                        />
                    </div>

                    {/* Impact Cards */}
                    <div className="mt-24 mb-20">
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-bold text-gray-800 mb-6 hover:text-green-600 transition-colors duration-300 cursor-default">
                                Our Impact
                            </h2>
                            <div className="w-24 h-2 bg-gradient-to-r from-green-600 to-green-700 rounded-full mx-auto hover:w-32 transition-all duration-300"></div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            <ImpactCard
                                title="Environmental Impact"
                                description="Reduced waste, increased recycling, cleaner spaces."
                                icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-10 w-10"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                }
                            />
                            <ImpactCard
                                title="Social Impact"
                                description="Community reach, engagement levels, and empowerment metrics."
                                icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-10 w-10"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    </svg>
                                }
                            />
                            <ImpactCard
                                title="Economic Impact"
                                description="Local jobs created, skills developed, and long-term financial inclusion."
                                icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-10 w-10"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                }
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CorporateResponsibility;