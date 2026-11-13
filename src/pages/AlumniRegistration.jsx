
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import "./AlumniRegistration.css";
import API_BASE_URL from "../apiConfig";

const departments = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Automobile Engineering",
  "Pharmacy",
];

function AlumniRegistration() {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const googleName = queryParams.get("name") || "";
  const googleEmail = queryParams.get("email") || "";
  const queryAuthMethod = queryParams.get("authMethod") || "";

  const stateEmail = location.state?.email || "";
  const stateName = location.state?.name || "";
  const stateAuthMethod = location.state?.authMethod || "";

  const authenticatedEmail = googleEmail || stateEmail;
  const authenticatedName = googleName || stateName;

  const authMethod =
    queryAuthMethod || stateAuthMethod || "Email";

  const displayAuthMethod =
    authMethod.toLowerCase() === "google"
      ? "Google"
      : authMethod.toLowerCase() === "linkedin"
      ? "LinkedIn"
      : "Email";

  const [formData, setFormData] = useState({
    fullName: authenticatedName,
    department: "",
    alumniStatus: "Alumni",
    graduationYear: "",
    pin: "",
    organization: "",
    email: authenticatedEmail,
    phone: "",
  });

  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [informationConfirmed, setInformationConfirmed] =
    useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [registrationId, setRegistrationId] = useState(null);

  useEffect(() => {
    setFormData((previousData) => ({
      ...previousData,
      fullName: authenticatedName || previousData.fullName,
      email: authenticatedEmail || previousData.email,
    }));
  }, [authenticatedName, authenticatedEmail]);

  const currentYear = new Date().getFullYear();

  const graduationYears = Array.from(
    { length: currentYear - 1980 + 1 },
    (_, index) => currentYear - index
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setRegistrationError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    if (!privacyAccepted || !informationConfirmed) {
      setRegistrationError(
        "Please accept both confirmation checkboxes."
      );
      return;
    }

    if (!formData.fullName.trim()) {
      setRegistrationError("Please enter your full name.");
      return;
    }

    if (!formData.department) {
      setRegistrationError("Please select your department.");
      return;
    }

    if (!formData.graduationYear) {
      setRegistrationError("Please select your graduation year.");
      return;
    }

    if (!formData.email.trim()) {
      setRegistrationError("Please enter your email address.");
      return;
    }

    if (!formData.phone.trim()) {
      setRegistrationError("Please enter your phone number.");
      return;
    }

    setIsSaving(true);
    setRegistrationError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/alumni/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            department: formData.department,
            alumniStatus: formData.alumniStatus,
            graduationYear: Number(formData.graduationYear),
            pin: formData.pin.trim(),
            organization: formData.organization.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            authenticationMethod: displayAuthMethod,
            privacyAccepted,
            informationConfirmed,
          }),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success !== true) {
        throw new Error(
          result?.message ||
            `Registration failed (HTTP ${response.status}).`
        );
      }

      // Your backend returns the ID inside result.data.id.
      setRegistrationId(result.data?.id ?? null);
      setSubmitted(true);
    } catch (error) {
      console.error("Alumni registration error:", error);

      if (error instanceof TypeError) {
        setRegistrationError(
          "Cannot connect to the college server. Please try again later."
        );
      } else {
        setRegistrationError(
          error.message || "Unable to save your registration."
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (submitted) {
    return (
      <main className="alumni-registration-page">
        <div className="alumni-registration-wrapper">
          <div className="alumni-registration-success">
            <div className="success-icon">
              <CheckCircle2 size={58} />
            </div>

            <h1>Registration Submitted</h1>

            <p>
              Thank you for joining the Government Polytechnic
              College Masab Tank Alumni Network.
            </p>

            <p className="success-secondary">
              Your registration has been saved successfully
              to the college database.
            </p>

            {registrationId !== null && (
              <p>
                Registration ID: <strong>{registrationId}</strong>
              </p>
            )}

            <Link to="/alumni" className="success-back-button">
              Back to Alumni
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="alumni-registration-page">
      <div className="alumni-registration-wrapper">
        <div className="registration-topbar">
          <Link to="/alumni" className="registration-back-link">
            <ArrowLeft size={18} />
            Back to Alumni
          </Link>
        </div>

        <header className="registration-heading">
          <span className="registration-eyebrow">
            ALUMNI NETWORK
          </span>

          <h1>Complete Your Alumni Profile</h1>

          <p>
            Tell us about yourself so we can connect you with
            the Government Polytechnic College Masab Tank
            alumni community.
          </p>
        </header>

        <div className="authentication-status">
          <div className="authentication-status-icon">
            {displayAuthMethod === "Google" ||
            displayAuthMethod === "LinkedIn" ? (
              <ShieldCheck size={21} />
            ) : (
              <LockKeyhole size={21} />
            )}
          </div>

          <div>
            <strong>
              {displayAuthMethod === "Google"
                ? "Google account selected"
                : displayAuthMethod === "LinkedIn"
                ? "LinkedIn account selected"
                : "Email registration"}
            </strong>

            <p>
              {authenticatedEmail
                ? `Registration email: ${authenticatedEmail}`
                : "Enter the email address you want to use for your alumni account."}
            </p>
          </div>
        </div>

        <section className="alumni-registration-card">
          <div className="registration-card-header">
            <div>
              <h2>Alumni Registration</h2>
              <p>
                Fields marked with <span>*</span> are required.
              </p>
            </div>

            <div className="secure-registration">
              <LockKeyhole size={17} />
              Secure Registration
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <section className="registration-section">
              <h3>Personal Information</h3>

              <div className="registration-grid">
                <div className="registration-field">
                  <label htmlFor="fullName">
                    Full Name <span>*</span>
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    maxLength={150}
                    required
                  />
                </div>

                <div className="registration-field">
                  <label htmlFor="department">
                    Department <span>*</span>
                  </label>

                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select your department
                    </option>

                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="registration-field">
                  <label htmlFor="alumniStatus">
                    Alumni Status <span>*</span>
                  </label>

                  <select
                    id="alumniStatus"
                    name="alumniStatus"
                    value={formData.alumniStatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="Alumni">Alumni</option>
                    <option value="Former Student">
                      Former Student
                    </option>
                  </select>
                </div>

                <div className="registration-field">
                  <label htmlFor="graduationYear">
                    Year of Graduation <span>*</span>
                  </label>

                  <select
                    id="graduationYear"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select graduation year
                    </option>

                    {graduationYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="registration-field">
                  <label htmlFor="pin">
                    PIN / Enrollment Number
                  </label>

                  <input
                    id="pin"
                    name="pin"
                    type="text"
                    value={formData.pin}
                    onChange={handleChange}
                    placeholder="Enter your PIN"
                    autoComplete="off"
                    maxLength={50}
                  />
                </div>

                <div className="registration-field">
                  <label htmlFor="organization">
                    Current Organization
                  </label>

                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Company / Organization"
                    autoComplete="organization"
                    maxLength={200}
                  />
                </div>
              </div>
            </section>

            <section className="registration-section">
              <h3>Contact Information</h3>

              <div className="registration-grid">
                <div className="registration-field">
                  <label htmlFor="email">
                    Email Address <span>*</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    maxLength={255}
                    readOnly={Boolean(authenticatedEmail)}
                    required
                  />

                  {authenticatedEmail && (
                    <small className="verified-email">
                      ✓ Email supplied from {displayAuthMethod} signup
                    </small>
                  )}
                </div>

                <div className="registration-field">
                  <label htmlFor="phone">
                    Phone Number <span>*</span>
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    maxLength={20}
                    required
                  />
                </div>
              </div>
            </section>

            <div className="registration-consent">
              <label className="consent-row">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(event) => {
                    setPrivacyAccepted(event.target.checked);
                    setRegistrationError("");
                  }}
                  required
                />

                <span>
                  I agree to the alumni network privacy policy
                  and allow the college to use my information
                  for alumni communication.
                </span>
              </label>

              <label className="consent-row">
                <input
                  type="checkbox"
                  checked={informationConfirmed}
                  onChange={(event) => {
                    setInformationConfirmed(event.target.checked);
                    setRegistrationError("");
                  }}
                  required
                />

                <span>
                  I confirm that the information provided above
                  is accurate to the best of my knowledge.
                </span>
              </label>
            </div>

            {registrationError && (
              <p
                className="registration-error"
                role="alert"
                aria-live="polite"
              >
                {registrationError}
              </p>
            )}

            <div className="registration-submit-area">
              <p>
                Please check your information before submitting.
              </p>

              <button
                type="submit"
                className="registration-submit-button"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving Registration..."
                  : "Join Alumni Network"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default AlumniRegistration;

