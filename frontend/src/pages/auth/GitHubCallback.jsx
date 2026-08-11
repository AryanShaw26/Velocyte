import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function GitHubCallback() {
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();

  const [error, setError] = useState("");

  // Prevent the callback from being processed twice
  const processedRef = useRef(false);

  useEffect(() => {
    const handleGitHubCallback = async () => {
      // --------------------------------------------------
      // Prevent duplicate callback processing
      // --------------------------------------------------

      if (processedRef.current) {
        return;
      }

      processedRef.current = true;

      try {
        // --------------------------------------------------
        // Read tokens from URL hash
        // --------------------------------------------------

        const hash = window.location.hash.substring(1);

        const params = new URLSearchParams(hash);

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        // --------------------------------------------------
        // If tokens are missing, check whether another
        // callback process has already handled them.
        // --------------------------------------------------

        if (!accessToken || !refreshToken) {
          const alreadyProcessed = sessionStorage.getItem(
            "github_oauth_processed"
          );

          if (alreadyProcessed === "true") {
            navigate("/dashboard", {
              replace: true,
            });

            return;
          }

          throw new Error(
            "GitHub authentication tokens were not received."
          );
        }

        // --------------------------------------------------
        // Mark OAuth callback as being processed
        // --------------------------------------------------

        sessionStorage.setItem(
          "github_oauth_processed",
          "true"
        );

        // --------------------------------------------------
        // Store Velocyte tokens and update auth state
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

        // Allow another legitimate login attempt
        sessionStorage.removeItem(
          "github_oauth_processed"
        );

        setError(
          err?.message ||
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