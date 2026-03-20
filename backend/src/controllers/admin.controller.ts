import { Request, Response } from "express";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

import { User, Booking, Review, Role, Service } from "../models";
import { apiError, apiResponse } from "../helper";
import { uploadToCloudinary } from "../utils/uploadPhoto";

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
 * Update an account (Admin can update Org/Emp)
 */
const updateAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, email, phone, roleName } = req.body;

        const user = await User.findById(id).populate("role");
        if (!user) {
            apiError(res, 404, "Account not found");
            return;
        }

        // Admins can only update Org and Emp
        const currentRole = (user.role as any)?.name;
        if (currentRole === "super-admin" || currentRole === "admin") {
            apiError(
                res,
                403,
                "You do not have permission to update this account"
            );
            return;
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;

        if (roleName) {
            const roleDoc = await Role.findOne({ name: roleName });
            if (!roleDoc) {
                apiError(res, 400, "Invalid role specified");
                return;
            }
            if (roleName !== "org" && roleName !== "emp") {
                apiError(
                    res,
                    403,
                    "Admins can only assign 'org' or 'emp' roles"
                );
                return;
            }
            user.role = roleDoc._id as Types.ObjectId;
        }

        await user.save();

        apiResponse(res, 200, "Account updated successfully", {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isActive: user.isActive,
        });
    } catch (error: any) {
        if (error.code === 11000) {
            apiError(res, 400, "Email already exists");
            return;
        }
        apiError(res, 500, error.message || "Failed to update account");
    }
};

/**
 * Update top-level booking photos manually (Admin only)
 */
