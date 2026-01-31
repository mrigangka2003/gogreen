import { Request, Response } from "express";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

import { User, Booking, Review, Role } from "../models";
import { apiError, apiResponse } from "../helper";

/**
 * Get all accounts (users/orgs/emps)
 */
const getAllAccounts = async (_req: Request, res: Response): Promise<void> => {
    try {
        const accounts = await User.find().populate("role", "name");
        apiResponse(res, 200, "Accounts fetched successfully", accounts);
    } catch (err) {
        apiError(res, 500, "Failed to fetch accounts", err);
    }
};

/**
 * Get all bookings 
 * Supports optional filters via query params
 */
const getAllBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, userId, employeeId, startDate, endDate } = req.query;

        // Build dynamic filter object
        const filter: any = {};

        if (status) filter.status = status;
        if (userId) filter.userId = userId;
        if (employeeId) filter.employeeId = employeeId;

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate as string);
            if (endDate) filter.date.$lte = new Date(endDate as string);
        }

        // Sort newest → oldest using createdAt
        const bookings = await Booking.find(filter)
            .populate("userId", "name email phone")
            .populate("employeeId", "name email phone")
            .sort({ createdAt: -1 }); // 👈 newest first

        apiResponse(res, 200, "Bookings fetched successfully", bookings);
    } catch (err) {
        apiError(res, 500, "Failed to fetch bookings", err);
    }
};

/**
 * Get booking history of a specific user/org
 */
const getBookingHistory = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { userId } = req.params;
        const bookings = await Booking.find({ userId }).sort({ date: -1 });
        apiResponse(res, 200, "Booking history fetched", bookings);
    } catch (err) {
        apiError(res, 500, "Failed to fetch booking history", err);
    }
};

/**
 * Delete account (user/org/emp)
 */
const deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deleted = await User.findByIdAndDelete(id);

        if (!deleted) {
            apiError(res, 404, "Account not found");
            return;
        }

        apiResponse(res, 200, "Account deleted successfully", {});
    } catch (err) {
        apiError(res, 500, "Failed to delete account", err);
    }
};

/**
 * Assign a booking to an employee
 */
const updateAssignBooking = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { bookingId, employeeId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            apiError(res, 404, "Booking not found");
            return;
        }

        const employee = await User.findById(employeeId).populate("role");
        if (!employee || (employee.role as any).name !== "emp") {
            apiError(res, 400, "Invalid employee ID");
            return;
        }

        booking.employeeId = employee._id as Types.ObjectId;
        booking.status = "assigned";
        booking.assignedAt = new Date();
        await booking.save();

        apiResponse(res, 200, "Booking assigned successfully", booking);
    } catch (err) {
        apiError(res, 500, "Failed to assign booking", err);
    }
};

/**
 * View all reviews
 */
const viewAllReviews = async (_req: Request, res: Response): Promise<void> => {
    try {
        const reviews = await Review.find().populate("bookingId userId");
        apiResponse(res, 200, "All reviews fetched", reviews);
    } catch (err) {
        apiError(res, 500, "Failed to fetch reviews", err);
    }
};

/**
 * Create an org/emp account
 */
const createOrgEmp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, phone, roleName } = req.body;

        if (!["org", "emp"].includes(roleName)) {
            apiError(res, 400, "Role must be 'org' or 'emp'");
            return;
        }

        const roleDoc = await Role.findOne({ name: roleName });
        if (!roleDoc) {
            apiError(res, 400, "Role not found");
            return;
        }

        const existing = await User.findOne({ email }).lean();
        if (existing) {
            apiError(res, 400, "User already exists with this email");
            return;
        }
        const hashPassword = await bcrypt.hash(password, 10);
        // password will already be hashed in user model pre-save hook or manually before
        const created = await User.create({
            name,
            email,
            password: hashPassword, // hashPassword() if not using pre-save middleware
            phone,
            role: roleDoc._id,
        });

        apiResponse(res, 201, "Org/Emp account created successfully", {
            id: created._id,
            name: created.name,
            email: created.email,
            role: roleName,
        });
    } catch (err) {
        apiError(res, 500, "Failed to create Org/Emp account", err);
    }
};

/**
 * Get own profile
 */
const getProfileSelf = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            apiError(res, 404, "User not found");
            return;
        }

        apiResponse(res, 200, "Profile fetched successfully", user);
    } catch (err) {
        apiError(res, 500, "Failed to fetch profile", err);
    }
};

/**
 * Update own profile
 */
const updateProfileSelf = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const updated = await User.findByIdAndUpdate(req.user.id, req.body, {
            new: true,
            runValidators: true,
        }).select("-password");

        apiResponse(res, 200, "Profile updated successfully", updated);
    } catch (err) {
        apiError(res, 500, "Failed to update profile", err);
    }
};

