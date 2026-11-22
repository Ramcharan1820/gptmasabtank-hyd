import React, { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  GraduationCap,
  Users,
  Building2,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";

import "./Placements.css";
import API_BASE_URL from "../apiConfig";

const defaultRecruiters = [
  "TCS",
  "Infosys",
  "Wipro",
  "Tech Mahindra",
  "Cognizant",
  "HCL Technologies",
  "Accenture",
  "Capgemini",
  "Deloitte",
  "IBM",
  "Amazon",
  "Microsoft",
];

const defaultFeatures = [
  {
    title: "Career Guidance",
    description: "Helping students understand career opportunities and prepare for recruitment processes.",
  },
  {
    title: "Training Programs",
    description: "Supporting technical, aptitude, communication and interview preparation activities.",
  },
  {
    title: "Student Development",
    description: "Encouraging students to improve their professional skills and confidence.",
  },
  {
    title: "Industry Interaction",
    description: "Creating opportunities for students to understand industry expectations and workplace requirements.",
  },
];

const defaultStudents = [
  {
    name: "K. Sai Teja",
    branch: "Computer Science & Engineering",
    company: "TCS (Tata Consultancy Services)",
    package: "₹ 3.8 LPA",
  },
  {
    name: "Mohammed Farhan",
    branch: "Mechanical Engineering",
    company: "Tata Motors Limited",
    package: "₹ 3.4 LPA",
  },
  {
    name: "V. Harish Kumar",
    branch: "Civil Engineering",
    company: "L&T Construction",
    package: "₹ 3.6 LPA",
  },
  {
    name: "S. Anusha",
    branch: "Electronics & Communication Engg",
    company: "Tech Mahindra",
    package: "₹ 3.5 LPA",
  },
  {
    name: "P. Rohith Reddy",
    branch: "Electrical & Electronics Engg",
    company: "Schneider Electric",
    package: "₹ 3.6 LPA",
  },
  {
    name: "B. Manasa",
    branch: "Pharmacy",
    company: "Dr. Reddy's Laboratories",
    package: "₹ 3.2 LPA",
  },
];

function Placements() {
  const [managedPlacements, setManagedPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/content/placements`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load placement content.");
      }

      setManagedPlacements(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Placement content API error:", err);
      setError(err.message || "Failed to load placement content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const featureItems = managedPlacements.filter((item) => item.kind === "feature");
  const recruiterItems = managedPlacements.filter((item) => item.kind === "recruiter");
  const studentItems = managedPlacements.filter((item) => item.kind === "student");

  const displayedFeatures = featureItems.length > 0 ? featureItems : defaultFeatures;
  const displayedRecruiters = recruiterItems.length > 0
    ? recruiterItems.map((item) => item.title || item.company)
    : defaultRecruiters;
  const displayedStudents = studentItems.length > 0 ? studentItems : defaultStudents;

  const featureIcons = [BriefcaseBusiness, GraduationCap, Users, Building2];

  return (
    <main className="placements-page">
      {/* HERO */}
      <section className="site-hero placements-hero">
        <div className="placements-container">
          <span>CAREER & PLACEMENTS</span>
          <h1>
            Building Careers,
            <strong>Creating Opportunities</strong>
          </h1>
          <p>
            The Training & Placement Cell helps students develop
            professional skills and prepares them for opportunities
            in the industry.
          </p>
        </div>
      </section>

      {/* PLACEMENT HIGHLIGHT METRICS */}
      <section className="placement-metrics-section">
        <div className="placements-container">
          <div className="placement-stats-grid">
            <div className="placement-stat-card">
              <strong>85%+</strong>
              <span>Placement &amp; Higher Studies Transition</span>
            </div>
            <div className="placement-stat-card">
              <strong>50+</strong>
              <span>Visiting Core &amp; IT Recruiters</span>
            </div>
            <div className="placement-stat-card">
              <strong>₹ 4.8 LPA</strong>
              <span>Highest Package Offered</span>
            </div>
            <div className="placement-stat-card">
              <strong>200+</strong>
              <span>Placed Students in Recent Batches</span>
            </div>
          </div>
        </div>
      </section>

      {/* 1. TRAINING & PLACEMENT CELL */}
      <section className="placements-section">
        <div className="placements-container">
          <div className="placements-section-title">
            <span>01 • TRAINING & PLACEMENT</span>
            <h2>Training & Placement Cell</h2>
            <p>
              Our Training & Placement Cell supports students in
              developing technical knowledge, professional skills
              and career readiness.
            </p>
          </div>

          <div className="placement-features">
            {displayedFeatures.map((feature, index) => {
              const Icon = featureIcons[index % featureIcons.length];
              return (
                <article key={feature.id || feature.title || index}>
                  <div className="placement-feature-icon">
                    <Icon size={24} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. OUR RECRUITERS */}
      <section className="recruiters-section" id="recruiters">
        <div className="placements-container">
          <div className="placements-section-title center">
            <span>02 • OUR RECRUITERS</span>
            <h2>Our Recruiters</h2>
            <p>
              Leading companies and organizations recruiting students from
              Government Polytechnic College.
            </p>
          </div>

          <div className="recruiters-grid">
            {displayedRecruiters.map((company, index) => (
              <div className="recruiter-card" key={index}>
                <div className="recruiter-logo">
                  {typeof company === "string" ? company.charAt(0) : "R"}
                </div>
                <span>{company}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. OUR SELECTED STUDENTS */}
      <section className="students-section">
        <div className="placements-container">
          <div className="placements-section-title center">
            <span>03 • OUR SELECTED STUDENTS</span>
            <h2>Our Selected Students</h2>
            <p>
              Celebrating the achievements of our students who have
              successfully secured career opportunities.
            </p>
          </div>

          {loading && (
            <div className="placements-loading-state">
              <RefreshCw size={32} className="events-spinner" />
              <p>Loading placement records from database...</p>
            </div>
          )}

          {!loading && error && (
            <div className="students-empty">
              <AlertCircle size={40} style={{ color: "#9c1c20" }} />
              <h3>Unable to Load Placement Records</h3>
              <p>{error}</p>
              <button onClick={fetchPlacements} className="placements-retry-btn">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && displayedStudents.length > 0 && (
            <div className="students-grid">
              {displayedStudents.map((student, index) => (
                <article
                  className="student-placement-card"
                  key={student.id || index}
                >
                  <div className="student-photo">
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = "block";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        display: student.photo ? "none" : "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Users size={38} />
                    </div>
                  </div>

                  <div className="student-info">
                    <span className="student-label">SELECTED STUDENT</span>
                    <h3>{student.name}</h3>
                    <p>{student.branch}</p>
                    <div className="student-company">
                      <Building2 size={16} />
                      <span>{student.company}</span>
                    </div>
                    <div className="student-package">
                      {student.package || student.description}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Placements;