const updateBookingPhotos = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { startPhoto, endPhoto } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            apiError(res, 404, "Booking not found");
            return;
        }

        if (startPhoto !== undefined) booking.startPhoto = startPhoto;
        if (endPhoto !== undefined) booking.endPhoto = endPhoto;

        await booking.save();
        apiResponse(res, 200, "Booking photos updated successfully", booking);
    } catch (err) {
        apiError(res, 500, "Failed to update booking photos", err);
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
        if (employeeId) filter["assignments.employeeId"] = employeeId;

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate as string);
            if (endDate) filter.date.$lte = new Date(endDate as string);
        }

        // Sort newest → oldest using createdAt
        const bookings = await Booking.find(filter)
            .populate("userId", "name email phone")
            .populate("assignments.employeeId", "name email phone")
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
        const { bookingId, employeeIds } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            apiError(res, 404, "Booking not found");
            return;
        }

        // Prevent assigning cancelled bookings
        if (booking.status === "cancelled") {
            apiError(res, 400, "Cannot assign a cancelled booking");
            return;
        }

        let empIdsArray: string[] = [];
        if (Array.isArray(employeeIds)) {
            empIdsArray = employeeIds;
        } else if (req.body.employeeId) {
            empIdsArray = [req.body.employeeId];
        }

        if (empIdsArray.length === 0) {
            apiError(res, 400, "At least one employee ID is required");
            return;
        }

        const employees = await User.find({
            _id: { $in: empIdsArray },
        }).populate("role");

        if (employees.length !== empIdsArray.length) {
            apiError(res, 404, "One or more employees not found");
            return;
        }

        for (const emp of employees) {
            if ((emp.role as any).name !== "emp") {
                apiError(res, 400, `Invalid employee ID: ${emp._id}`);
                return;
            }
            if (!emp.isActive) {
                apiError(res, 400, `Employee ${emp.name} is not active`);
                return;
            }
        }

        const currentIds = (booking.assignments || [])
            .filter((a: any) => a.status !== "removed")
            .map((a: any) => a.employeeId.toString());

        const newAssignments = empIdsArray
            .filter((id) => !currentIds.includes(id))
            .map((id) => ({
                employeeId: new Types.ObjectId(id),
                status: "assigned",
                assignedAt: new Date(),
            }));

        if (!booking.assignments) booking.assignments = [];
        booking.assignments.push(...(newAssignments as any));

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
        const { bookingId, employeeIds } = req.body;

        // Validate required fields
        if (!bookingId) {
            apiError(res, 400, "Booking ID is required");
            return;
        }

        // Find the booking
        const booking = await Booking.findById(bookingId)
            .populate("userId", "name email phone")
            .populate("assignments.employeeId", "name email phone");

        if (!booking) {
            apiError(res, 404, "Booking not found");
            return;
        }

        // Check if booking is cancelled
        if (booking.status === "cancelled") {
            apiError(res, 400, "Cannot assign a cancelled booking");
            return;
        }

        // If employeeIds is provided, validate and assign to specific employees
        let empIdsArray: string[] = [];
        if (Array.isArray(employeeIds)) {
            empIdsArray = employeeIds;
        } else if (req.body.employeeId) {
            empIdsArray = [req.body.employeeId];
        }

        if (empIdsArray.length > 0) {
            const employees = await User.find({
                _id: { $in: empIdsArray },
            }).populate("role");

            if (employees.length !== empIdsArray.length) {
                apiError(res, 404, "One or more employees not found");
                return;
            }

            for (const employee of employees) {
                // Verify the user has employee role
                const roleName = (employee.role as any)?.name;
                if (roleName !== "emp") {
                    apiError(
                        res,
                        400,
                        "Selected user is not an employee. User role: " +
                            roleName
                    );
                    return;
                }

                // Check if employee is active
                if (!employee.isActive) {
                    apiError(
                        res,
                        400,
                        `Employee ${employee.name} is not active`
                    );
                    return;
                }

                // Verify employee has 0 active jobs ($elemMatch ensures we check per-employee status, not across all assignments)
                const activeTasksCount = await Booking.countDocuments({
                    _id: { $ne: booking._id },
                    assignments: {
                        $elemMatch: {
                            employeeId: employee._id,
                            status: { $in: ["assigned", "started"] },
                        },
                    },
                });

                if (activeTasksCount > 0) {
                    apiError(
                        res,
                        400,
                        `Employee ${employee.name} already has an active job and cannot be assigned.`
                    );
                    return;
                }
            }

            // Append the new employees to the booking, preventing duplicates
            const currentIds = (booking.assignments || [])
                .filter((a: any) => a.status !== "removed")
                .map((a: any) => a.employeeId.toString());

            const newAssignments = employees
                .filter((e: any) => !currentIds.includes(e._id.toString()))
                .map((e: any) => ({
                    employeeId: e._id as Types.ObjectId,
                    status: "assigned",
                    assignedAt: new Date(),
                }));

            if (!booking.assignments) booking.assignments = [];
            booking.assignments.push(...(newAssignments as any));

            booking.status = "assigned";
            booking.assignedAt = new Date();

            // Check if user sent allocatedTime (Timer feature)
            if (req.body.allocatedTime !== undefined) {
                booking.allocatedTime = Number(req.body.allocatedTime) || 0;
            }

            await booking.save();

            // Populate the updated booking
            const updatedBooking = await Booking.findById(booking._id)
                .populate("userId", "name email phone")
                .populate("assignments.employeeId", "name email phone");

            apiResponse(res, 200, "Task assigned to employees successfully", {
                booking: updatedBooking,
                assignedTo: employees.map((e) => ({
                    id: e._id,
                    name: e.name,
                    email: e.email,
                    phone: e.phone,
                })),
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
 * Remove an assigned employee from a booking
 */
const removeAssignedEmployee = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { bookingId, employeeId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            apiError(res, 404, "Booking not found");
            return;
        }

        if (!booking.assignments || booking.assignments.length === 0) {
            apiError(res, 400, "No assignments found for this booking");
            return;
        }

        // Find the specific assignment and mark as removed
        const assignment = booking.assignments.find(
            (a: any) =>
                a.employeeId.toString() === employeeId && a.status !== "removed"
        );

        if (!assignment) {
            apiError(res, 404, "Active employee assignment not found");
            return;
        }

        assignment.status = "removed";
        // The .pre('save') hook handles global status calculations!

        await booking.save();

        apiResponse(res, 200, "Employee removed successfully", booking);
    } catch (err) {
        apiError(res, 500, "Failed to remove assigned employee", err);
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
                    assignments: {
                        $elemMatch: {
                            employeeId: emp._id,
                            status: { $in: ["assigned", "started"] },
                        },
                    },
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
        employeesWithTaskCount.sort(
            (a, b) => a.activeTasksCount - b.activeTasksCount
        );

        apiResponse(res, 200, "Available employees fetched successfully", {
            totalEmployees: employeesWithTaskCount.length,
            employees: employeesWithTaskCount,
        });
    } catch (err) {
        apiError(res, 500, "Failed to fetch available employees", err);
    }
};

/**
 * Update the status of a booking manually by Admin
 * Uses findByIdAndUpdate to bypass the pre-save hook that auto-recalculates status.
 */
const updateBookingStatusAdmin = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, allocatedTime } = req.body;

        const validStatuses = [
            "pending",
            "assigned",
            "started",
            "completed",
            "cancelled",
        ];
        if (!validStatuses.includes(status)) {
            apiError(
                res,
                400,
                "Invalid status. Valid: pending, assigned, started, completed, cancelled"
            );
            return;
        }

        // Build the $set payload without touching the model's pre-save hook
        const setFields: Record<string, any> = { status };

        if (status === "started") setFields.timerStartedAt = new Date();
        if (status === "completed") setFields.completedAt = new Date();
        if (status === "cancelled") setFields.cancelledAt = new Date();
        if (allocatedTime !== undefined)
            setFields.allocatedTime = Number(allocatedTime);

        // Determine what assignment status we should cascade to
        const assignmentStatusMap: Record<string, string> = {
            started: "started",
            completed: "completed",
            assigned: "assigned",
            cancelled: "removed",
            pending: "removed", // pending means previous assignments should be removed
        };
        const asnStatus = assignmentStatusMap[status];

        // Build arrayFilters-based update to only touch non-removed assignments
        const updateQuery: Record<string, any> = { $set: setFields };

        // Cascade to assignments using positional filtered operator
        if (asnStatus) {
            updateQuery.$set["assignments.$[active].status"] = asnStatus;
            if (status === "started")
                updateQuery.$set["assignments.$[active].startTime"] =
                    new Date();
            if (status === "completed")
                updateQuery.$set["assignments.$[active].endTime"] = new Date();
        }

        const booking = await Booking.findByIdAndUpdate(id, updateQuery, {
            new: true,
            arrayFilters: [{ "active.status": { $ne: "removed" } }],
        }).populate("assignments.employeeId", "name email phone");

        if (!booking) {
            apiError(res, 404, "Booking not found");
            return;
        }

        apiResponse(res, 200, "Booking status updated successfully", booking);
    } catch (err) {
        apiError(res, 500, "Failed to update booking status", err);
    }
};

