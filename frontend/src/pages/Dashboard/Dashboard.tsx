import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";
import DashboardLayout from "../../components/Dashboard-layout/DashboardLayout";
import {
    AdminDashboard,
    UserDashboard,
    OrganizationDashboards,
    EmployeeDashboard,
    SuperAdminDashboard
} from "../../components";

type UserRole = "admin" | "user" | "org" | "emp" | "super-admin";

const ROLE_COMPONENT: Record<UserRole, React.ComponentType> = {
    admin: AdminDashboard,
    user: UserDashboard,
    org: OrganizationDashboards,
    emp: EmployeeDashboard,
    "super-admin": SuperAdminDashboard,
};

const Dashboard: React.FC = () => {
    const user = useAuthStore((state) => state.user);

    if (!user) return <Navigate to="/login" replace />;

    const Component = ROLE_COMPONENT[user.role as UserRole];
    if (!Component) return <div>Invalid user type</div>;

    return (
        <DashboardLayout basePath={`/dashboard/`} showHeader>
            {/* render the role-specific dashboard inside the layout */}
            <Component />
        </DashboardLayout>
    );
};

export default Dashboard;
