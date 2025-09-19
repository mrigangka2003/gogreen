import React from "react";

const THIRD = "#EBF2FA";
const FOURTH = "#141414";
const FIFTH = "#6C584C";

const SuperAdminDashboard: React.FC = () => (
    <div
        className="p-6 rounded-2xl border shadow"
        style={{ backgroundColor: THIRD, borderColor: `${FIFTH}33` }}
    >
        <h2 className="text-2xl font-bold mb-4" style={{ color: FOURTH }}>
            Super-Admin Dashboard
        </h2>
        <p style={{ color: FIFTH }}>Overview cards / stats go here.</p>
    </div>
);

export default SuperAdminDashboard;