/**
 * Update an individual assignment's status
 */
const updateAssignmentStatus = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { bookingId, employeeId } = req.params;
        const { status } = req.body;

        const validStatuses = ["assigned", "started", "completed"];
        if (!validStatuses.includes(status)) {
            apiError(
                res,
                400,
                "Invalid assignment status. Valid: assigned, started, completed"
            );
            return;
        }

        // Step 1: Update the specific assignment using findByIdAndUpdate
        const timestampFields: Record<string, any> = {};
        if (status === "started")
            timestampFields["assignments.$[elem].startTime"] = new Date();
        if (status === "completed")
            timestampFields["assignments.$[elem].endTime"] = new Date();

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                $set: {
                    "assignments.$[elem].status": status,
                    ...timestampFields,
                },
            },
            {
                new: true,
                arrayFilters: [
                    {
                        "elem.employeeId": employeeId,
                        "elem.status": { $ne: "removed" },
                    },
                ],
            }
        );

        if (!updatedBooking) {
            apiError(res, 404, "Booking or active assignment not found");
            return;
        }

        // Step 2: Recalculate global status from DB state
        const activeAssignments = (updatedBooking.assignments as any[]).filter(
            (a: any) => a.status !== "removed"
        );
        let newBookingStatus = updatedBooking.status;

        if (newBookingStatus !== "cancelled") {
            if (activeAssignments.length === 0) {
                newBookingStatus = "pending";
            } else {
                const allCompleted = activeAssignments.every(
                    (a: any) => a.status === "completed"
                );
                const anyStarted = activeAssignments.some(
                    (a: any) => a.status === "started" || a.status === "completed"
                );

                if (allCompleted) newBookingStatus = "completed";
                else if (anyStarted) newBookingStatus = "started";
                else newBookingStatus = "assigned";
            }
        }

        // Step 3: Update booking status and timestamps if changed
        const bookingUpdateFields: Record<string, any> = {};
        if (newBookingStatus !== updatedBooking.status) {
            bookingUpdateFields.status = newBookingStatus;
        }

        if (newBookingStatus === "started" && !updatedBooking.timerStartedAt) {
            bookingUpdateFields.timerStartedAt = new Date();
        }

        if (newBookingStatus === "completed" && !updatedBooking.completedAt) {
            bookingUpdateFields.completedAt = new Date();
        }

        let finalBooking = updatedBooking;
        if (Object.keys(bookingUpdateFields).length > 0) {
            finalBooking = (await Booking.findByIdAndUpdate(
                bookingId,
                { $set: bookingUpdateFields },
                { new: true }
            ).populate("assignments.employeeId", "name email phone")) || updatedBooking;
        } else {
            finalBooking = await Booking.populate(updatedBooking, {
                path: "assignments.employeeId",
                select: "name email phone",
            });
        }

        apiResponse(res, 200, "Assignment status updated", {
            booking: finalBooking,
        });
    } catch (err) {
        apiError(res, 500, "Failed to update assignment status", err);
    }
};

