import {
    useEffect,
    useState,
    useCallback
} from "react";

import AuthContext from "./AuthContext";

import {
    loginUser,
    getCurrentUser
} from "../services/authService";


export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("velocyte_access_token")
    );

    const [loading, setLoading] = useState(true);


    // LOGOUT

    const logout = useCallback(() => {

        localStorage.removeItem("velocyte_access_token");
        localStorage.removeItem("velocyte_refresh_token");

        setAccessToken(null);
        setUser(null);

    }, []);


    // LOAD USER

    useEffect(() => {

        let isMounted = true;

        const loadUser = async () => {

            if (!accessToken) {
                if (isMounted) {
                    setUser(null);
                    setLoading(false);
                }
                return;
            }

            try {

                const currentUser = await getCurrentUser(accessToken);

                if (isMounted) {
                    setUser(currentUser);
                }

            } catch (error) {

                console.error("Authentication failed:", error);

                if (isMounted) {
                    logout();
                }

            } finally {

                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadUser();

        return () => {
            isMounted = false;
        };

    }, [accessToken, logout]);


    // EMAIL/PASSWORD LOGIN

    const login = async (email, password) => {

        const data = await loginUser({
            email,
            password
        });

        localStorage.setItem(
            "velocyte_access_token",
            data.access_token
        );

        localStorage.setItem(
            "velocyte_refresh_token",
            data.refresh_token
        );

        setAccessToken(data.access_token);
        setUser(data.user);

        return data;
    };


    // GITHUB OAUTH LOGIN

    const loginWithTokens = async (accessToken, refreshToken) => {

        const currentUser = await getCurrentUser(accessToken);

        localStorage.setItem(
            "velocyte_access_token",
            accessToken
        );

        localStorage.setItem(
            "velocyte_refresh_token",
            refreshToken
        );

        setAccessToken(accessToken);
        setUser(currentUser);

        return currentUser;
    };


    // CONTEXT VALUE

    const value = {
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        loading,
        login,
        loginWithTokens,
        logout
    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}