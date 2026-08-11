import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function GitHubConnectCallback() {
    console.log(
    "FULL CALLBACK URL:",
    window.location.href
  );

  console.log(
    "CALLBACK SEARCH:",
    window.location.search
  );
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [username, setUsername] = useState("");

  useEffect(() => {
    // ======================================================
    // READ GITHUB CONNECTION RESULT
    // ======================================================

    const params = new URLSearchParams(
      window.location.search
    );

    const connectionStatus = params.get("status");
    const githubUsername = params.get("github_username");

    console.log("GitHub connection callback:", {
      connectionStatus,
      githubUsername,
      currentUrl: window.location.href,
    });

    // ======================================================
    // SUCCESS
    // ======================================================

    if (
      connectionStatus === "success" &&
      githubUsername
    ) {
      setUsername(githubUsername);
      setStatus("success");

      // IMPORTANT:
      // Do NOT remove the query parameters here.
      // React StrictMode can execute this effect twice
      // during development.
      return;
    }

    // ======================================================
    // ERROR
    // ======================================================

    setStatus("error");
  }, []);

  // ========================================================
  // LOADING
  // ========================================================

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#09090b",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Connecting GitHub...</h2>

          <p
            style={{
              color: "#a1a1aa",
              marginTop: "10px",
            }}
          >
            Please wait while we finish connecting
            your GitHub account.
          </p>
        </div>
      </div>
    );
  }

  // ========================================================
  // SUCCESS
  // ========================================================

  if (status === "success") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#09090b",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            textAlign: "center",
            background: "#111116",
            border: "1px solid #27272a",
            borderRadius: "16px",
            padding: "40px",
          }}
        >
          {/* Success icon */}

          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: "rgba(34,197,94,0.12)",
              color: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
            }}
          >
            ✓
          </div>

          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              marginBottom: "12px",
            }}
          >
            GitHub Connected
          </h1>

          <p
            style={{
              color: "#a1a1aa",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Your Velocyte account is now connected
            to GitHub.
          </p>

          <p
            style={{
              color: "#c4b5fd",
              fontWeight: "600",
              marginTop: "12px",
            }}
          >
            @{username}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard", {
                replace: true,
              })
            }
            style={{
              marginTop: "28px",
              width: "100%",
              padding: "13px 20px",
              borderRadius: "10px",
              border: "none",
              background:
                "linear-gradient(to right, #9333ea, #8b5cf6)",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // ERROR
  // ========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090b",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          textAlign: "center",
          background: "#111116",
          border: "1px solid #27272a",
          borderRadius: "16px",
          padding: "40px",
        }}
      >
        <h2>GitHub Connection Failed</h2>

        <p
          style={{
            color: "#a1a1aa",
            marginTop: "12px",
          }}
        >
          We couldn't complete the GitHub connection.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/dashboard", {
              replace: true,
            })
          }
          style={{
            marginTop: "24px",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default GitHubConnectCallback;