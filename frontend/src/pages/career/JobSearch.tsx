import React, { useState } from 'react';
import { Search, MapPin, Clock, Briefcase, Filter } from 'lucide-react';

interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    type: string;
    description: string;
    postedDate: string;
    salary?: string;
}

const JobSearch: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    // Sample job data
    const jobs: Job[] = [
        {
            id: 1,
            title: "EV Charging Station Operator",
            company: "GoGreen Energy",
            location: "Agartala, Tripura",
            type: "Full-time",
            description: "We are looking for an experienced EV Charging Station Operator to monitor, maintain, and assist customers at our charging stations across Tripura. You will ensure smooth operations and support eco-friendly commuting.",
            postedDate: "2 days ago",
            salary: "₹3.5 LPA - ₹5 LPA"
        },
        {
            id: 2,
            title: "Solar Panel Installer",
            company: "GoGreen Energy",
            location: "Udaipur, Tripura",
            type: "Full-time",
            description: "Join our renewable team as a Solar Panel Installer. You'll work on projects installing and maintaining solar panels for residential and commercial clients in Tripura.",
            postedDate: "1 week ago",
            salary: "₹3 LPA - ₹4.5 LPA"
        },
        {
            id: 3,
            title: "Battery Recycling Technician",
            company: "GoGreen Energy",
            location: "Remote (Tripura Region)",
            type: "Contract",
            description: "Looking for a skilled technician to handle battery recycling and eco-friendly disposal processes. Knowledge of safety standards and recycling practices required.",
            postedDate: "3 days ago",
            salary: "₹400 - ₹600/hour"
        },
        {
            id: 4,
            title: "Sustainability Project Manager",
            company: "GoGreen Energy",
            location: "Dharmanagar, Tripura",
            type: "Full-time",
            description: "We need a Project Manager to lead sustainability initiatives in Tripura. You'll coordinate teams to deliver green energy solutions and eco-conscious infrastructure.",
            postedDate: "5 days ago",
            salary: "₹6 LPA - ₹8 LPA"
        },
        {
            id: 5,
            title: "Green Fleet Technician",
            company: "GoGreen Energy",
            location: "Belonia, Tripura",
            type: "Part-time",
            description: "Join our maintenance team to service and repair electric vehicles in our eco-friendly fleet. Experience with EV systems and diagnostics required.",
            postedDate: "1 day ago",
            salary: "₹4 LPA - ₹5.5 LPA"
        }

    ];

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || job.type.toLowerCase() === selectedType;
        return matchesSearch && matchesType;
    });


    const handleApply = (jobId: number, jobTitle: string) => {
    const recipient = 'gogreenplus.in@gmail.com';
    const subject = `Application for ${jobId} (ID: ${jobTitle})`;
    const body = `Dear Hiring Team,

I am writing to express my interest in the ${jobTitle} position (Internship ID: ${jobId}).

Contact Details:
Name: [Your Name]
Email: [Your Email]
Phone: [Your Phone]

Please find my resume attached to this email.

Thank you for considering my application.

Best regards,
[Your Name]`;

    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
};

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Search</h1>
                    <p className="text-gray-600">Find your next career opportunity</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search jobs, companies, or keywords..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Job Type Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white min-w-40"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                        {searchTerm && ` for "${searchTerm}"`}
                    </p>
                </div>

                {/* Job Listings */}
                <div className="space-y-6">
                    {filteredJobs.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                            <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <div key={job.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
                                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                                    <div className="flex-1">
                                        {/* Job Title and Company */}
                                        <div className="mb-3">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
                                            <p className="text-lg text-gray-700">{job.company}</p>
                                        </div>

                                        {/* Job Meta Information */}
                                        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" />
                                                {job.type}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {job.postedDate}
                                            </div>
                                            {job.salary && (
                                                <div className="text-green-600 font-medium">
                                                    {job.salary}
                                                </div>
                                            )}
                                        </div>

                                        {/* Job Description */}
                                        <p className="text-gray-700 leading-relaxed mb-4 lg:mb-0">
                                            {job.description}
                                        </p>
                                    </div>

                                    {/* Apply Button */}
                                    <div className="lg:ml-6">
                                        <button
                                            onClick={() => handleApply(job.id, job.title)}
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

                {/* Load More Button (if needed for pagination) */}
                {filteredJobs.length > 0 && (
                    <div className="mt-8 text-center">
                        <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200">
                            Load More Jobs
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobSearch;