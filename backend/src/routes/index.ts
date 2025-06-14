import { Router } from "express";

import userRouter from "./user.routes";
import adminRoutes from "./admin.routes";
import { authenticate } from "../middlewares/authMiddleware";
import { loginUser, logout, registerUser } from "../controllers";

const router = Router() ;

//common routes
router.post('/signup',registerUser);
router.post('/login', loginUser);
router.post('/logout', authenticate,logout);

router.use('/user',userRouter) ;
router.use('/admin',adminRoutes) ;


export default router ;