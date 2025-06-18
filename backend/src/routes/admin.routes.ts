import { Request, Response, Router } from "express";

import {
    getAllUserBookings,
    getAllOrg,
    getAllUsers,
    getAllOrgBookings,
} from "../controllers";
import { authenticate } from "../middlewares/authMiddleware";

const adminRoutes = Router();

adminRoutes.get("/user-bookings", authenticate, getAllUserBookings);
adminRoutes.get("/org-bookings", authenticate, getAllOrgBookings);
adminRoutes.get("/users", authenticate, getAllUsers);

adminRoutes.get("/organizations", authenticate, getAllOrg);


export default adminRoutes;