/**
 * Create a booking (Admin / Super-Admin)
 */
const createBookingAdmin = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const {
            serviceId,
            userId: targetUserId, // optional: assign booking to this account
            address,
            phoneNumber,
            instruction,
            date,
            timeSlot,
            referencePhoto,
        } = req.body;

        if (!address || !phoneNumber || !date || !timeSlot) {
            apiError(res, 400, "Address, phone number, date and time slot are required");
            return;
        }

        // Resolve service
        if (!serviceId) {
            apiError(res, 400, "serviceId is required");
            return;
        }
        const service = await Service.findById(serviceId);
        if (!service || !service.isActive) {
            apiError(res, 400, "Service not found or inactive");
            return;
        }

        // Upload reference photo if provided
        let referencePhotoUrl = "";
        if (referencePhoto) {
            try {
                referencePhotoUrl = await uploadToCloudinary(referencePhoto, "gogreen/reference-photos");
            } catch (uploadErr) {
                apiError(res, 500, "Failed to upload reference photo", uploadErr);
                return;
            }
        }

        // Use provided userId (assigned account) or fall back to admin's own id
        const bookingUserId = targetUserId ?? req.user.id;

        const booking = await Booking.create({
            userId: bookingUserId,
            serviceId: service._id,
            serviceType: service.title,
            address,
            phoneNumber,
            instruction,
            referencePhoto: referencePhotoUrl,
            date,
            timeSlot,
        });

        apiResponse(res, 201, "Booking created successfully", booking);
    } catch (err) {
        apiError(res, 500, "Failed to create booking", err);
    }
};

/**
 * Reassign an existing booking to a different user account
 */
const reassignBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const { id } = req.params;
        const { userId: newUserId } = req.body;

        if (!newUserId) {
            apiError(res, 400, "userId is required");
            return;
        }

        const newUser = await User.findById(newUserId);
        if (!newUser) {
            apiError(res, 404, "Target account not found");
            return;
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { userId: newUserId },
            { new: true }
        );
        if (!booking) {
            apiError(res, 404, "Booking not found");
            return;
        }

        apiResponse(res, 200, "Booking reassigned successfully", booking);
    } catch (err) {
        apiError(res, 500, "Failed to reassign booking", err);
    }
};

/**
 * Get a single employee's detail with current and past assignments
 */
const getEmployeeDetail = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const employee = await User.findById(id)
            .select("-password")
            .populate("role", "name");

        if (!employee) {
            apiError(res, 404, "Employee not found");
            return;
        }

        if ((employee.role as any)?.name !== "emp") {
            apiError(res, 400, "User is not an employee");
            return;
        }

        // Current active assignments
        const activeBookings = await Booking.find({
            assignments: {
                $elemMatch: {
                    employeeId: employee._id,
                    status: { $in: ["assigned", "started"] },
                },
            },
        })
            .populate("userId", "name email phone")
            .populate("assignments.employeeId", "name email phone")
            .sort({ date: -1 });

        // Past assignments (completed/removed bookings)
        const pastBookings = await Booking.find({
            assignments: {
                $elemMatch: {
                    employeeId: employee._id,
                    status: { $in: ["completed", "removed"] },
                },
            },
        })
            .populate("userId", "name email phone")
            .populate("assignments.employeeId", "name email phone")
            .sort({ date: -1 });

        apiResponse(res, 200, "Employee detail fetched successfully", {
            employee: {
                id: employee._id,
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                address: employee.address,
                isActive: employee.isActive,
                createdAt: employee.createdAt,
            },
            activeBookings,
            pastBookings,
        });
    } catch (err) {
        apiError(res, 500, "Failed to fetch employee detail", err);
    }
};

export default {
    getAllAccounts,
    updateAccount,
    getBookingHistory,
    getAllBookings,
    deleteAccount,
    updateAssignBooking,
    assignTaskToEmployee,
    getAvailableEmployees,
    updateBookingStatusAdmin,
    updateAssignmentStatus,
    viewAllReviews,
    createOrgEmp,
    getProfileSelf,
    updateProfileSelf,
    deleteProfileSelf,
    removeAssignedEmployee,
    updateBookingPhotos,
    createBookingAdmin,
    reassignBooking,
    getEmployeeDetail,
};
