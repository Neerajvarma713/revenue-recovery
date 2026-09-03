import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const isSignup = mode === "signup";

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = isSignup
        ? await api.signup({ name, email, password })
        : await api.login({ email, password });

      localStorage.setItem("rr_token", data.token);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(`${isSignup ? "Sign up" : "Login"} failed:`, err);
      setError(err.message || `Unable to ${isSignup ? "sign up" : "sign in"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen paper flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md border line bg-white/60 p-8 shadow-soft">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#193532] text-[#f1eee6] grid place-items-center serif text-xl">R</div>
          <div>
            <h1 className="serif text-2xl">Revenue Recovery</h1>
            <div className="mono text-[9px] muted tracking-[.18em]">REVENUE DESK</div>
          </div>
        </div>

        <div className="flex border-b line mb-7">
          <button type="button" onClick={() => switchMode("login")} className={`auth-tab ${!isSignup ? "auth-tab-active" : ""}`}>
            Sign in
          </button>
          <button type="button" onClick={() => switchMode("signup")} className={`auth-tab ${isSignup ? "auth-tab-active" : ""}`}>
            Sign up
          </button>
        </div>

        <p className="muted text-sm mb-7">
          {isSignup ? "Create an account to access the recovery dashboard." : "Sign in to access the recovery dashboard."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <div>
              <label className="field-label" htmlFor="signup-name">Name</label>
              <input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className="field-input" />
            </div>
          )}
          <div>
            <label className="field-label" htmlFor="auth-email">Email</label>
            <input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="auth-password">Password <span className="field-suffix">{isSignup ? "8+ characters" : ""}</span></label>
            <input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete={isSignup ? "new-password" : "current-password"} minLength={isSignup ? 8 : undefined} required className="field-input" />
          </div>

          {error && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>}

          <button type="submit" disabled={loading} className="w-full bg-[#193532] text-[#f1eee6] py-3 text-sm disabled:opacity-60 hover:bg-[#28504a] transition-colors">
            {loading ? (isSignup ? "Creating account..." : "Signing in...") : (isSignup ? "Create account" : "Sign in")}
          </button>
        </form>
      </div>
    </div>
  );
}
