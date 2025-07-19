import { Outlet } from "react-router-dom";

import { Header, Footer, ScrollToTop, BookNowButton, ContactFloating } from "./components";


function App() {
    return (
        <>
            <Header />
            <main>
                <ScrollToTop/>
                <Outlet />
            </main>
            <BookNowButton/>
            <ContactFloating/>
            <Footer />
        </>
    );
}

export default App;
