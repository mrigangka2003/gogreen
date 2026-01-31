import { Mail, Phone } from "lucide-react";

const ContactFloating = () => {
    return (
        <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-40 flex flex-col gap-4">
            {/* Email icon */}
            <a
                href="mailto:gogreenplus.in@email.com"
                className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition"
                aria-label="Send Email"
                target="_blank"
            >
                <Mail className="text-primary w-6 h-6" />
            </a>

            {/* Phone icon */}
            <a
                href="tel:+918837068696"
                className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition"
                aria-label="Call Phone"
                target="_blank"
            >
                <Phone className="text-primary w-6 h-6" />
            </a>
        </div>
    );
};

export default ContactFloating;
