import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building2,
  ChevronRight,
  Users,
  Award,
  CalendarDays,
  UserRound,
  Eye,
  Mail,
  CheckCircle2,
  ArrowRight,
  Wrench,
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
  const normalizedDepartmentName = String(department?.department_name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const facultyDepartmentKey = normalizedDepartmentName.includes("humanities")
    ? "General"
    : normalizedCode;
  const { faculty: deptFaculty } = useDepartmentFaculty(
    facultyDepartmentKey,
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

  const departmentCode =
    normalizedDepartmentName.includes("humanities")
      ? "General"
      : ["AE", "AU", "AUTO", "AUTOMOBILE"].includes(
          String(department.department_code || "").toUpperCase().trim()
        ) || /automobile/i.test(department.department_name || "")
        ? "AU"
        : department.department_code;

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
          qualification: normalizedDepartmentName.includes("humanities")
            ? "M.Sc. (Organic Chemistry), Osmania University; Ph.D. (Chemistry), Jawaharlal Nehru Technological University Hyderabad."
            : "",
          experience: normalizedDepartmentName.includes("humanities")
            ? "Appointed as a Lecturer in the Department of Humanities and Sciences on 6 March 1991. He has extensive teaching experience in Government Polytechnic colleges, teaching Chemistry and guiding students in science education. He has contributed to the development of students in basic sciences and continues to strengthen foundation subjects for engineering students as Head of the Department."
            : "",
        }
      : null);

  const hodPhotoUrl =
    activeHod?.photo || activeHod?.image || department.image || "";
  const hasHodDetails = Boolean(
    activeHod?.experience ||
      activeHod?.qualification ||
      activeHod?.specialization ||
      activeHod?.email ||
      activeHod?.message
  );

  return (
    <main className="dynamic-dept-page">
      {/* HERO SECTION */}
      <section className="site-hero dynamic-dept-hero">
        <div className="dynamic-dept-hero-inner">
          <div className="dynamic-dept-hero-content">
            <span className="dynamic-dept-hero-label">
              ACADEMIC DEPARTMENT | CODE: {departmentCode}
            </span>
            <h1>Department of {department.department_name}</h1>
            <p className="dynamic-dept-hero-subtitle">
              Government Polytechnic College, Masab Tank, Hyderabad
            </p>
          </div>
          <nav className="dynamic-dept-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <Link to="/departments">Departments</Link>
            <ChevronRight size={14} />
            <span className="active">{departmentCode}</span>
          </nav>
        </div>
      </section>

      {/* QUICK STATS STRIP */}
      <section className="dynamic-dept-stats-strip">
        <div className="dynamic-dept-container dynamic-dept-stats-grid">
          <div className="dynamic-dept-stat-card">
            <div className="stat-icon-wrap">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <strong>{deptFaculty.length}</strong>
              <span>Faculty Members</span>
            </div>
          </div>

          <div className="dynamic-dept-stat-card">
            <div className="stat-icon-wrap">
              <Building2 size={24} />
            </div>
            <div className="stat-info">
              <strong>{departmentCode}</strong>
              <span>{department.department_name}</span>
            </div>
          </div>

          <div className="dynamic-dept-stat-card">
            <div className="stat-icon-wrap">
              <Wrench size={24} />
            </div>
            <div className="stat-info">
              <strong>Practical</strong>
              <span>Technical Training</span>
            </div>
          </div>

          <div className="dynamic-dept-stat-card">
            <div className="stat-icon-wrap">
              <Award size={24} />
            </div>
            <div className="stat-info">
              <strong>Diploma</strong>
              <span>Engineering Programme</span>
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
                    <strong>{departmentCode}</strong>
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
                alt={activeHod?.name || "Head of Department"}
                className="dynamic-dept-hod-img"
                fallback={
                  <div className="dynamic-dept-hod-placeholder">
                    <UserRound size={48} />
                    <span>HOD</span>
                  </div>
                }
              />
            </div>

            <div className="dynamic-dept-hod-details">
              <span className="dynamic-dept-hod-label">
                HEAD OF DEPARTMENT
              </span>
              <h3>{activeHod?.name || "Details to be updated"}</h3>
              <p className="hod-title">
                {activeHod
                  ? `${activeHod.designation || "Head of Department"} — ${department.department_name}`
                  : `Department of ${department.department_name}`}
              </p>

              {activeHod && hasHodDetails ? (
                <>
                  <div className="dynamic-dept-hod-info">
                    {activeHod.experience && (
                      <p>
                        <strong>Experience:</strong> {activeHod.experience}
                      </p>
                    )}
                    {activeHod.qualification && (
                      <p>
                        <strong>Qualifications:</strong> {activeHod.qualification}
                      </p>
                    )}
                    {activeHod.specialization && (
                      <p>
                        <strong>Specialization:</strong> {activeHod.specialization}
                      </p>
                    )}
                    {activeHod.email && (
                      <p>
                        <strong>Official Email:</strong>{" "}
                        <a href={`mailto:${activeHod.email}`}>
                          {activeHod.email}
                        </a>
                      </p>
                    )}
                  </div>

                  {activeHod.message && (
                    <blockquote className="dynamic-dept-hod-quote">
                      "{activeHod.message}"
                    </blockquote>
                  )}
                </>
              ) : (
                <p className="dynamic-dept-hod-empty">
                  {activeHod
                    ? "HOD profile details have not been added yet."
                    : "HOD information will be published here when it is available."}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

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
                  departmentCode
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

