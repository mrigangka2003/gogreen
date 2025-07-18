import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
} from "./pages";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

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
                path: "/dashboard",
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/book-now",
                element: (
                    <ProtectedRoute>
                        <BookNow />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/login",
                element: <Auth />,
            },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
