
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import "./AdminLogin.css";

const API_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Please enter your email address and password.");
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
          email: trimmedEmail,
          password: password,
        }),
      });

      // Read response safely
      const responseText = await response.text();

      let data = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Invalid backend response:", responseText);

          throw new Error(
            "Invalid response from server. Please check your backend."
          );
        }
      }

      // Handle HTTP errors
      if (!response.ok) {
        throw new Error(
          data.message ||
            `Login failed. Server returned ${response.status}.`
        );
      }

      // Handle unsuccessful login
      if (!data.success) {
        throw new Error(
          data.message || "Invalid email address or password."
        );
      }

      console.log("Admin login successful.");

      // Navigate to dashboard
      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (err) {
      console.error("Admin login error:", err);

      if (err instanceof TypeError) {
        setError(
          "Cannot connect to the backend. Make sure the server is running on port 5000."
        );
      } else {
        setError(
          err.message || "Something went wrong. Please try again."
        );
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
        <p className="admin-login-label">
          SECURE ADMINISTRATION
        </p>

        <h1>Admin Login</h1>

        <p className="admin-login-description">
          Government Polytechnic College Masab Tank
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="admin-login-field">
            <label htmlFor="admin-email">
              Email Address
            </label>

            <div className="admin-login-input-wrapper">
              <Mail size={18} />

              <input
                id="admin-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="admin-login-field">
            <label htmlFor="admin-password">
              Password
            </label>

            <div className="admin-login-input-wrapper">
              <Lock size={18} />

              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="admin-login-error"
              role="alert"
            >
              {error}
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
                <Loader2
                  size={18}
                  className="admin-login-spinner"
                />

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

        {/* Footer */}
        <div className="admin-login-footer">
          <Lock size={14} />

          <span>
            Authorized administrators only
          </span>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;
