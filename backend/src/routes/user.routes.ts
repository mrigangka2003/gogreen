import { Router,Request,Response } from "express";
import { createBooking, loginUser, registerUser } from "../controllers";
import { authenticate } from "../middlewares/authMiddleware";


const userRouter = Router() ;

userRouter.post('/book-now', authenticate,createBooking) ;

/*
user routes --  
    home,
    services 
    logout
    book-now
    order-history
*/

export default userRouter ;