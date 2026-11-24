import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building2,
  ChevronRight,
  GraduationCap,
  Users,
  Award,
  BookOpen,
  CalendarDays,
  UserRound,
  Eye,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Layers,
  Sparkles,
} from "lucide-react";

import API_BASE_URL from "../apiConfig";
import useDepartmentFaculty from "../hooks/useDepartmentFaculty";
import FacultyProfileModal from "../components/FacultyProfileModal";
import ImageWithFallback from "../components/ImageWithFallback";
import "./DynamicDepartment.css";

export default function DynamicDepartment() {
  const { deptCode } = useParams();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const normalizedCode = (deptCode || "").toUpperCase().trim();
  const { faculty: deptFaculty, loading: facultyLoading } = useDepartmentFaculty(
    normalizedCode,
    []
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/api/departments`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load department records.");
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        if (data.success && Array.isArray(data.departments)) {
          const matched = data.departments.find(
            (d) =>
              String(d.department_code || "").toUpperCase().trim() ===
                normalizedCode ||
              String(d.department_name || "")
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "") ===
                (deptCode || "").toLowerCase().replace(/[^a-z0-9]/g, "")
          );

          if (matched) {
            setDepartment(matched);
          } else {
            setError(`Department "${deptCode}" was not found.`);
          }
        } else {
          setError("Unable to load departments list.");
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Failed to fetch department.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [deptCode, normalizedCode]);

  if (loading) {
    return (
      <main className="dynamic-dept-loading">
        <div className="dynamic-dept-spinner" />
        <p>Loading Department Information...</p>
      </main>
    );
  }

  if (error || !department) {
    return (
      <main className="dynamic-dept-not-found">
        <div className="dynamic-dept-not-found-card">
          <Building2 size={64} className="not-found-icon" />
          <h1>Department Not Found</h1>
          <p>
            The department code <code>{deptCode}</code> does not match any
            active academic department at Government Polytechnic College,
            Masab Tank.
          </p>
          <Link to="/departments" className="dynamic-dept-back-btn">
            View All Departments
          </Link>
        </div>
      </main>
    );
  }

  const isHod = (member) => {
    if (!member || !member.designation) return false;
    const desig = member.designation.toLowerCase();
    return (
      desig.includes("hod") ||
      desig.includes("head of section") ||
      desig.includes("head of department") ||
      desig.includes("head of the department")
    );
  };

  const activeHod =
    deptFaculty.find(isHod) ||
    (department.hod_name
      ? {
          name: department.hod_name,
          designation: "Head of Department (HOD)",
          department: department.department_name,
          photo: department.image || "",
          qualification: "Master of Technology / Post Graduate Degree",
          experience: "Senior Technical Education Faculty",
          message: `Welcome to the Department of ${department.department_name}. We are dedicated to providing state-of-the-art technical education, hands-on laboratory rigor, and strong industry orientation.`,
        }
      : null);

  const hodPhotoUrl =
    activeHod?.photo || activeHod?.image || department.image || "";

  return (
    <main className="dynamic-dept-page">
      {/* HERO SECTION */}
      <section className="site-hero dynamic-dept-hero">
        <div className="dynamic-dept-hero-inner">
          <div className="dynamic-dept-hero-content">
            <div className="dynamic-dept-badges-row">
              <span className="dynamic-dept-badge">
                <ShieldCheck size={14} /> SBTET & AICTE Approved
              </span>
              <span className="dynamic-dept-code-pill">
                Code: {department.department_code}
              </span>
            </div>

            <h1>Department of {department.department_name}</h1>
            <p className="dynamic-dept-hero-subtitle">
              Government Polytechnic College, Masab Tank, Hyderabad
            </p>

            <div className="dynamic-dept-breadcrumb">
              <Link to="/">Home</Link>
              <ChevronRight size={14} />
              <Link to="/departments">Departments</Link>
              <ChevronRight size={14} />
              <span className="active">{department.department_code}</span>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS STRIP */}
      <section className="dynamic-dept-stats-strip">
        <div className="dynamic-dept-container dynamic-dept-stats-grid">
          <div className="dynamic-dept-stat-card">
            <div className="stat-icon-wrap">
              <GraduationCap size={24} />
            </div>
            <div className="stat-info">
              <strong>{department.intake || "60"} Seats</strong>
              <span>Annual Intake</span>
            </div>
          </div>

          <div className="dynamic-dept-stat-card">
            <div className="stat-icon-wrap">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <strong>{deptFaculty.length || "Active"} Faculty</strong>
              <span>Faculty Strength</span>
            </div>
          </div>

          <div className="dynamic-dept-stat-card">
            <div className="stat-icon-wrap">
              <CalendarDays size={24} />
            </div>
            <div className="stat-info">
              <strong>3 Years</strong>
              <span>Diploma Curriculum</span>
            </div>
          </div>

          <div className="dynamic-dept-stat-card">
            <div className="stat-icon-wrap">
              <Sparkles size={24} />
            </div>
            <div className="stat-info">
              <strong>Govt. Polytechnic</strong>
              <span>Masab Tank Campus</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT DEPARTMENT */}
      <section className="dynamic-dept-section dynamic-dept-about-section">
        <div className="dynamic-dept-container">
          <div className="dynamic-dept-about-layout">
            <div className="dynamic-dept-about-text">
              <span className="dynamic-dept-section-tag">
                DEPARTMENT OVERVIEW
              </span>
              <h2>
                Excellence in {department.department_name} Education
              </h2>
              <p className="dynamic-dept-lead">
                {department.description ||
                  `The Department of ${department.department_name} at Government Polytechnic College, Masab Tank offers comprehensive practical training, theoretical foundation, and modern industrial curriculum designed to empower future engineers and technical professionals.`}
              </p>

              <div className="dynamic-dept-features-list">
                <div className="feature-item">
                  <CheckCircle2 size={18} className="feature-check" />
                  <div>
                    <h4>Industry-Oriented Curriculum</h4>
                    <p>
                      Aligned with State Board of Technical Education and
                      Training (SBTET) standards and hands-on laboratory
                      sessions.
                    </p>
                  </div>
                </div>

                <div className="feature-item">
                  <CheckCircle2 size={18} className="feature-check" />
                  <div>
                    <h4>Dedicated Laboratory Training</h4>
                    <p>
                      State-of-the-art equipment, practical workstations, and
                      experiential learning setups.
                    </p>
                  </div>
                </div>

                <div className="feature-item">
                  <CheckCircle2 size={18} className="feature-check" />
                  <div>
                    <h4>Placement & Higher Education Pathway</h4>
                    <p>
                      Direct eligibility for campus recruitment and lateral
                      entry into second-year B.Tech / B.E degrees via ECET.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="dynamic-dept-about-sidebar">
              <div className="dynamic-dept-sidebar-card">
                <h3>Department Fast Facts</h3>
                <ul>
                  <li>
                    <span>Department Code</span>
                    <strong>{department.department_code}</strong>
                  </li>
                  <li>
                    <span>Affiliation</span>
                    <strong>SBTET Telangana</strong>
                  </li>
                  <li>
                    <span>Approved By</span>
                    <strong>AICTE, New Delhi</strong>
                  </li>
                  <li>
                    <span>Sanctioned Intake</span>
                    <strong>{department.intake || 60} Students / Year</strong>
                  </li>
                  <li>
                    <span>Program Level</span>
                    <strong>Diploma in Engineering</strong>
                  </li>
                </ul>

                <Link
                  to="/student-portal"
                  className="dynamic-dept-sidebar-cta"
                >
                  Student Academic Portal <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HEAD OF DEPARTMENT (HOD) SECTION */}
      {activeHod && (
        <section className="dynamic-dept-section dynamic-dept-hod-section">
          <div className="dynamic-dept-container">
            <div className="dynamic-dept-section-header">
              <span className="dynamic-dept-section-tag">
                DEPARTMENT LEADERSHIP
              </span>
              <h2>Head of the Department</h2>
            </div>

            <div className="dynamic-dept-hod-card">
              <div className="dynamic-dept-hod-photo-box">
                <ImageWithFallback
                  src={hodPhotoUrl}
                  alt={activeHod.name}
                  className="dynamic-dept-hod-img"
                  fallback={
                    <div className="dynamic-dept-hod-placeholder">
                      <UserRound size={60} />
                    </div>
                  }
                />
                <span className="dynamic-dept-hod-badge">
                  <Award size={14} /> Head of Department
                </span>
              </div>

              <div className="dynamic-dept-hod-details">
                <span className="hod-role-tag">HEAD OF SECTION</span>
                <h3>{activeHod.name}</h3>
                <p className="hod-title">
                  {activeHod.designation || "Head of Department"} &mdash;{" "}
                  {department.department_name}
                </p>

                <div className="dynamic-dept-hod-meta-grid">
                  {activeHod.qualification && (
                    <div className="hod-meta-pill">
                      <GraduationCap size={16} />
                      <span>{activeHod.qualification}</span>
                    </div>
                  )}
                  {activeHod.experience && (
                    <div className="hod-meta-pill">
                      <Briefcase size={16} />
                      <span>{activeHod.experience}</span>
                    </div>
                  )}
                  {activeHod.email && (
                    <a
                      href={`mailto:${activeHod.email}`}
                      className="hod-meta-pill hod-email-link"
                    >
                      <Mail size={16} />
                      <span>{activeHod.email}</span>
                    </a>
                  )}
                </div>

                {activeHod.message && (
                  <blockquote className="dynamic-dept-hod-quote">
                    "{activeHod.message}"
                  </blockquote>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TEACHING FACULTY SECTION */}
      <section className="dynamic-dept-section dynamic-dept-faculty-section">
        <div className="dynamic-dept-container">
          <div className="dynamic-dept-section-header">
            <span className="dynamic-dept-section-tag">
              ACADEMIC EXCELLENCE
            </span>
            <div className="header-flex-row">
              <h2>Faculty Members</h2>
              <span className="faculty-badge-counter">
                {deptFaculty.length} Faculty Profiles
              </span>
            </div>
          </div>

          {deptFaculty.length > 0 ? (
            <div className="dynamic-dept-faculty-grid">
              {deptFaculty.map((member) => (
                <article
                  className="dynamic-dept-faculty-card"
                  key={member.id || member.name}
                >
                  <div className="dynamic-faculty-photo-wrap">
                    <ImageWithFallback
                      src={member.photo || member.image}
                      alt={member.name}
                      fallback={
                        <div className="dynamic-faculty-placeholder">
                          <UserRound size={36} />
                        </div>
                      }
                    />
                  </div>

                  <div className="dynamic-faculty-details">
                    <span className="dynamic-faculty-desig">
                      {member.designation}
                    </span>
                    <h3>{member.name}</h3>
                    <p className="dynamic-faculty-qual">
                      {member.qualification}
                    </p>

                    {member.experience && (
                      <div className="dynamic-faculty-joined">
                        <CalendarDays size={14} />
                        <span>Experience: {member.experience}</span>
                      </div>
                    )}

                    <div className="dynamic-faculty-actions-row">
                      <button
                        type="button"
                        className="dynamic-profile-btn"
                        onClick={() => setSelectedFaculty(member)}
                      >
                        <Eye size={15} />
                        View Profile
                      </button>

                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="dynamic-email-icon-btn"
                          title={`Email ${member.name} (${member.email})`}
                          aria-label={`Email ${member.name}`}
                        >
                          <Mail size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="dynamic-faculty-empty-card">
              <Users size={48} />
              <h3>Faculty Profiles Updating</h3>
              <p>
                Faculty details for the Department of{" "}
                {department.department_name} are being updated by the college
                administration.
              </p>
              <Link
                to={`/faculty?department=${encodeURIComponent(
                  department.department_code
                )}`}
                className="dynamic-view-faculty-link"
              >
                Browse All College Faculty <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FACULTY PROFILE MODAL */}
      {selectedFaculty && (
        <FacultyProfileModal
          faculty={selectedFaculty}
          onClose={() => setSelectedFaculty(null)}
        />
      )}
    </main>
  );
}

