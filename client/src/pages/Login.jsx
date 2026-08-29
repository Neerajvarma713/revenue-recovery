import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function Login() {
  const [email, setEmail] = useState("analyst@demo.local");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/demo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (!data.token) {
        throw new Error("No authentication token received");
      }

      localStorage.setItem("rr_token", data.token);

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Unable to connect to the server. Make sure the backend is running on port 4000."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f1eee6",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          border: "1px solid #d8d5cc",
          padding: "40px",
          boxShadow: "0 12px 35px rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              background: "#193532",
              color: "#f1eee6",
              display: "grid",
              placeItems: "center",
              fontSize: "20px",
              fontFamily: "serif",
            }}
          >
            R
          </div>

          <div>
            <div
              style={{
                fontFamily: "serif",
                fontSize: "24px",
                color: "#193532",
              }}
            >
              Recovery
            </div>

            <div
              style={{
                fontSize: "9px",
                letterSpacing: "0.18em",
                color: "#77766f",
                marginTop: "3px",
              }}
            >
              REVENUE DESK
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1
          style={{
            margin: "0 0 8px",
            fontFamily: "serif",
            fontSize: "30px",
            fontWeight: "500",
            color: "#202421",
          }}
        >
          Sign in
        </h1>

        <p
          style={{
            margin: "0 0 28px",
            color: "#77766f",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          Sign in to access the revenue recovery dashboard.
        </p>

        {/* Login form */}
        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "12px",
              fontWeight: "600",
              color: "#333733",
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="analyst@demo.local"
            required
            disabled={loading}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 13px",
              border: "1px solid #cfcfc7",
              background: "#faf9f5",
              color: "#202421",
              fontSize: "14px",
              outline: "none",
              marginBottom: "16px",
            }}
          />

          {error && (
            <div
              style={{
                padding: "11px 12px",
                marginBottom: "16px",
                background: "#f8e8e5",
                border: "1px solid #e4c2bd",
                color: "#8b332a",
                fontSize: "12px",
                lineHeight: "1.5",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              background: loading ? "#64736f" : "#193532",
              color: "#ffffff",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Demo information */}
        <div
          style={{
            marginTop: "24px",
            paddingTop: "18px",
            borderTop: "1px solid #e0ded7",
            fontSize: "11px",
            color: "#77766f",
            lineHeight: "1.6",
          }}
        >
          Demo access is enabled for this workspace.
        </div>
      </div>
    </div>
  );
}