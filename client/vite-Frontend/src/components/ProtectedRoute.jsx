import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import api from "../services/api";

function ProtectedRoute() {
    const location = useLocation();
    const [status, setStatus] = useState("checking");
    useEffect(() => {
        let active = true;
        const checkAuth = async () => {
            try {
                await api("/api/wishlist");
                if (active) setStatus("authenticated");
            } catch (error) {
                if (active) {
                    setStatus("unauthenticated");
                }
            }
        };
        checkAuth();
        return () => {
            active = false;
        };
    }, []);

    if (status === "checking") {
        return (
            <div className="auth-loading"> 
                <p>Checking your session...</p> 
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }
    return <Outlet />;
}

export default ProtectedRoute;
