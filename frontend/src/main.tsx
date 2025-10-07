import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
} from "react-router-dom";

import "./index.css";
import App from "./App.tsx";
import {
    Home,
    ProductsServices,
    CorporateResponsibility,
    CommunityImpact,
    Media,
    About,
    MemberPage,
    JobSearch,
    Internships,
    Events,
    WorkingHere,
    OurProcess,
    Auth,
    Dashboard,
    BookNow,
    MyBookings,
} from "./pages";

import ProtectedRoute from "./components/ProtectedRoute.tsx";
import DashboardLayout from "./components/Dashboard-layout/DashboardLayout.tsx";
import { AdminDashboard, UserDashboard } from "./components/index.ts";

const SuperAccounts = lazy(() => import("./pages/super/SuperAccounts.tsx"));
const SuperAdminDashboard = lazy(() => import("./pages/super/SuperAdminDashboard.tsx"));
const SuperReviews = lazy(() => import("./pages/super/SuperReviews.tsx"));
const SuperCreateAdmin = lazy(() => import("./pages/super/SuperCreateAdmin.tsx"));
const AssignBooking = lazy(()=>import("./pages/AssignBooking.tsx"));


const MyReviews = lazy(()=>import("./pages/MyReviews.tsx"));
const MyProfile = lazy(() => import("./pages/MyProfile.tsx"));

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/product-and-services",
                element: <ProductsServices />,
            },
            {
                path: "/corporate-responsibility",
                element: <CorporateResponsibility />,
            },
            {
                path: "/community-impact",
                element: <CommunityImpact />,
            },
            {
                path: "/media",
                element: <Media />,
            },
            {
                path: "/about",
                element: <About />,
            },
            {
                path: "/about/:memberId",
                element: <MemberPage />,
            },
            {
                path: "/careers/job-search",
                element: <JobSearch />,
            },
            {
                path: "/careers/job-search",
                element: <JobSearch />,
            },
            {
                path: "/careers/students/internships",
                element: <Internships />,
            },
            {
                path: "/careers/students/events",
                element: <Events />,
            },
            {
                path: "/careers/working-here",
                element: <WorkingHere />,
            },
            {
                path: "/careers/our-process",
                element: <OurProcess />,
            },
            {
                path: "/login",
                element: <Auth />,
            },
        ],
    },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <Suspense
                    fallback={<div className="p-6 text-fifth">Loading…</div>}
                >
                    <Dashboard />
                </Suspense>
            </ProtectedRoute>
        ),
        children: [{ index: true, element: <Navigate to="user" replace /> }], // generic redirect
    },

    //---User--Dashboard and Routes

    {
        path: "/dashboard/user",
        element: (
            <ProtectedRoute allowedRoles={["user"]}>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <UserDashboard /> },
            { path: "book-now", element: <BookNow /> },
            { path: "my-bookings", element: <MyBookings /> },
            { path: "my-reviews", element: <MyReviews /> },
            { path: "profile", element: <MyProfile /> },
        ],
    },

    // /* –– Org –– */

    {
        path: "/dashboard/org",
        element: (
            <ProtectedRoute allowedRoles={["org"]}>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <UserDashboard /> },
            { path: "book-now", element: <BookNow /> },
            { path: "my-bookings", element: <MyBookings /> },
            { path: "my-reviews", element: <MyReviews /> },
            { path: "profile", element: <MyProfile /> },
        ],
    },

    {
        path: "/dashboard/emp",
        element: (
            <ProtectedRoute allowedRoles={["emp"]}>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <UserDashboard /> },
            { path: "book-now", element: <BookNow /> },
            { path: "my-bookings", element: <MyBookings /> },
            { path: "profile", element: <MyProfile /> },
        ],
    },

    // /* –– ADMIN –– */
    {
        path: "/dashboard/admin",
        element: (
            <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <AdminDashboard /> },
            { path: "accounts", element: <BookNow /> },
            { path: "all-bookings", element: <AssignBooking /> },
            { path: "reviews", element: <MyBookings /> },
            { path: "profile", element: <MyProfile /> },
        ],
    },

    /* –– SUPER-ADMIN –– */
    {
        path: "/dashboard/super-admin",
        element: (
            <ProtectedRoute allowedRoles={["super-admin"]}>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <SuperAdminDashboard /> },
            { path: "accounts", element: <SuperAccounts /> },
            { path: "all-bookings", element: <AssignBooking /> },
            { path: "create-admin", element: <SuperCreateAdmin /> },
            { path: "all-reviews", element: <SuperReviews /> },
            { path: "profile", element: <MyProfile /> },
        ],
    },

    // {
    //     path: "/profile",
    //     element: (
    //         <ProtectedRoute
    //             allowedRoles={["user", "emp", "org", "admin", "super-admin"]}
    //         >
    //             <MyProfile />
    //         </ProtectedRoute>
    //     ),
    // },

    /* ---------- 404 ---------- */
    { path: "*", element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
