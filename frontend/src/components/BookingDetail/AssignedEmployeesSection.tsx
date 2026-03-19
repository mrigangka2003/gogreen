import { UserPlus, CheckCircle, User, Trash2 } from "lucide-react";
import { Booking } from "../../types/booking";

type AssignedEmployeesSectionProps = {
    booking: Booking;
    isAssigned: boolean | null;
    handleRemoveEmployee: (id: string) => void;
    removingId: string | null;
    setIsAssignModalOpen: (val: boolean) => void;
};

export default function AssignedEmployeesSection({
    booking,
    isAssigned,
    handleRemoveEmployee,
    removingId,
    setIsAssignModalOpen
}: AssignedEmployeesSectionProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    Assigned Employee(s)
                </h2>
                {isAssigned && (
                    <div className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {booking.assignments!.filter(a => a.status !== 'removed').length} Assigned
                    </div>
                )}
            </div>

            {isAssigned ? (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left bg-white text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-semibold sticky top-0">
                            <tr>
                                <th className="px-4 py-3 border-b border-gray-100">Employee</th>
                                <th className="px-4 py-3 border-b border-gray-100 hidden sm:table-cell">Contact</th>
                                <th className="px-4 py-3 border-b border-gray-100 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {booking.assignments!.filter(a => a.status !== "removed").map((assignment) => {
                                const emp = assignment.employeeId;
                                return (
                                    <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                                                    {emp.name?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{emp.name || "Unknown"}</p>
                                                    <p className="text-xs text-gray-500 sm:hidden">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <p className="text-gray-600">{emp.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                            <button className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1">
                                                <User className="w-3.5 h-3.5" /> Profile
                                            </button>
                                            <button
                                                onClick={() => handleRemoveEmployee(emp._id!)}
                                                disabled={removingId === emp._id}
                                                className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                                            >
                                                {removingId === emp._id ? "Removing..." : <><Trash2 className="w-3.5 h-3.5" /> Remove</>}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-gray-400 bg-gray-50 rounded-xl p-4 text-center border border-dashed border-gray-200">
                    No employees assigned to this booking yet.
                </p>
            )}

            {/* Always show assign button if there are available employees to add more, or if none assigned */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="w-full py-2.5 rounded-xl text-sm font-bold bg-white text-primary border border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                >
                    <UserPlus className="h-4 w-4" />
                    {isAssigned ? "Assign Additional Employees" : "Assign Employee(s)"}
                </button>
            </div>
        </div>
    );
}
