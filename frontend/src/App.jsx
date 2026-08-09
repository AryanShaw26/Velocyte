import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";


function App() {

    return (
        <BrowserRouter>

            <AuthProvider>

                <Routes>

                    {/* Public Routes */}

                    <Route
                        path="/"
                        element={<Landing />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />


                    {/* Protected Routes */}

                    <Route element={<ProtectedRoute />}>

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                    </Route>

                </Routes>

            </AuthProvider>

        </BrowserRouter>
    );
}


export default App;