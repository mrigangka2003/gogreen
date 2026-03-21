"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const models_1 = require("../models");
const helper_1 = require("../helper");
const uploadPhoto_1 = require("../utils/uploadPhoto");
/**
 * Get all accounts (users/orgs/emps)
 */
const getAllAccounts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accounts = yield models_1.User.find().populate("role", "name");
        (0, helper_1.apiResponse)(res, 200, "Accounts fetched successfully", accounts);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch accounts", err);
    }
});
/**
 * Update an account (Admin can update Org/Emp)
 */
const updateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { name, email, phone, roleName } = req.body;
        const user = yield models_1.User.findById(id).populate("role");
        if (!user) {
            (0, helper_1.apiError)(res, 404, "Account not found");
            return;
        }
        // Admins can only update Org and Emp
        const currentRole = (_a = user.role) === null || _a === void 0 ? void 0 : _a.name;
        if (currentRole === "super-admin" || currentRole === "admin") {
            (0, helper_1.apiError)(res, 403, "You do not have permission to update this account");
            return;
        }
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (phone !== undefined)
            user.phone = phone;
        if (roleName) {
            const roleDoc = yield models_1.Role.findOne({ name: roleName });
            if (!roleDoc) {
                (0, helper_1.apiError)(res, 400, "Invalid role specified");
                return;
            }
            if (roleName !== "org" && roleName !== "emp") {
                (0, helper_1.apiError)(res, 403, "Admins can only assign 'org' or 'emp' roles");
                return;
            }
            user.role = roleDoc._id;
        }
        yield user.save();
        (0, helper_1.apiResponse)(res, 200, "Account updated successfully", {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isActive: user.isActive,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            (0, helper_1.apiError)(res, 400, "Email already exists");
            return;
        }
        (0, helper_1.apiError)(res, 500, error.message || "Failed to update account");
    }
});
/**
 * Update top-level booking photos manually (Admin only)
 */
const updateBookingPhotos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { startPhoto, endPhoto, assignmentEmployeeId } = req.body;
        const booking = yield models_1.Booking.findById(id);
        if (!booking) {
            (0, helper_1.apiError)(res, 404, "Booking not found");
            return;
        }
        // Helper: upload base64 or use URL directly, empty string = remove
        const resolvePhoto = (photo, folder) => __awaiter(void 0, void 0, void 0, function* () {
            if (photo === undefined)
                return undefined;
            if (photo === "")
                return "";
            if (photo.startsWith("data:")) {
                return yield (0, uploadPhoto_1.uploadToCloudinary)(photo, folder);
            }
            return photo;
        });
        if (assignmentEmployeeId) {
            const assignment = booking.assignments.find((a) => a.employeeId.toString() === assignmentEmployeeId &&
                a.status !== "removed");
            if (!assignment) {
                (0, helper_1.apiError)(res, 404, "Active assignment not found for this employee");
                return;
            }
            const resolvedStart = yield resolvePhoto(startPhoto, "gogreen/start-photos");
            const resolvedEnd = yield resolvePhoto(endPhoto, "gogreen/end-photos");
            if (resolvedStart !== undefined)
                assignment.startPhoto = resolvedStart;
            if (resolvedEnd !== undefined)
                assignment.endPhoto = resolvedEnd;
        }
        else {
            const resolvedStart = yield resolvePhoto(startPhoto, "gogreen/start-photos");
            const resolvedEnd = yield resolvePhoto(endPhoto, "gogreen/end-photos");
            if (resolvedStart !== undefined)
                booking.startPhoto = resolvedStart;
            if (resolvedEnd !== undefined)
                booking.endPhoto = resolvedEnd;
        }
        yield booking.save();
        (0, helper_1.apiResponse)(res, 200, "Booking photos updated successfully", booking);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to update booking photos", err);
    }
});
/**
 * Get all bookings
 * Supports optional filters via query params
 */
const getAllBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, userId, employeeId, startDate, endDate } = req.query;
        // Build dynamic filter object
        const filter = {};
        if (status)
            filter.status = status;
        if (userId)
            filter.userId = userId;
        if (employeeId)
            filter["assignments.employeeId"] = employeeId;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate)
                filter.date.$gte = new Date(startDate);
            if (endDate)
                filter.date.$lte = new Date(endDate);
        }
        // Sort newest → oldest using createdAt
        const bookings = yield models_1.Booking.find(filter)
            .populate("userId", "name email phone")
            .populate("assignments.employeeId", "name email phone")
            .sort({ createdAt: -1 }); // 👈 newest first
        (0, helper_1.apiResponse)(res, 200, "Bookings fetched successfully", bookings);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch bookings", err);
    }
});
/**
 * Get booking history of a specific user/org
 */
const getBookingHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const bookings = yield models_1.Booking.find({ userId }).sort({ date: -1 });
        (0, helper_1.apiResponse)(res, 200, "Booking history fetched", bookings);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch booking history", err);
    }
});
/**
 * Delete account (user/org/emp)
 */
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield models_1.User.findByIdAndDelete(id);
        if (!deleted) {
            (0, helper_1.apiError)(res, 404, "Account not found");
            return;
        }
        (0, helper_1.apiResponse)(res, 200, "Account deleted successfully", {});
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to delete account", err);
    }
});
/**
 * Assign a booking to an employee
 */
const updateAssignBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId, employeeIds } = req.body;
        const booking = yield models_1.Booking.findById(bookingId);
        if (!booking) {
            (0, helper_1.apiError)(res, 404, "Booking not found");
            return;
        }
        // Prevent assigning cancelled bookings
        if (booking.status === "cancelled") {
            (0, helper_1.apiError)(res, 400, "Cannot assign a cancelled booking");
            return;
        }
        let empIdsArray = [];
        if (Array.isArray(employeeIds)) {
            empIdsArray = employeeIds;
        }
        else if (req.body.employeeId) {
            empIdsArray = [req.body.employeeId];
        }
        if (empIdsArray.length === 0) {
            (0, helper_1.apiError)(res, 400, "At least one employee ID is required");
            return;
        }
        const employees = yield models_1.User.find({
            _id: { $in: empIdsArray },
        }).populate("role");
        if (employees.length !== empIdsArray.length) {
            (0, helper_1.apiError)(res, 404, "One or more employees not found");
            return;
        }
        for (const emp of employees) {
            if (emp.role.name !== "emp") {
                (0, helper_1.apiError)(res, 400, `Invalid employee ID: ${emp._id}`);
                return;
            }
            if (!emp.isActive) {
                (0, helper_1.apiError)(res, 400, `Employee ${emp.name} is not active`);
                return;
            }
        }
        const currentIds = (booking.assignments || [])
            .filter((a) => a.status !== "removed")
            .map((a) => a.employeeId.toString());
        const newAssignments = empIdsArray
            .filter((id) => !currentIds.includes(id))
            .map((id) => ({
            employeeId: new mongoose_1.Types.ObjectId(id),
            status: "assigned",
            assignedAt: new Date(),
        }));
        if (!booking.assignments)
            booking.assignments = [];
        booking.assignments.push(...newAssignments);
        booking.status = "assigned";
        booking.assignedAt = new Date();
        yield booking.save();
        (0, helper_1.apiResponse)(res, 200, "Booking assigned successfully", booking);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to assign booking", err);
    }
});
/**
 * View all reviews
 */
const viewAllReviews = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviews = yield models_1.Review.find().populate("bookingId userId");
        (0, helper_1.apiResponse)(res, 200, "All reviews fetched", reviews);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch reviews", err);
    }
});
/**
 * Create an org/emp account
 */
