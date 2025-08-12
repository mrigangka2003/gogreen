import React from 'react';
import { Shield } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br bg-primary flex items-center justify-center relative overflow-hidden">
            {/* Animated background glow */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            {/* Main message card */}
            <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 shadow-2xl text-center max-w-2xl mx-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl mb-6 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                
                <h1 className="text-5xl font-bold text-white bg-clip-text mb-6">
                    Admin Dashboard
                </h1>
                
                <p className="text-xl text-white/80 mb-8">
                    Welcome back, Administrator! 
                    <br />
                    You have successfully logged in.
                </p>

                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-400/30 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                    <span className="text-green-300 font-medium">Access Granted</span>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;