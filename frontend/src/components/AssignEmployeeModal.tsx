import React, { useState, useMemo } from "react";
import { X, Search, MapPin, Briefcase, User as UserIcon } from "lucide-react";

export type AvailableEmployee = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    activeTasksCount: number;
};

type AssignEmployeeModalProps = {
    isOpen: boolean;
    onClose: () => void;
    employees: AvailableEmployee[];
    onAssign: (selectedIds: string[], allocatedTime: number) => Promise<void>;
    assigning: boolean;
};

const AssignEmployeeModal: React.FC<AssignEmployeeModalProps> = ({
    isOpen,
    onClose,
    employees,
    onAssign,
    assigning
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [allocatedTime, setAllocatedTime] = useState<number>(0);
    const showOnlyAvailable = true; // Hardcoded as true since the switch is disabled

    const filteredEmployees = useMemo(() => {
        let result = employees;
        if (showOnlyAvailable) {
            result = result.filter(e => e.activeTasksCount === 0);
        }
        if (!searchQuery.trim()) return result;
        const q = searchQuery.toLowerCase();
        return result.filter(e =>
            e.name.toLowerCase().includes(q) ||
            (e.phone && e.phone.toLowerCase().includes(q)) ||
            (e.address && e.address.toLowerCase().includes(q)) ||
            e.email.toLowerCase().includes(q)
        );
    }, [employees, searchQuery, showOnlyAvailable]);

    const handleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredEmployees.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredEmployees.map(e => e.id));
        }
    };

    const handleSubmit = async () => {
        if (selectedIds.length === 0) return;
        await onAssign(selectedIds, allocatedTime);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900">Assign Employees</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Select and assign multiple employees to this booking.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors shadow-sm border border-transparent hover:border-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col p-6 min-h-0 overflow-hidden bg-white">
                    {/* Search & Stats */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6 shrink-0 justify-between">
                        <div className="relative w-full max-w-md flex flex-col gap-2">
                            <div className="relative w-full">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, phone or location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/30 focus:border-[#38B000] text-sm font-medium text-gray-800 bg-gray-50"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-not-allowed w-fit mt-1">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        disabled
                                        checked={showOnlyAvailable}
                                    // onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                                    />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${showOnlyAvailable ? 'bg-[#38B000]' : 'bg-gray-300'}`}></div>
                                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showOnlyAvailable ? 'translate-x-4' : ''}`}></div>
                                </div>
                                <span className="font-medium select-none text-xs">Show only available (0 active jobs)</span>
                            </label>
                        </div>
                        <div className="flex items-center gap-4 bg-blue-50 h-fit px-4 py-3 rounded-xl border border-blue-100 text-blue-800 font-semibold text-sm">
                            <span>{filteredEmployees.length} Available</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                            <span>{selectedIds.length} Selected</span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto rounded-xl border border-gray-200 shadow-inner bg-gray-50">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="p-4 w-12 text-center border-b border-gray-200">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded text-[#38B000] focus:ring-[#38B000] cursor-pointer"
                                        />
                                    </th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Employee</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Location</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Active Tasks</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right border-b border-gray-200">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredEmployees.length > 0 ? filteredEmployees.map(emp => {
                                    const isSelected = selectedIds.includes(emp.id);
                                    // Dummy location fallback if address is missing
                                    const locationStr = emp.address || "Local District";
                                    return (
                                        <tr key={emp.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-green-50/30' : ''}`}>
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelect(emp.id)}
                                                    className="w-4 h-4 rounded text-[#38B000] focus:ring-[#38B000] cursor-pointer"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#38B000]/10 text-[#38B000] flex items-center justify-center font-bold">
                                                        {emp.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                                                        <p className="text-xs text-gray-500">{emp.phone || emp.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 hidden sm:table-cell">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium whitespace-nowrap">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                    {locationStr}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className={`w-4 h-4 ${emp.activeTasksCount === 0 ? 'text-green-500' : 'text-amber-500'}`} />
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${emp.activeTasksCount === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                                                        {emp.activeTasksCount} active
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                                <button className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1">
                                                    <UserIcon className="w-3.5 h-3.5" /> Profile
                                                </button>
                                                <button
                                                    onClick={() => handleSelect(emp.id)}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border ${isSelected ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                                >
                                                    {isSelected ? "Deselect" : "Select"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-gray-500">
                                            <UserIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                                            <p className="text-sm font-medium">No employees found matching your criteria</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="w-full md:w-1/2">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">
                            Allocated Time (Minutes) <span className="text-gray-400 font-normal lowercase">(Optional)</span>
                        </label>
                        <input
                            type="number"
                            value={allocatedTime || ""}
                            onChange={(e) => setAllocatedTime(Number(e.target.value))}
                            placeholder="e.g. 120"
                            className="w-full md:max-w-xs px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#38B000]/30 focus:border-[#38B000] text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <button
                            onClick={onClose}
                            className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={selectedIds.length === 0 || assigning}
                            className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-white bg-[#38B000] hover:bg-[#2d8c00] transition-all disabled:opacity-50 shadow-md shadow-[#38B000]/20"
                        >
                            {assigning ? "Assigning..." : `Assign ${selectedIds.length} Employee${selectedIds.length !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignEmployeeModal;
