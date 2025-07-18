import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {

    const isAuthenticated = false;

    return isAuthenticated ? children : <Navigate to="/login" />
};

export default ProtectedRoute;
