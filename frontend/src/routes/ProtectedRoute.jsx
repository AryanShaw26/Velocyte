import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {

    const {
        isAuthenticated,
        loading,
    } = useAuth();

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "#07070a",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                Checking authentication...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;