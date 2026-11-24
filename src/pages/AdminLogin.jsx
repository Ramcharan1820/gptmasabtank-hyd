import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  ShieldCheck,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Clock,
  UserPlus,
} from "lucide-react";

import "./AdminLogin.css";
import API_BASE_URL, { setAdminToken } from "../apiConfig";

const API_URL = API_BASE_URL;

function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Accept email or username
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  // Check URL error parameter
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorParam);
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    const returnUrl = encodeURIComponent(window.location.origin);
    window.location.href = `${API_URL}/api/auth/google?intent=admin_login&return_to=${returnUrl}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsPending(false);

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier || !password) {
      setError("Please enter your email or username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          identifier: cleanIdentifier,
          password: password,
        }),
      });

      const responseText = await response.text();
      let data = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Invalid backend response:", responseText);
          throw new Error("Invalid response from server. Please check your backend.");
        }
      }

      if (!response.ok) {
        if (data.status === "pending") {
          setIsPending(true);
        }
        throw new Error(
          data.message || `Login failed. Server returned ${response.status}.`
        );
      }

      if (!data.success) {
        throw new Error(data.message || "Invalid credentials.");
      }

      console.log("Admin login successful.");

      if (data.token) {
        setAdminToken(data.token);
      }
      if (data.admin) {
        try {
          localStorage.setItem("admin_user", JSON.stringify(data.admin));
        } catch (_) {}
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.error("Admin login error:", err);

      if (err instanceof TypeError) {
        setError(
          "Cannot connect to the backend. Make sure the server is running on port 5000."
        );
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Back to Home */}
        <Link to="/" className="admin-login-back">
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </Link>

        {/* Login Icon */}
        <div className="admin-login-icon">
          <ShieldCheck size={34} />
        </div>

        {/* Heading */}
        <p className="admin-login-label">SECURE ADMINISTRATION</p>
        <h1>Admin Sign In</h1>
        <p className="admin-login-description">
          Government Polytechnic College Masab Tank
        </p>

        {/* Pending Approval Notice */}
        {isPending && (
          <div className="admin-login-pending-alert">
            <div>
              <Clock size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
              <strong>Account Pending Approval</strong>
            </div>
            <div>
              Your administrator registration has been received and is awaiting verification by
              the Main Administrator.
            </div>
            <Link to={`/admin/register?tab=status&email=${encodeURIComponent(identifier)}`}>
              Track Approval Status &rarr;
            </Link>
          </div>
        )}

        {/* Google OAuth Button */}
        <div style={{ marginTop: "18px" }}>
          <button
            type="button"
            className="admin-login-oauth-btn"
            onClick={handleGoogleLogin}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google as Admin</span>
          </button>
        </div>

        <div className="admin-login-divider">
          <span>or sign in with credentials</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email or Username */}
          <div className="admin-login-field">
            <label htmlFor="admin-identifier">Email Address or Username</label>
            <div className="admin-login-input-wrapper">
              <Mail size={18} />
              <input
                id="admin-identifier"
                type="text"
                placeholder="admin@college.edu or username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="admin-login-field">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-login-input-wrapper">
              <Lock size={18} />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="admin-login-forgot">
            <Link to="/admin/forgot-password">Forgot your password?</Link>
          </div>

          {/* Error Message */}
          {error && !isPending && (
            <div className="admin-login-error" role="alert">
              <div>{error}</div>
              {error.toLowerCase().includes("registration request") && (
                <div style={{ marginTop: "8px" }}>
                  <Link
                    to="/admin/register"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#620509",
                      fontWeight: 700,
                      textDecoration: "underline",
                    }}
                  >
                    Go to Admin Registration Page &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="admin-login-spinner" />
                Signing In...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Sign In Securely
              </>
            )}
          </button>
        </form>

        {/* Register Prompt */}
        <div className="admin-login-register-prompt">
          Need administrator access?
          <Link to="/admin/register">Register as an Admin</Link>
        </div>

        {/* Footer */}
        <div className="admin-login-footer">
          <Lock size={14} />
          <span>Authorized administrators only &bull; Masab Tank Polytechnic</span>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
