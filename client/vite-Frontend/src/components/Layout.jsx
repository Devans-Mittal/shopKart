import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
function Layout() {
    return (
        <>
            <Navbar />
            <main className="app-main">
                <Outlet />
            </main>
        </>
    );
}
export default Layout;
