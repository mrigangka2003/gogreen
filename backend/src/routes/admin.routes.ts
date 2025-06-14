import { Request, Response, Router } from "express";

import { getAllBookings, getAllUsers} from "../controllers";
import { authenticate } from "../middlewares/authMiddleware";


const adminRoutes = Router() ;


adminRoutes.get('/allbookings',authenticate,getAllBookings) ;
adminRoutes.get('/users',authenticate , getAllUsers) ;

/*
admin routes --  
    other nav bars 
    user list
    get all user
    get all orders 
*/

export default adminRoutes ;