const createOrgEmp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, phone, roleName } = req.body;
        if (!["org", "emp"].includes(roleName)) {
            (0, helper_1.apiError)(res, 400, "Role must be 'org' or 'emp'");
            return;
        }
        const roleDoc = yield models_1.Role.findOne({ name: roleName });
        if (!roleDoc) {
            (0, helper_1.apiError)(res, 400, "Role not found");
            return;
        }
        const existing = yield models_1.User.findOne({ email }).lean();
        if (existing) {
            (0, helper_1.apiError)(res, 400, "User already exists with this email");
            return;
        }
        const hashPassword = yield bcrypt_1.default.hash(password, 10);
        // password will already be hashed in user model pre-save hook or manually before
        const created = yield models_1.User.create({
            name,
            email,
            password: hashPassword, // hashPassword() if not using pre-save middleware
            phone,
            role: roleDoc._id,
        });
        (0, helper_1.apiResponse)(res, 201, "Org/Emp account created successfully", {
            id: created._id,
            name: created.name,
            email: created.email,
            role: roleName,
        });
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to create Org/Emp account", err);
    }
});
/**
 * Get own profile
 */
const getProfileSelf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const user = yield models_1.User.findById(req.user.id).select("-password");
        if (!user) {
            (0, helper_1.apiError)(res, 404, "User not found");
            return;
        }
        (0, helper_1.apiResponse)(res, 200, "Profile fetched successfully", user);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch profile", err);
    }
});
/**
 * Update own profile
 */
const updateProfileSelf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const updated = yield models_1.User.findByIdAndUpdate(req.user.id, req.body, {
            new: true,
            runValidators: true,
        }).select("-password");
        (0, helper_1.apiResponse)(res, 200, "Profile updated successfully", updated);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to update profile", err);
    }
});
/**
 * Delete own profile
 */
const deleteProfileSelf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        yield models_1.User.findByIdAndDelete(req.user.id);
        (0, helper_1.apiResponse)(res, 200, "Profile deleted successfully", {});
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to delete profile", err);
    }
});
/**
 * Assign a task from booking table to an employee based on role
 * Enhanced version with better validation and employee selection
 */
const assignTaskToEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { bookingId, employeeIds } = req.body;
        // Validate required fields
        if (!bookingId) {
            (0, helper_1.apiError)(res, 400, "Booking ID is required");
            return;
        }
        // Find the booking
        const booking = yield models_1.Booking.findById(bookingId)
            .populate("userId", "name email phone")
            .populate("assignments.employeeId", "name email phone");
        if (!booking) {
            (0, helper_1.apiError)(res, 404, "Booking not found");
            return;
        }
        // Check if booking is cancelled
        if (booking.status === "cancelled") {
            (0, helper_1.apiError)(res, 400, "Cannot assign a cancelled booking");
            return;
        }
        // If employeeIds is provided, validate and assign to specific employees
        let empIdsArray = [];
        if (Array.isArray(employeeIds)) {
            empIdsArray = employeeIds;
        }
        else if (req.body.employeeId) {
            empIdsArray = [req.body.employeeId];
        }
        if (empIdsArray.length > 0) {
            const employees = yield models_1.User.find({
                _id: { $in: empIdsArray },
            }).populate("role");
            if (employees.length !== empIdsArray.length) {
                (0, helper_1.apiError)(res, 404, "One or more employees not found");
                return;
            }
            for (const employee of employees) {
                // Verify the user has employee role
                const roleName = (_a = employee.role) === null || _a === void 0 ? void 0 : _a.name;
                if (roleName !== "emp") {
                    (0, helper_1.apiError)(res, 400, "Selected user is not an employee. User role: " +
                        roleName);
                    return;
                }
                // Check if employee is active
                if (!employee.isActive) {
                    (0, helper_1.apiError)(res, 400, `Employee ${employee.name} is not active`);
                    return;
                }
                // Verify employee has 0 active jobs ($elemMatch ensures we check per-employee status, not across all assignments)
                const activeTasksCount = yield models_1.Booking.countDocuments({
                    _id: { $ne: booking._id },
                    assignments: {
                        $elemMatch: {
                            employeeId: employee._id,
                            status: { $in: ["assigned", "started"] },
                        },
                    },
                });
                if (activeTasksCount > 0) {
                    (0, helper_1.apiError)(res, 400, `Employee ${employee.name} already has an active job and cannot be assigned.`);
                    return;
                }
            }
            // Append the new employees to the booking, preventing duplicates
            const currentIds = (booking.assignments || [])
                .filter((a) => a.status !== "removed")
                .map((a) => a.employeeId.toString());
            const newAssignments = employees
                .filter((e) => !currentIds.includes(e._id.toString()))
                .map((e) => ({
                employeeId: e._id,
                status: "assigned",
                assignedAt: new Date(),
            }));
            if (!booking.assignments)
                booking.assignments = [];
            booking.assignments.push(...newAssignments);
            booking.status = "assigned";
            booking.assignedAt = new Date();
            // Check if user sent allocatedTime (Timer feature)
            if (req.body.allocatedTime !== undefined) {
                booking.allocatedTime = Number(req.body.allocatedTime) || 0;
            }
            yield booking.save();
            // Populate the updated booking
            const updatedBooking = yield models_1.Booking.findById(booking._id)
                .populate("userId", "name email phone")
                .populate("assignments.employeeId", "name email phone");
            (0, helper_1.apiResponse)(res, 200, "Task assigned to employees successfully", {
                booking: updatedBooking,
                assignedTo: employees.map((e) => ({
                    id: e._id,
                    name: e.name,
                    email: e.email,
                    phone: e.phone,
                })),
            });
        }
        else {
            // If no employeeId provided, return list of available employees
            const empRole = yield models_1.Role.findOne({ name: "emp" });
            if (!empRole) {
                (0, helper_1.apiError)(res, 500, "Employee role not found in system");
                return;
            }
            const availableEmployees = yield models_1.User.find({
                role: empRole._id,
                isActive: true,
            }).select("name email phone");
            if (availableEmployees.length === 0) {
                (0, helper_1.apiError)(res, 404, "No active employees available");
                return;
            }
            (0, helper_1.apiResponse)(res, 200, "Please select an employee to assign", {
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
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to assign task to employee", err);
    }
});
/**
 * Remove an assigned employee from a booking
 */
const removeAssignedEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId, employeeId } = req.params;
        const booking = yield models_1.Booking.findById(bookingId);
        if (!booking) {
            (0, helper_1.apiError)(res, 404, "Booking not found");
            return;
        }
        if (!booking.assignments || booking.assignments.length === 0) {
            (0, helper_1.apiError)(res, 400, "No assignments found for this booking");
            return;
        }
        // Find the specific assignment and mark as removed
        const assignment = booking.assignments.find((a) => a.employeeId.toString() === employeeId && a.status !== "removed");
        if (!assignment) {
            (0, helper_1.apiError)(res, 404, "Active employee assignment not found");
            return;
        }
        assignment.status = "removed";
        // The .pre('save') hook handles global status calculations!
        yield booking.save();
        (0, helper_1.apiResponse)(res, 200, "Employee removed successfully", booking);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to remove assigned employee", err);
    }
});
/**
 * Get all available employees for task assignment
 */
const getAvailableEmployees = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const empRole = yield models_1.Role.findOne({ name: "emp" });
        if (!empRole) {
            (0, helper_1.apiError)(res, 500, "Employee role not found in system");
            return;
        }
        const employees = yield models_1.User.find({
            role: empRole._id,
            isActive: true,
        })
            .select("name email phone address")
            .populate("role", "name");
        // Get task count for each employee
        const employeesWithTaskCount = yield Promise.all(employees.map((emp) => __awaiter(void 0, void 0, void 0, function* () {
            const activeTasksCount = yield models_1.Booking.countDocuments({
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
        })));
        // Sort by active tasks count (least busy first)
        employeesWithTaskCount.sort((a, b) => a.activeTasksCount - b.activeTasksCount);
        (0, helper_1.apiResponse)(res, 200, "Available employees fetched successfully", {
            totalEmployees: employeesWithTaskCount.length,
            employees: employeesWithTaskCount,
        });
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch available employees", err);
    }
});
/**
 * Update the status of a booking manually by Admin
 * Uses findByIdAndUpdate to bypass the pre-save hook that auto-recalculates status.
 */
const updateBookingStatusAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            (0, helper_1.apiError)(res, 400, "Invalid status. Valid: pending, assigned, started, completed, cancelled");
            return;
        }
        // Build the $set payload without touching the model's pre-save hook
        const setFields = { status };
        if (status === "started")
            setFields.timerStartedAt = new Date();
        if (status === "completed")
            setFields.completedAt = new Date();
        if (status === "cancelled")
            setFields.cancelledAt = new Date();
        if (allocatedTime !== undefined)
            setFields.allocatedTime = Number(allocatedTime);
        // Determine what assignment status we should cascade to
        const assignmentStatusMap = {
            started: "started",
            completed: "completed",
            assigned: "assigned",
            cancelled: "removed",
            pending: "removed", // pending means previous assignments should be removed
        };
        const asnStatus = assignmentStatusMap[status];
        // Build arrayFilters-based update to only touch non-removed assignments
        const updateQuery = { $set: setFields };
        // Cascade to assignments using positional filtered operator
        if (asnStatus) {
            updateQuery.$set["assignments.$[active].status"] = asnStatus;
            if (status === "started")
                updateQuery.$set["assignments.$[active].startTime"] =
                    new Date();
            if (status === "completed")
                updateQuery.$set["assignments.$[active].endTime"] = new Date();
        }
        const booking = yield models_1.Booking.findByIdAndUpdate(id, updateQuery, {
            new: true,
            arrayFilters: [{ "active.status": { $ne: "removed" } }],
        }).populate("assignments.employeeId", "name email phone");
        if (!booking) {
            (0, helper_1.apiError)(res, 404, "Booking not found");
            return;
        }
        (0, helper_1.apiResponse)(res, 200, "Booking status updated successfully", booking);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to update booking status", err);
    }
});
/**
 * Update an individual assignment's status
 */
const updateAssignmentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId, employeeId } = req.params;
        const { status } = req.body;
        const validStatuses = ["assigned", "started", "completed"];
        if (!validStatuses.includes(status)) {
            (0, helper_1.apiError)(res, 400, "Invalid assignment status. Valid: assigned, started, completed");
            return;
        }
        // Step 1: Update the specific assignment using findByIdAndUpdate
        const timestampFields = {};
        if (status === "started")
            timestampFields["assignments.$[elem].startTime"] = new Date();
        if (status === "completed")
            timestampFields["assignments.$[elem].endTime"] = new Date();
        const updatedBooking = yield models_1.Booking.findByIdAndUpdate(bookingId, {
            $set: Object.assign({ "assignments.$[elem].status": status }, timestampFields),
        }, {
            new: true,
            arrayFilters: [
                {
                    "elem.employeeId": employeeId,
                    "elem.status": { $ne: "removed" },
                },
            ],
        });
        if (!updatedBooking) {
            (0, helper_1.apiError)(res, 404, "Booking or active assignment not found");
            return;
        }
        // Step 2: Recalculate global status from DB state
        const activeAssignments = updatedBooking.assignments.filter((a) => a.status !== "removed");
        let newBookingStatus = updatedBooking.status;
        if (newBookingStatus !== "cancelled") {
            if (activeAssignments.length === 0) {
                newBookingStatus = "pending";
            }
            else {
                const allCompleted = activeAssignments.every((a) => a.status === "completed");
                const anyStarted = activeAssignments.some((a) => a.status === "started" || a.status === "completed");
                if (allCompleted)
                    newBookingStatus = "completed";
                else if (anyStarted)
                    newBookingStatus = "started";
                else
                    newBookingStatus = "assigned";
            }
        }
        // Step 3: Update booking status and timestamps if changed
        const bookingUpdateFields = {};
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
            finalBooking = (yield models_1.Booking.findByIdAndUpdate(bookingId, { $set: bookingUpdateFields }, { new: true }).populate("assignments.employeeId", "name email phone")) || updatedBooking;
        }
        else {
            finalBooking = yield models_1.Booking.populate(updatedBooking, {
                path: "assignments.employeeId",
                select: "name email phone",
            });
        }
        (0, helper_1.apiResponse)(res, 200, "Assignment status updated", {
            booking: finalBooking,
        });
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to update assignment status", err);
    }
});
/**
 * Create a booking (Admin / Super-Admin)
 */
const createBookingAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const { serviceId, userId: targetUserId, // optional: assign booking to this account
        address, phoneNumber, instruction, date, timeSlot, referencePhoto, } = req.body;
        if (!address || !phoneNumber || !date || !timeSlot) {
            (0, helper_1.apiError)(res, 400, "Address, phone number, date and time slot are required");
            return;
        }
        // Resolve service
        if (!serviceId) {
            (0, helper_1.apiError)(res, 400, "serviceId is required");
            return;
        }
        const service = yield models_1.Service.findById(serviceId);
        if (!service || !service.isActive) {
            (0, helper_1.apiError)(res, 400, "Service not found or inactive");
            return;
        }
        // Upload reference photo if provided
        let referencePhotoUrl = "";
        if (referencePhoto) {
            try {
                referencePhotoUrl = yield (0, uploadPhoto_1.uploadToCloudinary)(referencePhoto, "gogreen/reference-photos");
            }
            catch (uploadErr) {
                (0, helper_1.apiError)(res, 500, "Failed to upload reference photo", uploadErr);
                return;
            }
        }
        // Use provided userId (assigned account) or fall back to admin's own id
        const bookingUserId = targetUserId !== null && targetUserId !== void 0 ? targetUserId : req.user.id;
        const booking = yield models_1.Booking.create({
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
        (0, helper_1.apiResponse)(res, 201, "Booking created successfully", booking);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to create booking", err);
    }
});
/**
 * Reassign an existing booking to a different user account
 */
const reassignBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const { id } = req.params;
        const { userId: newUserId } = req.body;
        if (!newUserId) {
            (0, helper_1.apiError)(res, 400, "userId is required");
            return;
        }
        const newUser = yield models_1.User.findById(newUserId);
        if (!newUser) {
            (0, helper_1.apiError)(res, 404, "Target account not found");
            return;
        }
        const booking = yield models_1.Booking.findByIdAndUpdate(id, { userId: newUserId }, { new: true });
        if (!booking) {
            (0, helper_1.apiError)(res, 404, "Booking not found");
            return;
        }
        (0, helper_1.apiResponse)(res, 200, "Booking reassigned successfully", booking);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to reassign booking", err);
    }
});
/**
 * Get a single employee's detail with current and past assignments
 */
const getEmployeeDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const employee = yield models_1.User.findById(id)
            .select("-password")
            .populate("role", "name");
        if (!employee) {
            (0, helper_1.apiError)(res, 404, "Employee not found");
            return;
        }
        if (((_a = employee.role) === null || _a === void 0 ? void 0 : _a.name) !== "emp") {
            (0, helper_1.apiError)(res, 400, "User is not an employee");
            return;
        }
        // Current active assignments
        const activeBookings = yield models_1.Booking.find({
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
        const pastBookings = yield models_1.Booking.find({
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
        (0, helper_1.apiResponse)(res, 200, "Employee detail fetched successfully", {
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
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch employee detail", err);
    }
});
exports.default = {
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
