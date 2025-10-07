// Notification.tsx
import React, { useEffect } from "react";

interface NotificationProps {
    message: string;
    type?: "success" | "error";
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
    message,
    type = "success",
    onClose,
}) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000); // auto-close after 3s
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`fixed top-5 right-5 z-50 rounded-xl shadow-lg px-5 py-3 text-white 
        transition-transform duration-300 ease-in-out
        ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
        >
            {message}
        </div>
    );
};

export default Notification;
