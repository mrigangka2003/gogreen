import { Wind, Trash2, Factory } from "lucide-react";

const Manufacturing = () => {
    const services = [
        {
            icon: Wind,
            title: "EV Vacuum Cleaner",
            description: "Industrial and commercial vacuum cleaning solutions",
            color: "blue"
        },
        {
            icon: Trash2,
            title: "Door-to-Door Garbage Collection",
            description: "Comprehensive waste management and collection services",
            color: "green"
        },
        {
            icon: Factory,
            title: "Biogas Plant",
            description: "Complete biogas plant installation and maintenance",
            color: "orange"
        },
    ];

    const getColorClasses = (color: string) => {
        switch(color) {
            case 'blue': return 'bg-blue-50 text-blue-600 hover:bg-blue-100';
            case 'green': return 'bg-green-50 text-green-600 hover:bg-green-100';
            case 'orange': return 'bg-orange-50 text-orange-600 hover:bg-orange-100';
            default: return 'bg-gray-50 text-gray-600 hover:bg-gray-100';
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    Manufacturing
                </h2>
                <div className="w-20 h-1 bg-green-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => {
                    const IconComponent = service.icon;
                    return (
                        <div
                            key={index}
                            className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className="text-center">
                                <div className={`inline-flex p-4 rounded-2xl mb-6 transition-colors duration-300 ${getColorClasses(service.color)}`}>
                                    <IconComponent className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Manufacturing;