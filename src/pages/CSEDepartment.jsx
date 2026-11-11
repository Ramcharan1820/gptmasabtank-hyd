import React from "react";
import {
  Info,
  CalendarDays,
  Users,
  UserRound,
  Eye,
  Building2,
  Target,
  Lightbulb,
  FlaskConical,
  GraduationCap,
  Award,
  Laptop,
  ChevronRight,
} from "lucide-react";

import "./CSEDepartment.css";

/* =========================================================
   FACULTY DATA
========================================================= */

const faculty = [
  {
    name: "MD RIAZ",
    designation: "LECTURER",
    qualification: "B.Tech, M.Tech in Computer Science & Engineering",
    joined: "20 September 2010",
    image: "/images/departments/cse/md-riaz.jpg",
    profile:
      "https://dte.telangana.gov.in/filePreview?fileName=CMS/File_290120261224281476637643.pdf",
  },
  {
    name: "V. SAI DURGA PRASAD GOUD",
    designation: "LECTURER",
    qualification: "B.Tech in Data Science",
    joined: "15 August 2025",
    image: "/images/departments/cse/sai-durga-prasad-goud.jpg",
    profile:
      "https://dte.telangana.gov.in/filePreview?fileName=CMS/File_290120261104549702435983.pdf",
  },
  {
    name: "N. SRILAXMI",
    designation: "LECTURER",
    qualification: "B.Tech",
    joined: "7 August 2025",
    image: "/images/departments/cse/n-srilaxmi.jpg",
    profile:
      "https://dte.telangana.gov.in/filePreview?fileName=CMS/File_110320261145573564034269.pdf",
  },
  {
    name: "N. MOUNIKA",
    designation: "LECTURER",
    qualification: "B.Tech",
    joined: "7 August 2025",
    image: "/images/departments/cse/n-mounika.jpg",
    profile:
      "https://dte.telangana.gov.in/filePreview?fileName=CMS/File_110320261147388421233708.pdf",
  },
  {
    name: "B. MOUNIKA",
    designation: "LECTURER",
    qualification: "B.Tech",
    joined: "7 August 2025",
    image: "/images/departments/cse/b-mounika.jpg",
    profile:
      "https://dte.telangana.gov.in/filePreview?fileName=CMS/File_110320261146394985107915.pdf",
  },
  {
    name: "USHASWINI",
    designation: "LECTURER",
    qualification: "B.Tech in Computer Science & Engineering",
    joined: "7 August 2025",
    image: "/images/departments/cse/ushaswini.jpg",
    profile:
      "https://dte.telangana.gov.in/filePreview?fileName=CMS/File_110320261147057910594688.pdf",
  },
];

/* =========================================================
   LABORATORIES
========================================================= */

