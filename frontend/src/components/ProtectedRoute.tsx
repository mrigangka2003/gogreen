import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthStore } from "../stores/auth";

type Props = {
    children: ReactNode;
    allowedRoles?: string[];
};

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
    const user = useAuthStore((state) => state.user);

    if (!user) return <Navigate to="/login" replace />;

    if (
        allowedRoles?.length &&
        (!user.role || !allowedRoles.includes(user.role))
    ) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
