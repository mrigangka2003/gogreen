import React from "react";

interface ProductCardProps {
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
    reversed?: boolean;
    isDark?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
    title,
    description,
    imageSrc,
    imageAlt,
    reversed = false,
    isDark = false,
}) => {
    const bgClass = isDark ? "bg-[#98CD00]" : "bg-white";
    const textClass = isDark ? "text-white" : "text-gray-800";

    return (
        <section className={`${bgClass} py-16 transition-all duration-500`}>
            <div className="container mx-auto px-6">
                <div
                    className={`grid lg:grid-cols-2 gap-12 items-center ${
                        reversed ? "lg:grid-flow-col-dense" : ""
                    }`}
                >
                    {/* Image Section */}
                    <div
                        className={`flex justify-center ${
                            reversed ? "lg:col-start-2" : ""
                        }`}
                    >
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#98CD00] to-[#7AB800] rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                            <img
                                src={imageSrc}
                                alt={imageAlt}
                                className="relative max-w-full md:max-w-md w-full rounded-2xl shadow-2xl object-contain transform group-hover:scale-105 transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Content Section */}
                    <div
                        className={`${
                            reversed ? "lg:col-start-1" : ""
                        } space-y-6`}
                    >
                        <h2
                            className={`text-4xl lg:text-5xl font-bold ${textClass} leading-tight`}
                        >
                            {title}
                        </h2>
                        <div className="w-20 h-1 bg-[#98CD00] rounded-full"></div>
                        <p className={`text-xl ${textClass} leading-relaxed`}>
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

interface InnovationCardProps {
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
}

const InnovationCard: React.FC<InnovationCardProps> = ({
    title,
    description,
    imageSrc,
    imageAlt,
}) => {
    return (
        <div className="group relative rounded-2xl overflow-hidden shadow-xl h-96 transform hover:scale-105 transition-all duration-500">
            <img
                src={imageSrc}
                alt={imageAlt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <h3 className="text-2xl font-bold mb-3 group-hover:text-[#98CD00] transition-colors duration-300">
                    {title}
                </h3>
                <p className="text-lg opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    {description}
                </p>
            </div>
        </div>
    );
};

const ProductsAndServices: React.FC = () => {
    const products = [
        {
            title: "Mobilized Vacuum Cleaners",
            description:
                "Built for efficient large-scale outdoor cleaning with advanced suction technology and eco-friendly operations.",
            imageSrc: "/images/mobilized-vaccum-cleaner.png",
            imageAlt: "Mobilized Vacuum Cleaner",
            isDark: false,
        },
        {
            title: "Hand-Towing Vacuum Cleaners",
            description:
                "Compact and ideal for tight or urban spaces, providing powerful cleaning in a portable design.",
            imageSrc: "/images/hand-towing-vaccum-cleaner.png",
            imageAlt: "Hand-Towing Vacuum Cleaner",
            isDark: true,
            reversed: true,
        },
        {
            title: "Road Water-Spraying Machines",
            description:
                "Advanced dust suppression and surface hygiene systems for cleaner, healthier environments.",
            imageSrc: "/images/road-water-spray.png",
            imageAlt: "Road Water-Spraying Machine",
            isDark: false,
        },
        {
            title: "Floor Cleaning Machines",
            description:
                "Effective cleaning solutions for indoor and outdoor floors with superior performance and reliability.",
            imageSrc: "/images/floor-cleaning.png",
            imageAlt: "Floor Cleaning Machine",
            isDark: true,
            reversed: true,
        },
        {
            title: "Mosquito Control Chemical Sprays",
            description:
                "Specially formulated eco-friendly sprays to curb mosquito breeding and protect public health effectively.",
            imageSrc: "/images/mosquito-ccs.png",
            imageAlt: "Mosquito Control Chemical Spray",
            isDark: false,
        },
        {
            title: "Eco-Friendly Phenyl",
            description:
                "High-quality, environmentally safe disinfectant for daily hygiene use in homes and commercial spaces.",
            imageSrc: "/images/eco-friendly-phenyl.png",
            imageAlt: "Eco-Friendly Phenyl",
            isDark: true,
            reversed: true,
        },
    ];

    const innovations = [
        {
            title: "Waste-to-Fuel Systems",
            description:
                "Revolutionary technology converting waste into clean, usable energy for sustainable communities.",
            imageSrc: "/images/waste-to-fuel.png",
            imageAlt: "Waste-to-Fuel System",
        },
        {
            title: "Pond Water Restoration Units",
            description:
                "Advanced systems for enhancing aquatic ecosystems and improving water quality naturally.",
            imageSrc: "/images/pond-restoration.png",
            imageAlt: "Pond Water Restoration Unit",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header */}
            <header className="relative bg-gradient-to-br from-[#98CD00] via-[#7AB800] to-[#5EA600] text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
                </div>
                <div className="relative container mx-auto px-6 py-20 text-center">
                    <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                        Products & Services
                    </h1>
                    <div className="w-24 h-1 bg-white mx-auto mb-6 rounded-full"></div>
                    <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed opacity-95">
                        Empowering Clean, Green, and Healthy Communities Through
                        Innovation
                    </p>
                </div>
            </header>

            {/* Products Section */}
            <div className="space-y-0">
                {products.map((product, index) => (
                    <ProductCard
                        key={index}
                        title={product.title}
                        description={product.description}
                        imageSrc={product.imageSrc}
                        imageAlt={product.imageAlt}
                        isDark={product.isDark}
                        reversed={product.reversed}
                    />
                ))}
            </div>

            {/* Future Innovations Section */}
            <section className="bg-white py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                            Future Innovations
                        </h2>
                        <div className="w-24 h-1 bg-[#98CD00] mx-auto mb-6 rounded-full"></div>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Pioneering tomorrow's solutions for a sustainable
                            world
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        {innovations.map((innovation, index) => (
                            <InnovationCard
                                key={index}
                                title={innovation.title}
                                description={innovation.description}
                                imageSrc={innovation.imageSrc}
                                imageAlt={innovation.imageAlt}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProductsAndServices;
