import { useParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";

import { advisors } from "../data/data";

const MemberPage = () => {
    const { memberId } = useParams();


    const member = advisors.find((m) => memberId === m.id);

    if (!member) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Advisor Not Found
                    </h2>
                    <p className="text-gray-600">
                        The advisor you're looking for doesn't exist.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Header with back button */}
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Advisors</span>
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white shadow-xl overflow-hidden">
                    {/* Hero section */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            {/* Left side - Name and Profession */}
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                                    {member.name}
                                </h1>
                                <p className="text-xl md:text-2xl text-primary-100 font-light mb-2">
                                    {member.profession}
                                </p>
                                {member.affiliation && (
                                    <p className="text-lg text-primary-200 font-light mb-2">
                                        {member.affiliation}
                                    </p>
                                )}
                                <p className="text-base text-primary-200 font-light">
                                    {member.country}
                                </p>
                            </div>

                            {/* Right side - Photo */}
                            <div className="flex justify-center lg:justify-end">
                                <div className="relative">
                                    {member.image ? (
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-64 h-64 object-cover shadow-2xl border-4 border-white rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-64 h-64 bg-gray-200 flex items-center justify-center shadow-2xl border-4 border-white rounded-lg">
                                            <span className="text-gray-500 text-lg">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About section */}
                    <div className="px-8 py-12">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                                About {member.name.split(" ")[0]}
                            </h2>

                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed text-lg">
                                    {member.about}
                                </p>
                            </div>

                            {/* Professional Information */}
                            <div className="mt-12 bg-gradient-to-r from-gray-50 to-white p-8 border-l-4 border-primary-500 rounded-r-lg">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                                    Professional Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-primary-600 flex items-center justify-center text-white text-xs font-bold rounded-full mt-0.5">
                                            P
                                        </div>
                                        <div>
                                            <span className="text-gray-700 font-medium block">
                                                Profession
                                            </span>
                                            <span className="text-gray-600">
                                                {member.profession}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {member.affiliation && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-6 h-6 bg-primary-600 flex items-center justify-center text-white text-xs font-bold rounded-full mt-0.5">
                                                A
                                            </div>
                                            <div>
                                                <span className="text-gray-700 font-medium block">
                                                    Affiliation
                                                </span>
                                                <span className="text-gray-600">
                                                    {member.affiliation}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-start space-x-3">
                                        <MapPin
                                            className="text-primary-600 mt-0.5"
                                            size={20}
                                        />
                                        <div>
                                            <span className="text-gray-700 font-medium block">
                                                Country
                                            </span>
                                            <span className="text-gray-600">
                                                {member.country}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Achievement badge */}
                            <div className="mt-12 text-center">
                                <div className="inline-flex items-center space-x-2 bg-primary-50 px-6 py-3 border border-primary-200 rounded-full">
                                    <span className="text-primary-700 font-medium">
                                        Trusted Advisor & Industry Expert
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberPage;