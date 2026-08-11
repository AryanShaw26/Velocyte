import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function GitHubCallback() {
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();

  const [error, setError] = useState("");

  useEffect(() => {
    const handleGitHubCallback = async () => {
      try {
        // --------------------------------------------------
        // Read tokens from URL hash
        // --------------------------------------------------

        const hash = window.location.hash.substring(1);

        const params = new URLSearchParams(hash);

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (!accessToken || !refreshToken) {
          throw new Error(
            "GitHub authentication tokens were not received."
          );
        }

        // --------------------------------------------------
        // Store tokens and update authentication state
        // --------------------------------------------------

        await loginWithTokens(
          accessToken,
          refreshToken
        );

        // --------------------------------------------------
        // Remove tokens from browser URL
        // --------------------------------------------------

        window.history.replaceState(
          {},
          document.title,
          "/github-callback"
        );

        // --------------------------------------------------
        // Redirect to dashboard
        // --------------------------------------------------

        navigate("/dashboard", {
          replace: true,
        });

      } catch (err) {
        console.error(
          "GitHub authentication failed:",
          err
        );

        setError(
          err.message ||
          "GitHub authentication failed."
        );
      }
    };

    handleGitHubCallback();
  }, [loginWithTokens, navigate]);

  // --------------------------------------------------------
  // Error screen
  // --------------------------------------------------------

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
        <div style={{ textAlign: "center" }}>
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

  // --------------------------------------------------------
  // Loading screen
  // --------------------------------------------------------

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