/**
 * Delete own profile
 */
const deleteProfileSelf = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        await User.findByIdAndDelete(req.user.id);
        apiResponse(res, 200, "Profile deleted successfully", {});
    } catch (err) {
        apiError(res, 500, "Failed to delete profile", err);
    }
};

/**
 * Assign a task from booking table to an employee based on role
 * Enhanced version with better validation and employee selection
 */
const assignTaskToEmployee = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { bookingId, employeeId } = req.body;

        // Validate required fields
        if (!bookingId) {
            apiError(res, 400, "Booking ID is required");
            return;
        }

        // Find the booking
        const booking = await Booking.findById(bookingId)
            .populate("userId", "name email phone")
            .populate("employeeId", "name email phone");

        if (!booking) {
            apiError(res, 404, "Booking not found");
            return;
        }

        // Check if booking is already assigned
        if (booking.status === "assigned" || booking.status === "in_progress" || booking.status === "completed") {
            apiError(res, 400, `Booking is already ${booking.status}. Cannot reassign.`);
            return;
        }

        // Check if booking is cancelled
        if (booking.status === "cancelled") {
            apiError(res, 400, "Cannot assign a cancelled booking");
            return;
        }

        // If employeeId is provided, validate and assign to specific employee
        if (employeeId) {
            const employee = await User.findById(employeeId).populate("role");

            if (!employee) {
                apiError(res, 404, "Employee not found");
                return;
            }

            // Verify the user has employee role
            const roleName = (employee.role as any)?.name;
            if (roleName !== "emp") {
                apiError(res, 400, "Selected user is not an employee. User role: " + roleName);
                return;
            }

            // Check if employee is active
            if (!employee.isActive) {
                apiError(res, 400, "Selected employee is not active");
                return;
            }

            // Assign the booking to the employee
            booking.employeeId = employee._id as Types.ObjectId;
            booking.status = "assigned";
            booking.assignedAt = new Date();
            await booking.save();

            // Populate the updated booking
            const updatedBooking = await Booking.findById(booking._id)
                .populate("userId", "name email phone")
                .populate("employeeId", "name email phone");

            apiResponse(res, 200, "Task assigned to employee successfully", {
                booking: updatedBooking,
                assignedTo: {
                    id: employee._id,
                    name: employee.name,
                    email: employee.email,
                    phone: employee.phone,
                },
            });
        } else {
            // If no employeeId provided, return list of available employees
            const empRole = await Role.findOne({ name: "emp" });

            if (!empRole) {
                apiError(res, 500, "Employee role not found in system");
                return;
            }

            const availableEmployees = await User.find({
                role: empRole._id,
                isActive: true,
            }).select("name email phone");

            if (availableEmployees.length === 0) {
                apiError(res, 404, "No active employees available");
                return;
            }

            apiResponse(res, 200, "Please select an employee to assign", {
                booking: {
                    id: booking._id,
                    serviceType: booking.serviceType,
                    address: booking.address,
                    date: booking.date,
                    timeSlot: booking.timeSlot,
                    status: booking.status,
                },
                availableEmployees,
            });
        }
    } catch (err) {
        apiError(res, 500, "Failed to assign task to employee", err);
    }
};

/**
 * Get all available employees for task assignment
 */
const getAvailableEmployees = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const empRole = await Role.findOne({ name: "emp" });

        if (!empRole) {
            apiError(res, 500, "Employee role not found in system");
            return;
        }

        const employees = await User.find({
            role: empRole._id,
            isActive: true,
        })
            .select("name email phone address")
            .populate("role", "name");

        // Get task count for each employee
        const employeesWithTaskCount = await Promise.all(
            employees.map(async (emp) => {
                const activeTasksCount = await Booking.countDocuments({
                    employeeId: emp._id,
                    status: { $in: ["assigned", "in_progress"] },
                });

                return {
                    id: emp._id,
                    name: emp.name,
                    email: emp.email,
                    phone: emp.phone,
                    address: emp.address,
                    activeTasksCount,
                };
            })
        );

        // Sort by active tasks count (least busy first)
        employeesWithTaskCount.sort((a, b) => a.activeTasksCount - b.activeTasksCount);

        apiResponse(res, 200, "Available employees fetched successfully", {
            totalEmployees: employeesWithTaskCount.length,
            employees: employeesWithTaskCount,
        });
    } catch (err) {
        apiError(res, 500, "Failed to fetch available employees", err);
    }
};

/* 
*/



export default {
    getAllAccounts,
    getBookingHistory,
    getAllBookings,
    deleteAccount,
    updateAssignBooking,
    assignTaskToEmployee,
    getAvailableEmployees,
    viewAllReviews,
    createOrgEmp,
    getProfileSelf,
    updateProfileSelf,
    deleteProfileSelf,
};
