import React, { useState } from "react";
import { Calendar, MapPin, Clock, Search } from "lucide-react";

interface Event {
    id: number;
    title: string;
    company: string;
    location: string;
    date: string;
    time: string;
    description: string;
}

const EventPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");

    // Sample Event Data (you can update easily)
    const events: Event[] = [
        {
            id: 1,
            title: "GoGreen EV Awareness Camp",
            company: "GoGreen Energy",
            location: "Agartala, Tripura",
            date: "15th September 2025",
            time: "10:00 AM - 2:00 PM",
            description:
                "An interactive camp to spread awareness about electric vehicles, sustainability, and green energy adoption in Tripura.",
        },
        {
            id: 2,
            title: "Solar Panel Installation Workshop",
            company: "GoGreen Energy",
            location: "Udaipur, Tripura",
            date: "25th September 2025",
            time: "11:00 AM - 4:00 PM",
            description:
                "Hands-on training session on solar panel installation and maintenance for students and technicians.",
        },
        {
            id: 3,
            title: "Battery Recycling Drive",
            company: "GoGreen Energy",
            location: "Dharmanagar, Tripura",
            date: "1st October 2025",
            time: "9:00 AM - 12:00 PM",
            description:
                "Join us to responsibly recycle old EV batteries and learn about safe eco-friendly disposal practices.",
        },
    ];

    const filteredEvents = events.filter(
        (event) =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Upcoming Events</h1>
                    <p className="text-gray-600">
                        Stay updated with GoGreen Energy’s latest events and initiatives
                    </p>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search events by name, location, or description..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Event Listings */}
                <div className="space-y-6">
                    {filteredEvents.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No events found
                            </h3>
                            <p className="text-gray-600">
                                Try searching with a different keyword or check back later.
                            </p>
                        </div>
                    ) : (
                        filteredEvents.map((event) => (
                            <div
                                key={event.id}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
                            >
                                <div className="flex flex-col gap-4">
                                    {/* Title + Company */}
                                    <div>
                                        <h3 className="text-2xl font-semibold text-gray-900">
                                            {event.title}
                                        </h3>
                                        <p className="text-gray-700">{event.company}</p>
                                    </div>

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {event.date}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {event.time}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {event.location}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-700 leading-relaxed">
                                        {event.description}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventPage;
