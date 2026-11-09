
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplets, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Droplets size={26} />
        <span>Sweety<span>.</span></span>
      </div>

      <div className="auth-card">
        <div className="auth-icon">
          <Lock size={24} />
        </div>

        <span className="auth-eyebrow">WELCOME BACK</span>
        <h1>Login to your account</h1>
        <p>Continue your personal glucose tracking journey.</p>

        <form onSubmit={handleSubmit}>
          <label>Email address</label>

          <div className="auth-input">
            <Mail size={17} />
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          <label>Password</label>

          <div className="auth-input">
            <Lock size={17} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?
          <Link to="/register"> Create account</Link>
        </div>
      </div>

      <div className="auth-footer">
        © 2026 Sweety Glucose Tracker · Your health matters.
      </div>
    </div>
  );
}
