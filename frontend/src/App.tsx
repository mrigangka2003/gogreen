import { Outlet } from "react-router-dom";

import { Header, Footer, ScrollToTop } from "./components";


function App() {
    return (
        <>
            <Header />
            <main>
                <ScrollToTop/>
                <Outlet />
            </main>
            <Footer />
        </>
    );
}

export default App;
