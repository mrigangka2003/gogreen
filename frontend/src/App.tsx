import { Outlet } from "react-router-dom";

import { Header, Footer, ScrollToTop } from "./components";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    return (
        <>
            <Header />
            <main>
                <ScrollToTop />
                <Outlet />
            </main>
            <Footer />
            <ToastContainer
                position="bottom-right"
                autoClose={2500}
                hideProgressBar
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover={false}
                theme="dark"
                transition={Slide}
                toastStyle={{
                    borderRadius: "14px",
                    padding: "12px 18px",
                    fontSize: "13px",
                    fontWeight: 600,
                    fontFamily: "'Inter', 'system-ui', sans-serif",
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)",
                    backdropFilter: "blur(12px)",
                    minHeight: "auto",
                }}
                closeButton={false}
            />
        </>
    );
}

export default App;
