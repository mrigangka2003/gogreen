import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import App from "./App.tsx";
import {
    Home,
    ProductsServices,
    CorporateResponsibility,
    About,
    MemberPage,
} from "./pages";

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
                path: "/about",
                element: <About />,
            },
            {
                    path:"/about/:memberId",
                    element:<MemberPage/>
            }
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
