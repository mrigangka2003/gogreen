import { Router,Request,Response } from "express";
import { createBooking, getBookingDetails, getUserBookings, loginUser, registerUser } from "../controllers";
import { authenticate } from "../middlewares/authMiddleware";
import { addBookingFeedback } from "../controllers/user.controller";


const userRouter = Router() ;

userRouter.post('/book-now', authenticate,createBooking) ;
userRouter.get('/bookings',authenticate,getUserBookings);
userRouter.get('/bookings/:bookingId',authenticate,getBookingDetails);
userRouter.post('/:bookingId/feedback',authenticate,addBookingFeedback);

//buy now
//payment


export default userRouter ;