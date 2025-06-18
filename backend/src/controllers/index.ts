import { registerUser, loginUser } from "./auth/userAuth.controller";

import { createBooking,getBookingDetails,getUserBookings } from "./user.controller";
import { logout } from "./auth/logout.controller";
import { getAllUserBookings,getAllOrgBookings, getAllUsers,getAllOrg } from "./admin.controller";


export {
    registerUser,
    loginUser,
    createBooking,
    getBookingDetails,
    getUserBookings,

    logout,
    getAllUserBookings,
    getAllUsers,
    getAllOrg,
    getAllOrgBookings
};
