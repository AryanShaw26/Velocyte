import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";

import { AuthProvider } from "./context/AuthContext";


function App() {

    return (

        <BrowserRouter>

            <AuthProvider>

                <Routes>

                    <Route
                        path="/"
                        element={<Landing />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                </Routes>

            </AuthProvider>

        </BrowserRouter>

    );

}


export default App;