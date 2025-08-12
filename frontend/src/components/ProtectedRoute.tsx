import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = !!user;

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
