import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Briefcase,
  Phone,
  FileText,
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";
import API_BASE_URL from "../apiConfig";
import "./AdminRegister.css";

const DEPARTMENTS = [
  "Computer Science & Engineering (CSE)",
  "Electronics & Communication Engineering (ECE)",
  "Electrical & Electronics Engineering (EEE)",
  "Mechanical Engineering",
  "Civil Engineering",
  "Automobile Engineering",
  "Pharmacy",
  "Examination Section / Cell",
  "Principal / Head Office",
  "Academic & Student Affairs",
  "Training & Placement Cell",
  "General Science & Humanities",
  "Library & Information Center",
  "IT & Systems Administration",
];

const DESIGNATIONS = [
  "Head of Department (HOD)",
  "Senior Lecturer",
  "Lecturer",
  "Examination In-Charge / Coordinator",
  "Placement Officer",
  "Office Superintendent",
  "Administrative Officer",
  "System Administrator / Lab Assistant",
  "Academic Coordinator",
];

export default function AdminRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode: "register" or "status"
  const [viewMode, setViewMode] = useState("register");

  // Registration Form State
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    designation: "",
    phone: "",
    request_reason: "",
    agreeTerms: true,
  });

  // Google OAuth prefilled info (if returning from OAuth)
  const [googleProfile, setGoogleProfile] = useState(null);

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Request & Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Post-submission / status check view
  const [submittedRecord, setSubmittedRecord] = useState(null);

  // Status Search tab state
  const [statusIdentifier, setStatusIdentifier] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  // Parse URL Parameters on mount
  useEffect(() => {
    const oauth = searchParams.get("oauth");
    const emailParam = searchParams.get("email");
    const nameParam = searchParams.get("name");
    const avatarParam = searchParams.get("avatar");
    const subParam = searchParams.get("sub");
    const statusParam = searchParams.get("status");
    const reasonParam = searchParams.get("reason");
    const tabParam = searchParams.get("tab");

    if (tabParam === "status") {
      setViewMode("status");
    }

    if (oauth === "google" && emailParam) {
      const gProfile = {
        email: emailParam,
        name: nameParam || "",
        avatar: avatarParam || "",
        sub: subParam || "",
      };
      setGoogleProfile(gProfile);

      // Auto-suggest a username from email or name
      const suggestedUsername = (emailParam.split("@")[0] || "")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .slice(0, 20);

      setFormData((prev) => ({
        ...prev,
        email: emailParam,
        name: nameParam || prev.name,
        username: prev.username || suggestedUsername,
      }));
    }

    if (statusParam === "pending") {
      setSubmittedRecord({
        name: nameParam || "Administrator Applicant",
        email: emailParam || "Your Email",
        status: "pending",
        message: "Your administrator registration is currently pending review by the Main Administrator.",
      });
    } else if (statusParam === "rejected") {
      setSubmittedRecord({
        email: emailParam || "Your Email",
        status: "rejected",
        rejection_reason: reasonParam || "Your application was declined by the Main Administrator.",
      });
    }
  }, [searchParams]);

  // Password Strength Calculator
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: "None", colorClass: "" };

    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: "Weak", colorClass: "weak" };
    if (score === 3) return { score: 2, label: "Fair", colorClass: "fair" };
    if (score === 4) return { score: 3, label: "Good", colorClass: "good" };
    return { score: 4, label: "Strong", colorClass: "strong" };
  }, [formData.password]);

  // Handle Field Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    // Sanitize username
    if (name === "username") {
      finalValue = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
    setError("");
  };

  // Google OAuth Initiation
  const handleGoogleOAuth = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google?intent=admin_register`;
  };

  // Handle Registration Form Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validations
    if (!formData.name.trim()) {
      setError("Please provide your full legal or official name.");
      return;
    }

    if (!formData.username.trim() || formData.username.length < 3) {
      setError("Username must be at least 3 characters long (letters, numbers, underscores).");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please provide your official college or institutional email address.");
      return;
    }

    // If local registration, validate password
    if (!googleProfile) {
      if (!formData.password) {
        setError("Please enter a secure password.");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Password and confirmation password do not match.");
        return;
      }
    }

    if (!formData.department) {
      setError("Please select your college Department or Administrative Section.");
      return;
    }

    if (!formData.agreeTerms) {
      setError("You must acknowledge compliance with the College Administrative Policy.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password || null,
        department: formData.department,
        designation: formData.designation.trim() || null,
        phone: formData.phone.trim() || null,
        request_reason: formData.request_reason.trim() || null,
        auth_provider: googleProfile ? "google" : "local",
        auth_provider_id: googleProfile ? googleProfile.sub : null,
        avatar_url: googleProfile ? googleProfile.avatar : null,
      };

      const res = await fetch(`${API_BASE_URL}/api/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit registration request.");
      }

      setSubmittedRecord({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        department: formData.department,
        status: "pending",
        message: data.message,
      });
      setSuccess(data.message);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong while submitting your registration.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Tracking Status Check
  const handleCheckStatus = async (e) => {
    if (e) e.preventDefault();
    setStatusError("");
    setStatusResult(null);

    const query = statusIdentifier.trim();
    if (!query) {
      setStatusError("Please enter your registered email address or username.");
      return;
    }

    setStatusLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/check-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: query }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not find registration record.");
      }

      setStatusResult(data.admin);
    } catch (err) {
      console.error("Status check error:", err);
      setStatusError(err.message || "Failed to check registration status.");
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="admin-reg-page">
      <div className="admin-reg-container">
        <div className="admin-reg-card">
          {/* Top navigation */}
          <div className="admin-reg-topbar">
            <Link to="/admin/login" className="admin-reg-back-link">
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>

            <span className="admin-reg-mode-badge">
              <ShieldCheck size={14} />
              College Admin Portal
            </span>
          </div>

          {/* Submitted / Status View */}
          {submittedRecord ? (
            <div className="admin-status-card">
              <div className={`admin-status-icon-box ${submittedRecord.status}`}>
                {submittedRecord.status === "pending" && <Clock size={36} />}
                {submittedRecord.status === "approved" && <CheckCircle2 size={36} />}
                {submittedRecord.status === "rejected" && <XCircle size={36} />}
              </div>

              <h2>
                {submittedRecord.status === "pending" && "Application Awaiting Approval"}
                {submittedRecord.status === "approved" && "Administrator Account Approved!"}
                {submittedRecord.status === "rejected" && "Application Declined"}
              </h2>

              <p className="admin-status-desc">
                {submittedRecord.status === "pending" && (
                  <>
                    Your administrator registration has been queued for verification. The{" "}
                    <strong>Main Administrator</strong> reviews all incoming requests to ensure
                    authorized access to campus systems.
                  </>
                )}
                {submittedRecord.status === "approved" && (
                  <>
                    Congratulations! Your administrator account has been approved by the Main
                    Administrator. You now have full access to manage notices, events, and college records.
                  </>
                )}
                {submittedRecord.status === "rejected" && (
                  <>
                    {submittedRecord.rejection_reason ||
                      "Your request for administrative privileges was reviewed and declined by the Main Administrator."}
                  </>
                )}
              </p>

              <div className="admin-status-details-grid">
                {submittedRecord.name && (
                  <div className="admin-status-detail-item">
                    <span>Applicant Name</span>
                    <strong>{submittedRecord.name}</strong>
                  </div>
                )}
                {submittedRecord.username && (
                  <div className="admin-status-detail-item">
                    <span>Username</span>
                    <strong>@{submittedRecord.username}</strong>
                  </div>
                )}
                <div className="admin-status-detail-item">
                  <span>Registered Email</span>
                  <strong>{submittedRecord.email}</strong>
                </div>
                {submittedRecord.department && (
                  <div className="admin-status-detail-item">
                    <span>Department / Unit</span>
                    <strong>{submittedRecord.department}</strong>
                  </div>
                )}
                <div className="admin-status-detail-item">
                  <span>Current Status</span>
                  <span className={`admin-status-badge ${submittedRecord.status}`}>
                    {submittedRecord.status}
                  </span>
                </div>
              </div>

              <div className="admin-status-actions">
                {submittedRecord.status === "approved" ? (
                  <Link to="/admin/login" className="admin-action-btn-primary">
                    <ShieldCheck size={18} />
                    Proceed to Admin Sign In
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      className="admin-action-btn-primary"
                      onClick={() => {
                        setStatusIdentifier(submittedRecord.email || submittedRecord.username || "");
                        setViewMode("status");
                        setSubmittedRecord(null);
                      }}
                    >
                      <RefreshCw size={16} />
                      Refresh / Track Status
                    </button>

                    <Link to="/admin/login" className="admin-action-btn-secondary">
                      Return to Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="admin-reg-header">
                <div className="admin-reg-icon-wrapper">
                  <ShieldCheck size={32} />
                </div>
                <h1>Administrator Registration</h1>
                <p>Government Polytechnic College Masab Tank, Hyderabad</p>
              </div>

              {/* Mode Switching Tabs */}
              <div className="admin-reg-tabs">
                <button
                  type="button"
                  className={`admin-reg-tab-btn ${viewMode === "register" ? "active" : ""}`}
                  onClick={() => {
                    setViewMode("register");
                    setError("");
                  }}
                >
                  <User size={16} />
                  <span>Register Account</span>
                </button>

                <button
                  type="button"
                  className={`admin-reg-tab-btn ${viewMode === "status" ? "active" : ""}`}
                  onClick={() => {
                    setViewMode("status");
                    setError("");
                  }}
                >
                  <Search size={16} />
                  <span>Check Approval Status</span>
                </button>
              </div>

              {/* VIEW: REGISTER */}
              {viewMode === "register" && (
                <>
                  {/* Approval Protocol Notice */}
                  <div className="admin-reg-approval-banner">
                    <AlertTriangle size={20} />
                    <div>
                      <strong>Approval Workflow Protocol:</strong>
                      <div>
                        To protect institutional data, new administrator registrations are submitted in{" "}
                        <strong>Pending Status</strong>. Access is activated only after verification and
                        approval by the <strong>Main Administrator</strong>.
                      </div>
                    </div>
                  </div>

                  {/* Google OAuth Section */}
                  {!googleProfile ? (
                    <div className="admin-reg-oauth-section">
                      <button
                        type="button"
                        className="admin-google-btn"
                        onClick={handleGoogleOAuth}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24">
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

                      <div className="admin-reg-divider">
                        <span>or register with email & credentials</span>
                      </div>
                    </div>
                  ) : (
                    /* Verified Google Profile Badge */
                    <div className="admin-verified-profile-card">
                      {googleProfile.avatar ? (
                        <img
                          src={googleProfile.avatar}
                          alt="Google Profile"
                          className="admin-verified-avatar"
                        />
                      ) : (
                        <div className="admin-verified-avatar-fallback">
                          {(googleProfile.name || googleProfile.email).charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="admin-verified-info">
                        <div className="admin-verified-name">
                          {googleProfile.name || "Google Authenticated User"}
                          <span className="admin-verified-badge">
                            <CheckCircle2 size={12} /> Google Verified
                          </span>
                        </div>
                        <div className="admin-verified-email">{googleProfile.email}</div>
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleRegisterSubmit} className="admin-reg-form">
                    {/* Error / Success Notifications */}
                    {error && (
                      <div className="admin-alert error">
                        <XCircle size={18} />
                        <span>{error}</span>
                      </div>
                    )}

                    {success && (
                      <div className="admin-alert success">
                        <CheckCircle2 size={18} />
                        <span>{success}</span>
                      </div>
                    )}

                    {/* Row 1: Name and Username */}
                    <div className="admin-form-row">
                      <div className="admin-reg-field">
                        <label htmlFor="reg-name">
                          Full Legal Name *
                        </label>
                        <div className="admin-input-wrapper">
                          <User size={18} className="admin-input-icon" />
                          <input
                            id="reg-name"
                            name="name"
                            type="text"
                            placeholder="e.g. Dr. K. Ramesh"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="admin-reg-input"
                          />
                        </div>
                      </div>

                      <div className="admin-reg-field">
                        <label htmlFor="reg-username">
                          Desired Username *
                          <span className="admin-field-hint">letters, numbers, _</span>
                        </label>
                        <div className="admin-input-wrapper">
                          <AtSign size={18} className="admin-input-icon" />
                          <input
                            id="reg-username"
                            name="username"
                            type="text"
                            placeholder="e.g. ramesh_cse"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            minLength={3}
                            maxLength={30}
                            className="admin-reg-input"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Email and Phone */}
                    <div className="admin-form-row">
                      <div className="admin-reg-field">
                        <label htmlFor="reg-email">
                          College / Official Email *
                        </label>
                        <div className="admin-input-wrapper">
                          <Mail size={18} className="admin-input-icon" />
                          <input
                            id="reg-email"
                            name="email"
                            type="email"
                            placeholder="e.g. ramesh@gptm.ac.in"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={Boolean(googleProfile)}
                            className="admin-reg-input"
                          />
                        </div>
                      </div>

                      <div className="admin-reg-field">
                        <label htmlFor="reg-phone">
                          Phone Number (Optional)
                        </label>
                        <div className="admin-input-wrapper">
                          <Phone size={18} className="admin-input-icon" />
                          <input
                            id="reg-phone"
                            name="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={handleChange}
                            className="admin-reg-input"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Passwords (Required if local, optional if Google) */}
                    {!googleProfile && (
                      <div className="admin-form-row">
                        <div className="admin-reg-field">
                          <label htmlFor="reg-password">
                            Password *
                            <span className="admin-field-hint">min 8 characters</span>
                          </label>
                          <div className="admin-input-wrapper">
                            <Lock size={18} className="admin-input-icon" />
                            <input
                              id="reg-password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create strong password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                              className="admin-reg-input"
                            />
                            <button
                              type="button"
                              className="admin-pw-toggle"
                              onClick={() => setShowPassword((prev) => !prev)}
                              aria-label="Toggle password visibility"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>

                          {/* Password Strength Meter */}
                          {formData.password && (
                            <div className="admin-pw-strength">
                              <div className="admin-pw-bars">
                                {[1, 2, 3, 4].map((level) => (
                                  <div
                                    key={level}
                                    className={`admin-pw-bar ${
                                      passwordStrength.score >= level
                                        ? `active-${passwordStrength.colorClass}`
                                        : ""
                                    }`}
                                  />
                                ))}
                              </div>
                              <span
                                className={`admin-pw-label ${passwordStrength.colorClass}`}
                              >
                                {passwordStrength.label}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="admin-reg-field">
                          <label htmlFor="reg-confirm-password">
                            Confirm Password *
                          </label>
                          <div className="admin-input-wrapper">
                            <Lock size={18} className="admin-input-icon" />
                            <input
                              id="reg-confirm-password"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Repeat password"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                              className="admin-reg-input"
                            />
                            <button
                              type="button"
                              className="admin-pw-toggle"
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                              aria-label="Toggle confirm password visibility"
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {formData.confirmPassword && (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                marginTop: "4px",
                                color:
                                  formData.password === formData.confirmPassword
                                    ? "#10b981"
                                    : "#ef4444",
                              }}
                            >
                              {formData.password === formData.confirmPassword
                                ? "✓ Passwords match"
                                : "✕ Passwords do not match"}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Row 4: Department and Designation */}
                    <div className="admin-form-row">
                      <div className="admin-reg-field">
                        <label htmlFor="reg-department">
                          Department / Section *
                        </label>
                        <div className="admin-input-wrapper">
                          <Building2 size={18} className="admin-input-icon" />
                          <select
                            id="reg-department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                            className="admin-reg-select"
                          >
                            <option value="">-- Select Department --</option>
                            {DEPARTMENTS.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="admin-reg-field">
                        <label htmlFor="reg-designation">
                          Designation / Role Title
                        </label>
                        <div className="admin-input-wrapper">
                          <Briefcase size={18} className="admin-input-icon" />
                          <input
                            id="reg-designation"
                            name="designation"
                            list="designation-options"
                            placeholder="e.g. HOD CSE or Senior Lecturer"
                            value={formData.designation}
                            onChange={handleChange}
                            className="admin-reg-input"
                          />
                          <datalist id="designation-options">
                            {DESIGNATIONS.map((desig) => (
                              <option key={desig} value={desig} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    </div>

                    {/* Row 5: Request Reason */}
                    <div className="admin-reg-field">
                      <label htmlFor="reg-reason">
                        Reason for Admin Access / Responsibilities
                        <span className="admin-field-hint">Reviewed by Main Administrator</span>
                      </label>
                      <textarea
                        id="reg-reason"
                        name="request_reason"
                        placeholder="Please describe your institutional role and responsibilities (e.g. Managing departmental circulars, faculty profiles, or student event media)..."
                        value={formData.request_reason}
                        onChange={handleChange}
                        className="admin-reg-textarea"
                        rows={3}
                      />
                    </div>

                    {/* Terms Checkbox */}
                    <label
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        fontSize: "0.84rem",
                        color: "#94a3b8",
                        cursor: "pointer",
                        lineHeight: 1.45,
                        marginTop: "4px",
                      }}
                    >
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        style={{ marginTop: "3px" }}
                      />
                      <span>
                        I certify that I am an authorized faculty member or staff member of Government
                        Polytechnic College Masab Tank, and understand that account activation is subject
                        to verification by the Main Administrator.
                      </span>
                    </label>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="admin-reg-submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="spin" />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={18} />
                          <span>Submit Request for Administrator Approval</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* VIEW: TRACK STATUS */}
              {viewMode === "status" && (
                <div style={{ padding: "10px 0" }}>
                  <p style={{ color: "#94a3b8", fontSize: "0.92rem", marginBottom: "20px" }}>
                    Already submitted a registration request? Enter your registered email address or
                    username below to view your real-time approval status.
                  </p>

                  <form onSubmit={handleCheckStatus} style={{ marginBottom: "24px" }}>
                    <div className="admin-reg-field">
                      <label htmlFor="status-identifier">Registered Email or Username</label>
                      <div className="admin-input-wrapper">
                        <Search size={18} className="admin-input-icon" />
                        <input
                          id="status-identifier"
                          type="text"
                          placeholder="e.g. ramesh_cse or ramesh@gptm.ac.in"
                          value={statusIdentifier}
                          onChange={(e) => setStatusIdentifier(e.target.value)}
                          className="admin-reg-input"
                          required
                        />
                      </div>
                    </div>

                    {statusError && (
                      <div className="admin-alert error" style={{ marginTop: "14px" }}>
                        <XCircle size={18} />
                        <span>{statusError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="admin-reg-submit"
                      style={{ marginTop: "14px" }}
                      disabled={statusLoading}
                    >
                      {statusLoading ? (
                        <>
                          <Loader2 size={18} className="spin" />
                          <span>Checking System Records...</span>
                        </>
                      ) : (
                        <>
                          <Search size={18} />
                          <span>Look Up Approval Status</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Status Result Display */}
                  {statusResult && (
                    <div className="admin-status-details-grid" style={{ marginTop: "24px" }}>
                      <div className="admin-status-detail-item">
                        <span>Applicant</span>
                        <strong>{statusResult.name}</strong>
                      </div>
                      <div className="admin-status-detail-item">
                        <span>Username</span>
                        <strong>@{statusResult.username || "N/A"}</strong>
                      </div>
                      <div className="admin-status-detail-item">
                        <span>Registered Email</span>
                        <strong>{statusResult.email}</strong>
                      </div>
                      <div className="admin-status-detail-item">
                        <span>Department</span>
                        <strong>{statusResult.department || "General"}</strong>
                      </div>
                      <div className="admin-status-detail-item">
                        <span>Registration Status</span>
                        <span className={`admin-status-badge ${statusResult.status}`}>
                          {statusResult.status}
                        </span>
                      </div>
                      <div className="admin-status-detail-item">
                        <span>Submitted On</span>
                        <strong>
                          {statusResult.created_at
                            ? new Date(statusResult.created_at).toLocaleDateString()
                            : "Recent"}
                        </strong>
                      </div>

                      {statusResult.status === "approved" && (
                        <div
                          style={{
                            gridColumn: "1 / -1",
                            padding: "12px",
                            background: "rgba(16, 185, 129, 0.1)",
                            borderRadius: "8px",
                            border: "1px solid rgba(16, 185, 129, 0.25)",
                            marginTop: "8px",
                          }}
                        >
                          <div style={{ color: "#34d399", fontWeight: "600", marginBottom: "6px" }}>
                            ✓ Account is Approved & Active
                          </div>
                          <Link to="/admin/login" className="admin-action-btn-primary">
                            <ShieldCheck size={16} /> Sign in to Dashboard
                          </Link>
                        </div>
                      )}

                      {statusResult.status === "rejected" && (
                        <div
                          style={{
                            gridColumn: "1 / -1",
                            padding: "12px",
                            background: "rgba(239, 68, 68, 0.1)",
                            borderRadius: "8px",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            marginTop: "8px",
                          }}
                        >
                          <div style={{ color: "#f87171", fontWeight: "600", marginBottom: "4px" }}>
                            Declined by Main Administrator
                          </div>
                          <div style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>
                            Reason: {statusResult.rejection_reason || "Not specified."}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Card Footer */}
              <div className="admin-reg-footer">
                Already an authorized administrator?
                <Link to="/admin/login">Sign In Here</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

