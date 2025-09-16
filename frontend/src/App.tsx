import { Outlet } from "react-router-dom";

import { Header, Footer, ScrollToTop } from "./components";
import { ToastContainer } from "react-toastify";

function App() {
    return (
        <>
            <Header />
            <main>
                <ScrollToTop />
                <Outlet />
            </main>
            <Footer />
            <ToastContainer />
        </>
    );
}

export default App;
