import React, { useState } from "react";
import { Search, MapPin, Clock, Briefcase, Filter } from "lucide-react";

interface Internship {
    id: number;
    title: string;
    company: string;
    location: string;
    type: string;
    description: string;
    postedDate: string;
    stipend?: string;
}

const Internships: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");

    // Sample internship data
    const internships: Internship[] = [
        {
            id: 1,
            title: "Frontend Developer Intern",
            company: "GoGreen Energy",
            location: "Agartala, Tripura",
            type: "Full-time",
            description:
                "Assist in building and improving GoGreen’s web applications using React and TypeScript. Great learning opportunity for freshers passionate about clean technology.",
            postedDate: "2 days ago",
            stipend: "₹8,000 - ₹12,000/month",
        },
        {
            id: 2,
            title: "Marketing Intern",
            company: "GoGreen Energy",
            location: "Udaipur, Tripura",
            type: "Part-time",
            description:
                "Work with our marketing team to promote GoGreen’s eco-friendly solutions. Gain hands-on experience in social media, campaigns, and community engagement.",
            postedDate: "1 week ago",
            stipend: "₹5,000 - ₹8,000/month",
        },
        {
            id: 3,
            title: "HR Intern",
            company: "GoGreen Energy",
            location: "Remote (Tripura Region)",
            type: "Internship",
            description:
                "Support our HR team in recruitment, onboarding, and employee engagement initiatives. A great opportunity to learn HR practices in a growing green energy company.",
            postedDate: "3 days ago",
            stipend: "₹6,000 - ₹9,000/month",
        },
        {
            id: 4,
            title: "Content Writing Intern",
            company: "GoGreen Energy",
            location: "Dharmanagar, Tripura",
            type: "Part-time",
            description:
                "Help create blog posts, social media content, and articles to spread awareness about renewable energy and sustainable practices.",
            postedDate: "5 days ago",
            stipend: "₹4,000 - ₹7,000/month",
        },
        {
            id: 5,
            title: "Operations Intern",
            company: "GoGreen Energy",
            location: "Belonia, Tripura",
            type: "Full-time",
            description:
                "Work closely with our operations team to manage EV fleet schedules, track resources, and ensure smooth field activities.",
            postedDate: "1 day ago",
            stipend: "₹7,000 - ₹10,000/month",
        },
    ];

    const filteredInternships = internships.filter((internship) => {
        const matchesSearch =
            internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            internship.company
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            internship.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        const matchesType =
            selectedType === "all" ||
            internship.type.toLowerCase() === selectedType;
        return matchesSearch && matchesType;
    });

    const handleApply = (internshipId: number, internshipTitle: string) => {
        const recipient = "gogreenplus.in@gmail.com";
        const subject = `Application for ${internshipTitle} (ID: ${internshipId})`;
        const body = `Dear Hiring Team,

I am writing to express my interest in the ${internshipTitle} position (Internship ID: ${internshipId}).

Contact Details:
Name: [Your Name]
Email: [Your Email]
Phone: [Your Phone]

Please find my resume attached to this email.

Thank you for considering my application.

Best regards,
[Your Name]`;

        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(
            subject
        )}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Internship Search
                    </h1>
                    <p className="text-gray-600">
                        Find your next learning opportunity
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search internships, companies, or keywords..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Internship Type Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white min-w-40"
                                value={selectedType}
                                onChange={(e) =>
                                    setSelectedType(e.target.value)
                                }
                            >
                                <option value="all">All Types</option>
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="internship">Internship</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing {filteredInternships.length} internship
                        {filteredInternships.length !== 1 ? "s" : ""}
                        {searchTerm && ` for "${searchTerm}"`}
                    </p>
                </div>

                {/* Internship Listings */}
                <div className="space-y-6">
                    {filteredInternships.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No internships found
                            </h3>
                            <p className="text-gray-600">
                                Try adjusting your search criteria or check back
                                later for new opportunities.
                            </p>
                        </div>
                    ) : (
                        filteredInternships.map((internship) => (
                            <div
                                key={internship.id}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
                            >
                                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                                    <div className="flex-1">
                                        {/* Internship Title and Company */}
                                        <div className="mb-3">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                {internship.title}
                                            </h3>
                                            <p className="text-lg text-gray-700">
                                                {internship.company}
                                            </p>
                                        </div>

                                        {/* Internship Meta Information */}
                                        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {internship.location}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" />
                                                {internship.type}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {internship.postedDate}
                                            </div>
                                            {internship.stipend && (
                                                <div className="text-green-600 font-medium">
                                                    {internship.stipend}
                                                </div>
                                            )}
                                        </div>

                                        {/* Internship Description */}
                                        <p className="text-gray-700 leading-relaxed mb-4 lg:mb-0">
                                            {internship.description}
                                        </p>
                                    </div>

                                    {/* Apply Button */}
                                    <div className="lg:ml-6">
                                        <button
                                            onClick={() =>
                                                handleApply(
                                                    internship.id,
                                                    internship.title
                                                )
                                            }
                                            className="bg-primary text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:bg-[#1a8d3f] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none w-full lg:w-auto whitespace-nowrap"
                                        >
                                            Apply Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Internships;
