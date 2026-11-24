import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, KeyRound, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import API_BASE_URL from "../apiConfig";
import "./AdminForgotPassword.css";

export default function AdminForgotPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (token && password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    if (token && (password.length < 12 || password.length > 72)) {
      setError("Choose a password between 12 and 72 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/${token ? "reset-password" : "forgot-password"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(
            token ? { token, password } : { email: email.trim() }
          ),
        }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to process your request.");
      }

      if (token) {
        setCompleted(true);
        setMessage(data.message);
      } else {
        setMessage(data.message);
      }
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Unable to connect to the server. Please try again later."
          : requestError.message || "Unable to process your request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card admin-reset-card">
        <Link to="/admin/login" className="admin-login-back">
          <ArrowLeft size={18} />
          <span>Back to Admin Sign In</span>
        </Link>

        <div className="admin-login-icon">
          {token ? <KeyRound size={32} /> : <ShieldCheck size={34} />}
        </div>
        <p className="admin-login-label">SECURE ADMINISTRATION</p>
        <h1>{token ? "Set a New Password" : "Forgot Password?"}</h1>
        <p className="admin-login-description">
          {token
            ? "Choose a strong password to restore access to your administrator account."
            : "Enter the email address associated with your administrator account."}
        </p>

        {error && (
          <div className="admin-login-error" role="alert">
            {error}
          </div>
        )}
        {message && (
          <div className="admin-reset-success" role="status" aria-live="polite">
            {message}
          </div>
        )}

        {!completed && (
          <form onSubmit={handleSubmit}>
            {!token ? (
              <div className="admin-login-field">
                <label htmlFor="admin-reset-email">Administrator email</label>
                <div className="admin-login-input-wrapper">
                  <Mail size={18} />
                  <input
                    id="admin-reset-email"
                    type="email"
                    autoComplete="email"
                    maxLength={255}
                    placeholder="name@college.edu"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="admin-login-field">
                  <label htmlFor="admin-new-password">New password</label>
                  <div className="admin-login-input-wrapper">
                    <Lock size={18} />
                    <input
                      id="admin-new-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={12}
                      maxLength={72}
                      placeholder="At least 12 characters"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="admin-login-field">
                  <label htmlFor="admin-confirm-password">Confirm new password</label>
                  <div className="admin-login-input-wrapper">
                    <Lock size={18} />
                    <input
                      id="admin-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={12}
                      maxLength={72}
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="admin-login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="admin-login-spinner" />
                  Processing...
                </>
              ) : token ? (
                "Update Password"
              ) : (
                "Send Reset Instructions"
              )}
            </button>
          </form>
        )}

        {completed && (
          <Link to="/admin/login" className="admin-login-submit admin-reset-login-link">
            Return to Admin Sign In
          </Link>
        )}

        <p className="admin-reset-note">
          Reset links expire after 30 minutes and can only be used once.
        </p>
      </section>
    </main>
  );
}
