import React from "react";

import { services,futureInnovations } from "../data/data";

interface ProductCardProps {
    title: string;
    description: string;
    imageSrc: string;
    reversed?: boolean;
}

interface InnovationCardProps {
    title: string;
    description: string;
    imageSrc: string;
}

const ProductsAndServices: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header with Modern Design */}
            <header className="relative bg-gradient-to-br from-emerald-700 via-lime-600 to-emerald-900 text-white overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full opacity-30">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-900/30 to-emerald-900/60"></div>
                </div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>

                <div className="relative container mx-auto px-6 py-24 lg:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/90 mb-8 border border-white/20">
                            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                            Innovation for Tomorrow
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                            Products & Services
                        </h1>

                        <div className="flex items-center justify-center mb-8">
                            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"></div>
                            <div className="w-3 h-3 bg-white rounded-full mx-4"></div>
                            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"></div>
                        </div>

                        <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-200 font-light">
                            Empowering Clean, Green, and Healthy Communities Through
                            <span className="text-white font-medium"> Innovation</span>
                        </p>
                    </div>
                </div>
            </header>

            {/* Products Section with Modern Cards */}
            <div className="space-y-0">
                {services.map((product, index) => (
                    <ProductCard
                        key={index}
                        title={product.title}
                        description={product.description}
                        imageSrc={product.image}
                        reversed={product.reversed}
                    />
                ))}
            </div>

            {/* Future Innovations Section */}
            <section className="bg-white py-24 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>

                <div className="container mx-auto px-6 relative">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full text-sm font-medium text-green-700 mb-6 border border-green-200">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Coming Soon
                        </div>

                        <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                            Future Innovations
                        </h2>

                        <div className="flex items-center justify-center mb-8">
                            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full mx-4"></div>
                            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                        </div>

                        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                            Pioneering tomorrow's solutions for a
                            <span className="text-green-600 font-medium"> sustainable world</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {futureInnovations.map((innovation, index) => (
                            <InnovationCard
                                key={index}
                                title={innovation.title}
                                description={innovation.description}
                                imageSrc={innovation.image}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

const ProductCard: React.FC<ProductCardProps> = ({
    title,
    description,
    imageSrc,
    reversed = false,
}) => {
    const bgColor = reversed ? "bg-white" : "bg-green-600";
    const textColor = reversed ? "text-gray-900" : "text-white";

    return (
        <section className={`${bgColor} py-20 lg:py-28 relative overflow-hidden`}>
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className={`absolute top-0 right-0 w-96 h-96 ${reversed ? 'bg-green-100/50' : 'bg-green-800/20'} rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2`}></div>
                <div className={`absolute bottom-0 left-0 w-80 h-80 ${reversed ? 'bg-green-50/50' : 'bg-green-700/20'} rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2`}></div>
            </div>

            <div className="container mx-auto px-6 relative">
                <div className={`grid lg:grid-cols-2 gap-16 items-center ${reversed ? "lg:grid-flow-col-dense" : ""}`}>
                    {/* Image Section */}
                    <div className={`flex justify-center ${reversed ? "lg:col-start-2" : ""}`}>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-green-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
                            <div className="relative overflow-hidden rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                                <img
                                    src={imageSrc}
                                    alt={title}
                                    className="w-full h-80 lg:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                            </div>
                        </div>
                    </div>

                    {/* Text Section */}
                    <div className={`${reversed ? "lg:col-start-1" : ""} space-y-8`}>
                        <div className="space-y-6">
                            <h2 className={`text-4xl lg:text-5xl font-bold leading-tight ${textColor}`}>
                                {title}
                            </h2>
                            <div className="flex items-center">
                                <div className={`w-12 h-0.5 ${reversed ? 'bg-green-600' : 'bg-green-400'}`}></div>
                                <div className={`w-2 h-2 ${reversed ? 'bg-green-600' : 'bg-green-400'} rounded-full mx-3`}></div>
                                <div className={`w-8 h-0.5 ${reversed ? 'bg-green-600' : 'bg-green-400'}`}></div>
                            </div>
                        </div>
                        <p className={`text-xl leading-relaxed ${textColor} opacity-90 font-light`}>
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

const InnovationCard: React.FC<InnovationCardProps> = ({
    title,
    description,
    imageSrc,
}) => {
    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            {/* Image Section */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={imageSrc}
                    alt={title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                    {title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-light mb-6">
                    {description}
                </p>
                <div className="flex items-center text-green-600 font-medium group-hover:text-green-700 transition-colors duration-300">
                    <span className="text-sm">Coming Soon</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-green-200 transition-all duration-300"></div>
        </div>
    );
};

export default ProductsAndServices;