
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplets, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      await register(form);
      navigate("/login", {
        state: { message: "Account created successfully. Please log in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed"
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
        <div className="auth-icon"><User size={24} /></div>

        <span className="auth-eyebrow">GET STARTED</span>
        <h1>Create your account</h1>
        <p>Start tracking your glucose measurements with Sweety.</p>

        <form onSubmit={handleSubmit}>
          <label>Full name</label>
          <div className="auth-input">
            <User size={17} />
            <input
              type="text"
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <label>Email address</label>
          <div className="auth-input">
            <Mail size={17} />
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <label>Password</label>
          <div className="auth-input">
            <Lock size={17} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>

      <div className="auth-footer">
        © 2026 Sweety Glucose Tracker · Your health matters.
      </div>
    </div>
  );
}
