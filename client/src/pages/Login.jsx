import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState(
    "analyst@demo.local"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await api.demo(email);

      localStorage.setItem(
        "rr_token",
        data.token
      );

      navigate("/", {
        replace: true,
      });

    } catch (err) {
      console.error("Login failed:", err);

      setError(
        err.message || "Unable to sign in"
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen paper flex items-center justify-center px-4">

      <div className="w-full max-w-md border line bg-white/60 p-8">

        <div className="flex items-center gap-3 mb-8">

          <div className="w-10 h-10 bg-[#193532] text-[#f1eee6] grid place-items-center serif text-xl">
            R
          </div>

          <div>
            <h1 className="serif text-2xl">
              Revenue Recovery
            </h1>

            <div className="mono text-[9px] muted tracking-[.18em]">
              REVENUE DESK
            </div>
          </div>

        </div>

        <p className="muted text-sm mb-7">
          Sign in to access the recovery dashboard.
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>
            <label className="block mono text-[10px] muted mb-2">
              EMAIL
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="analyst@demo.local"
              required
              className="w-full bg-white border line px-4 py-3 outline-none text-sm"
            />
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#193532] text-[#f1eee6] py-3 text-sm disabled:opacity-60"
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>

        </form>

      </div>
    </div>
  );
}