const labs = [
  {
    icon: Laptop,
    title: "Programming Laboratory",
    description:
      "Practical learning environment for programming, problem solving and software development.",
  },
  {
    icon: Building2,
    title: "Computer Laboratory",
    description:
      "Computer facilities supporting academic, practical and project-based learning.",
  },
  {
    icon: FlaskConical,
    title: "Networking Laboratory",
    description:
      "Practical exposure to computer networks, communication and networking concepts.",
  },
  {
    icon: GraduationCap,
    title: "Project & Innovation",
    description:
      "Platform for students to develop academic projects and practical technology skills.",
  },
];

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="cse-section-title">
      <span className="cse-title-line"></span>

      <Icon
        size={21}
        strokeWidth={2.2}
      />

      <h2>{children}</h2>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CSEDepartment() {
  return (
    <main className="cse-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="cse-hero">

        <div className="cse-hero-inner">

          <div className="cse-hero-content">

            <span className="cse-hero-label">
              GOVERNMENT POLYTECHNIC COLLEGE
            </span>

            <h1>
              Department of Computer Science
              <br />
              and Engineering
            </h1>

            <p>
              Government Polytechnic College, Masab Tank, Hyderabad
            </p>

          </div>

          <div className="cse-breadcrumb">

            <a href="/">
              Home
            </a>

            <ChevronRight size={15} />

            <a href="/departments">
              Departments
            </a>

            <ChevronRight size={15} />

            <span>
              CSE
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          QUICK STATISTICS
      ===================================================== */}

      <section className="cse-stats">

        <div className="cse-stat">

          <div className="cse-stat-icon">
            <Users size={24} />
          </div>

          <strong>
            6+
          </strong>

          <span>
            Faculty Profiles
          </span>

        </div>


        <div className="cse-stat">

          <div className="cse-stat-icon">
            <GraduationCap size={24} />
          </div>

          <strong>
            CSE
          </strong>

          <span>
            Diploma Programme
          </span>

        </div>


        <div className="cse-stat">

          <div className="cse-stat-icon">
            <Laptop size={24} />
          </div>

          <strong>
            Computer
          </strong>

          <span>
            Technology Education
          </span>

        </div>


        <div className="cse-stat">

          <div className="cse-stat-icon">
            <Award size={24} />
          </div>

          <strong>
            Technical
          </strong>

          <span>
            Skill Development
          </span>

        </div>

      </section>


      {/* =====================================================
          ABOUT DEPARTMENT
      ===================================================== */}

      <section className="cse-section">

        <SectionTitle icon={Info}>
          About the Department
        </SectionTitle>

        <div className="cse-about-grid">

          <div className="cse-about-content">

            <div className="cse-established">

              <CalendarDays size={18} />

              <span>
                Department of Computer Science & Engineering
              </span>

            </div>

            <p>
              The Department of Computer Science and Engineering at
              Government Polytechnic College, Masab Tank, Hyderabad,
              provides students with technical knowledge and practical
              skills in computer science and related technologies.
            </p>

            <p>
              The department focuses on developing strong fundamentals,
              practical competence, problem-solving ability and
              industry-oriented technical skills through academic and
              laboratory learning.
            </p>

            <p>
              Students are encouraged to apply their knowledge through
              practical activities, projects and continuous technical
              learning.
            </p>

          </div>


          <div className="cse-about-card">

            <div className="about-card-icon">
              <Laptop size={30} />
            </div>

            <h3>
              Computer Science & Engineering
            </h3>

            <p>
              Building technical knowledge, practical skills and
              professional capabilities for the digital era.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOD
      ===================================================== */}

      <section className="cse-section">

        <SectionTitle icon={UserRound}>
          Head of the Department
        </SectionTitle>

        <div className="cse-hod">

          <div className="cse-hod-photo">

            <img
              src="/images/departments/cse/hod.jpg"
              alt="Head of Department"
              onError={(e) => {

                e.currentTarget.style.display = "none";

                e.currentTarget.parentElement.classList.add(
                  "cse-image-placeholder"
                );

              }}
            />

            <div className="hod-placeholder-content">

              <UserRound size={48} />

              <span>
                HOD
              </span>

            </div>

          </div>


          <div className="cse-hod-details">

            <span className="cse-small-label">
              HEAD OF DEPARTMENT
            </span>

            <h3>
              Sri. NANNAM SREENIVASULU, M.Tech
            </h3>

            <p className="cse-hod-role">
              Head of Department — Computer Science & Engineering
            </p>

            <div className="cse-hod-info">

              <p>
                <strong>
                  Experience:
                </strong>{" "}
                28 years of teaching experience as Lecturer,
                Senior Lecturer and Head of Department in Government
                Polytechnic Colleges.
              </p>

              <p>
                <strong>
                  Academic Qualifications:
                </strong>
              </p>

              <ul>

                <li>
                  Bachelor of Technology in Computer Science
                  Engineering — Sri Krishnadevaraya University, 1996
                </li>

                <li>
                  Master of Technology (DSCE) — JNTUH, Hyderabad, 2011
                </li>

                <li>
                  Master of Technology (CSE) — JNTUH, Hyderabad, 2014
                </li>

              </ul>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOD MESSAGE
      ===================================================== */}

      <section className="cse-section">

        <SectionTitle icon={Info}>
          HOD's Message
        </SectionTitle>

        <div className="cse-message">

          <div className="cse-quote-mark">
            “
          </div>

          <div>

            <p>
              The Department of Computer Science and Engineering is
              committed to providing students with quality technical
              education, practical exposure and opportunities for
              continuous learning.
            </p>

            <p>
              The department encourages students to develop technical
              competence, professional values, creativity and
              problem-solving skills so that they can confidently meet
              the requirements of higher education and industry.
            </p>

            <div className="cse-message-signature">

              <strong>
                — Head of the Department
              </strong>

              <span>
                Computer Science & Engineering
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          VISION & MISSION
      ===================================================== */}

      <section className="cse-section">

        <div className="cse-vision-mission">

          {/* VISION */}

          <div className="cse-vm-card vision">

            <div className="cse-vm-icon">

              <Lightbulb size={26} />

            </div>

            <div>

              <span>
                VISION OF THE DEPARTMENT
              </span>

              <p>
                Develop the students who can technologically adopt,
                innovate, self-motivated and turn into responsible
                citizen possessing human values, globally competent
                professional.
              </p>

            </div>

          </div>


          {/* MISSION */}

          <div className="cse-vm-card mission">

            <div className="cse-vm-icon">

              <Target size={26} />

            </div>

            <div>

              <span>
                MISSION OF THE DEPARTMENT
              </span>

              <div className="cse-mission-list">

                <p>
                  <strong>
                    M1:
                  </strong>{" "}
                  To provide knowledge based technology and serve to
                  meet the needs of society in computer and allied
                  industries.
                </p>

                <p>
                  <strong>
                    M2:
                  </strong>{" "}
                  To make students professionally strong foundation
                  to create innovative technologies.
                </p>

                <p>
                  <strong>
                    M3:
                  </strong>{" "}
                  To inculcate values of professional ethics,
                  leadership qualities and lifelong learning.
                </p>

                <p>
                  <strong>
                    M4:
                  </strong>{" "}
                  To prepare students for accountable through
                  self evaluation and continuous improvement.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          TEACHING FACULTY
      ===================================================== */}

      <section className="cse-section">

        <div className="cse-section-heading-row">

          <SectionTitle icon={Users}>
            Teaching Faculty
          </SectionTitle>

          <span className="faculty-count">
            {faculty.length} Faculty Profiles
          </span>

        </div>


        <div className="cse-faculty-grid">

          {faculty.map((member) => (

            <article
              className="cse-faculty-card"
              key={member.name}
            >

              <div className="faculty-photo">

                <img
                  src={member.image}
                  alt={member.name}
                  onError={(e) => {

                    e.currentTarget.style.display = "none";

                    e.currentTarget.parentElement.classList.add(
                      "faculty-image-placeholder"
                    );

                  }}
                />

                <div className="faculty-placeholder">

                  <UserRound size={38} />

                </div>

              </div>


              <div className="faculty-details">

                <span className="faculty-designation">
                  {member.designation}
                </span>

                <h3>
                  {member.name}
                </h3>

                <p className="faculty-qualification">
                  {member.qualification}
                </p>

                <div className="faculty-joined">

                  <CalendarDays size={15} />

                  <span>
                    Joined: {member.joined}
                  </span>

                </div>

                <a
                  href={member.profile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="faculty-profile-btn"
                >

                  <Eye size={16} />

                  View Official Profile

                </a>

              </div>

            </article>

          ))}

        </div>

      </section>


      {/* =====================================================
          LABORATORIES
      ===================================================== */}

      <section className="cse-section">

        <SectionTitle icon={FlaskConical}>
          Laboratories & Learning Facilities
        </SectionTitle>

        <div className="cse-labs-grid">

          {labs.map((lab) => {

            const Icon = lab.icon;

            return (

              <div
                className="cse-lab-card"
                key={lab.title}
              >

                <div className="cse-lab-icon">

                  <Icon size={27} />

                </div>

                <h3>
                  {lab.title}
                </h3>

                <p>
                  {lab.description}
                </p>

              </div>

            );

          })}

        </div>

      </section>


      {/* =====================================================
          PROGRAMME
      ===================================================== */}

      <section className="cse-section">

        <SectionTitle icon={GraduationCap}>
          Programme Information
        </SectionTitle>

        <div className="cse-program-card">

          <div className="program-main-icon">

            <Laptop size={38} />

          </div>

          <div>

            <span className="program-label">
              DIPLOMA PROGRAMME
            </span>

            <h3>
              Diploma in Computer Science & Engineering
            </h3>

            <p>
              The programme combines theoretical knowledge with
              practical laboratory learning to develop students'
              technical and problem-solving capabilities.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}