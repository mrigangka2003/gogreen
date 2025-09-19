import React from "react";

const PRIMARY = "#38B000";
const FOURTH = "#141414";
const FIFTH = "#6C584C";

const SuperCreateAdmin: React.FC = () => (
    <div className="p-6 max-w-2xl">
        <h2 className="text-2xl font-bold mb-6" style={{ color: FOURTH }}>
            Create New Admin
        </h2>
        <form className="grid gap-4">
            <input
                className="px-4 py-2 rounded-xl border"
                placeholder="Full name"
                style={{ borderColor: `${FIFTH}33` }}
            />
            <input
                className="px-4 py-2 rounded-xl border"
                placeholder="Email"
                style={{ borderColor: `${FIFTH}33` }}
            />
            <button
                className="px-6 py-2 rounded-xl text-white font-semibold"
                style={{ backgroundColor: PRIMARY }}
                type="submit"
            >
                Create Admin
            </button>
        </form>
    </div>
);

export default SuperCreateAdmin;
