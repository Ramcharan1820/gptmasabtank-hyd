import React, { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  GraduationCap,
  Users,
  Building2,
  ArrowRight,
} from "lucide-react";

import "./Placements.css";

const recruiters = [
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

const students = [
  {
    name: "Selected Student",
    branch: "Computer Science & Engineering",
    company: "Company Name",
    package: "Placement Details",
  },
  {
    name: "Selected Student",
    branch: "Electronics & Communication Engineering",
    company: "Company Name",
    package: "Placement Details",
  },
  {
    name: "Selected Student",
    branch: "Electrical & Electronics Engineering",
    company: "Company Name",
    package: "Placement Details",
  },
  {
    name: "Selected Student",
    branch: "Mechanical Engineering",
    company: "Company Name",
    package: "Placement Details",
  },
];

function Placements() {
  const [managedPlacements, setManagedPlacements] = useState(null);

  useEffect(() => {
    let active = true;

    fetch("http://localhost:5000/api/content/placements")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load placement content.");
        }
        return result.data;
      })
      .then((records) => {
        if (active && Array.isArray(records)) {
          setManagedPlacements(records);
        }
      })
      .catch((error) => {
        console.error("Placement content API error:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const featureItems = (managedPlacements || []).filter((item) => item.kind === "feature");
  const recruiterItems = (managedPlacements || []).filter((item) => item.kind === "recruiter");
  const studentItems = (managedPlacements || []).filter((item) => item.kind === "student");
  const displayedFeatures = managedPlacements !== null
    ? featureItems
    : [
        { title: "Career Guidance", description: "Helping students understand career opportunities and prepare for recruitment processes." },
        { title: "Training Programs", description: "Supporting technical, aptitude, communication and interview preparation activities." },
        { title: "Student Development", description: "Encouraging students to improve their professional skills and confidence." },
        { title: "Industry Interaction", description: "Creating opportunities for students to understand industry expectations and workplace requirements." },
      ];
  const displayedRecruiters = managedPlacements !== null
    ? recruiterItems.map((item) => item.title || item.company)
    : recruiters;
  const displayedStudents = managedPlacements !== null ? studentItems : students;
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


      {/* 1. TRAINING & PLACEMENT CELL */}
      <section className="placements-section">
        <div className="placements-container">

          <div className="placements-section-title">
            <span>01 • TRAINING & PLACEMENT</span>

            <h2>
              Training & Placement Cell
            </h2>

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
                <article key={feature.id || feature.title}>
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

            <h2>
              Our Recruiters
            </h2>

            <p>
              Thousands of students achieved their dream job at
              leading companies and organizations.
            </p>

          </div>


          <div className="recruiters-grid">

            {displayedRecruiters.map((company, index) => (
              <div
                className="recruiter-card"
                key={index}
              >
                <div className="recruiter-logo">
                  {company.charAt(0)}
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

            <h2>
              Our Selected Students
            </h2>

            <p>
              Celebrating the achievements of our students who have
              successfully secured career opportunities.
            </p>

          </div>


          <div className="students-grid">

            {displayedStudents.map((student, index) => (
              <article
                className="student-placement-card"
                key={index}
              >

                <div className="student-photo">
                  {student.photo ? (
                    <img src={student.photo} alt={student.name} />
                  ) : (
                    <Users size={38} />
                  )}
                </div>

                <div className="student-info">

                  <span className="student-label">
                    SELECTED STUDENT
                  </span>

                  <h3>
                    {student.name}
                  </h3>

                  <p>
                    {student.branch}
                  </p>

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

        </div>
      </section>


      {/* BOTTOM CTA */}
      <section className="placements-cta">
        <div className="placements-container">

          <div>
            <span>GOVERNMENT POLYTECHNIC COLLEGE</span>

            <h2>
              Start preparing for your career today.
            </h2>
          </div>

          <a href="#recruiters">
            Our Recruiters
            <ArrowRight size={17} />
          </a>

        </div>
      </section>

    </main>
  );
}

export default Placements;