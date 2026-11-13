import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import { exchangeGithubCode } from "../../services/authService";

function GitHubCallback() {
    const navigate = useNavigate();
    const { loginWithTokens } = useAuth();

    const [error, setError] = useState("");

    const processedRef = useRef(false);

    useEffect(() => {
        const handleGitHubCallback = async () => {

            if (processedRef.current) {
                return;
            }

            processedRef.current = true;

            try {
                // Read one-time authorization code
                const params = new URLSearchParams(
                    window.location.search
                );

                const code = params.get("code");

                if (!code) {
                    throw new Error(
                        "GitHub authorization code was not received."
                    );
                }

                // Remove code from browser URL immediately
                window.history.replaceState(
                    {},
                    document.title,
                    "/github-callback"
                );

                // Exchange one-time code for Velocyte JWT tokens
                const tokenData = await exchangeGithubCode(code);

                // Store tokens and update authentication state
                await loginWithTokens(
                    tokenData.access_token,
                    tokenData.refresh_token
                );

                // Redirect to dashboard
                navigate("/dashboard", {
                    replace: true,
                });

            } catch (err) {

                console.error(
                    "GitHub authentication failed:",
                    err
                );

                setError(
                    err?.message ||
                    "GitHub authentication failed."
                );
            }
        };

        handleGitHubCallback();

    }, [loginWithTokens, navigate]);

    // Error screen
    if (error) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    background: "#09090b",
                    padding: "24px",
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        maxWidth: "500px",
                    }}
                >
                    <h2>GitHub Authentication Failed</h2>

                    <p
                        style={{
                            color: "#a1a1aa",
                            marginTop: "10px",
                        }}
                    >
                        {error}
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        style={{
                            marginTop: "20px",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // Loading screen
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                background: "#09090b",
            }}
        >
            <div style={{ textAlign: "center" }}>
                <h2>Signing you in with GitHub...</h2>

                <p
                    style={{
                        color: "#a1a1aa",
                        marginTop: "10px",
                    }}
                >
                    Please wait while we complete authentication.
                </p>
            </div>
        </div>
    );
}

export default GitHubCallback;