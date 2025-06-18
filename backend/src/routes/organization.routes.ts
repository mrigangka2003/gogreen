import { Router } from "express";
import { createBooking } from "../controllers";


const organizationRoutes = Router() ;

organizationRoutes.post('/createbooking',createBooking);

export default organizationRoutes ;