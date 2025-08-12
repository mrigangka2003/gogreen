import { Navigate } from "react-router-dom";

import { useAuthStore } from "../stores/auth";
import {
    AdminDashboard,
    UserDashboard,
    OrganizationDashboards,
} from "../components";

const Dashboard = () => {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Navigate to={"/login"} />;
    }

    switch (user.role) {
        case "admin":
            return <AdminDashboard/>;
        case "user":
            return <UserDashboard/>;
        case "org":
            return <OrganizationDashboards />;
        default:
            return <div>Invalid user type</div>;
    }
};

export default Dashboard