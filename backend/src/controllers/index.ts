import { registerUser, loginUser } from "./auth/userAuth.controller";
import { createBooking } from "./user.controller";


import { logout } from "./auth/logout.controller";

import { getAllBookings,getAllUsers } from "./admin.controller";
export {
    registerUser,
    loginUser,
    createBooking,
    
    logout,
    getAllBookings,
    getAllUsers
};
