import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Mail,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import "./AlumniAuth.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function AlumniAuth() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleEmailContinue = (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError("");

    navigate("/alumni/register/form", {
      state: {
        email: trimmedEmail,
        authMethod: "email",
      },
    });
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const handleLinkedInLogin = () => {
    alert(
      "LinkedIn login will be connected after Google Login is completed."
    );
  };

  return (
    <main className="alumni-auth-page">
      <div className="alumni-auth-container">
        <div className="alumni-auth-card">

          {/* LEFT SIDE */}
          <section className="alumni-auth-brand">
            <div className="alumni-auth-logo">
              <div className="alumni-logo-circle">
                <GraduationCap size={40} strokeWidth={1.8} />
              </div>
            </div>

            <h1>
              Government Polytechnic College
              <span>Masab Tank</span>
            </h1>

            <h2>Alumni Network</h2>

            <p>
              Reconnect with your college community, stay connected
              with fellow alumni, and be part of the growing
              Government Polytechnic College Masab Tank alumni
              network.
            </p>

            <div className="alumni-auth-security">
              <ShieldCheck size={20} />

              <div>
                <strong>Secure Registration</strong>
                <span>
                  Your information is handled securely and used only
                  for the alumni network.
                </span>
              </div>
            </div>
          </section>

          {/* RIGHT SIDE */}
          <section className="alumni-auth-form-section">
            <div className="alumni-auth-form-content">

              <div className="alumni-auth-heading">
                <span className="alumni-auth-label">
                  ALUMNI NETWORK
                </span>

                <h2>Signup / Login</h2>

                <p className="alumni-auth-subtitle">
                  Choose any one of the following to Signup / Login
                </p>
              </div>

              {/* GOOGLE */}
              <button
                type="button"
                className="alumni-auth-provider google"
                onClick={handleGoogleLogin}
              >
                <span className="alumni-auth-provider-icon google-icon">
                  G
                </span>

                <span className="provider-text">
                  Continue with Google
                </span>

                <ArrowRight size={18} />
              </button>

              {/* LINKEDIN */}
              <button
                type="button"
                className="alumni-auth-provider linkedin"
                onClick={handleLinkedInLogin}
              >
                <span className="alumni-auth-provider-icon linkedin-icon">
                  in
                </span>

                <span className="provider-text">
                  Continue with LinkedIn
                </span>

                <ArrowRight size={18} />
              </button>

              {/* DIVIDER */}
              <div className="alumni-auth-divider">
                <span className="divider-line"></span>
                <div className="divider-circle">OR</div>
                <span className="divider-line"></span>
              </div>

              {/* EMAIL */}
              <form
                className="alumni-auth-email-form"
                onSubmit={handleEmailContinue}
              >
                <label htmlFor="alumni-email">
                  Continue with Email
                </label>

                <div
                  className={`alumni-auth-email-input ${
                    emailError ? "has-error" : ""
                  }`}
                >
                  <Mail size={19} />

                  <input
                    id="alumni-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setEmailError("");
                    }}
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />

                  <button
                    type="submit"
                    className="alumni-auth-email-submit"
                    aria-label="Continue with email"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>

                {emailError && (
                  <p className="alumni-auth-error">
                    {emailError}
                  </p>
                )}
              </form>

              <p className="alumni-auth-note">
                By continuing, you agree to participate in the
                Government Polytechnic College Masab Tank Alumni
                Network.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default AlumniAuth;