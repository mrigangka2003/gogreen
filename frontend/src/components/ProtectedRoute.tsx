import { Navigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth";

type Props = {
    children: ReactNode;
    allowedRoles?: string[];
};

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
    const user = useAuthStore((state) => state.user);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        // Wait for zustand persist to hydrate from localStorage
        const unsub = useAuthStore.persist.onFinishHydration(() => {
            setHydrated(true);
        });

        // If already hydrated (fast path)
        if (useAuthStore.persist.hasHydrated()) {
            setHydrated(true);
        }

        return () => unsub();
    }, []);

    // Show nothing while hydrating to avoid a flash redirect to /login
    if (!hydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

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
