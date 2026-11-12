import React from "react";
import {
  Info,
  CalendarDays,
  Users,
  UserRound,
  Mail,
  Eye,
  Building2,
  Target,
  Lightbulb,
  FlaskConical,
  GraduationCap,
  Award,
  Car,
  Wrench,
  Settings,
  ChevronRight,
} from "lucide-react";

import "./AutomobileDepartment.css";


/* =========================================================
   AUTOMOBILE FACULTY
   Information supplied from the department source
========================================================= */

const faculty = [
  {
    name: "DR. BHUKYA BALAJI",
    designation: "LECTURER",
    image: "/images/departments/automobile/dr-bhukya-balaji.jpg",
  },
  {
    name: "N. SUNIL KUMAR",
    designation: "LECTURER",
    image: "/images/departments/automobile/n-sunil-kumar.jpg",
  },
  {
    name: "C. KARTHIK KUMAR",
    designation: "SENIOR LECTURER",
    image: "/images/departments/automobile/c-karthik-kumar.jpg",
  },
  {
    name: "T. SATHISH",
    designation: "LECTURER",
    image: "/images/departments/automobile/t-sathish.jpg",
  },
  {
    name: "K. DATTATREYA",
    designation: "LECTURER",
    image: "/images/departments/automobile/k-dattatreya.jpg",
  },
  {
    name: "M. PRIYANKA",
    designation: "LECTURER",
    image: "/images/departments/automobile/m-priyanka.jpg",
  },
];


/* =========================================================
   LABORATORIES / FACILITIES
========================================================= */

const facilities = [
  {
    icon: Car,
    title: "Automobile Workshop",
    description:
      "Practical learning environment for understanding automobile components, servicing and maintenance practices.",
  },
  {
    icon: Settings,
    title: "Automobile Engineering Laboratory",
    description:
      "Practical exposure to automobile systems, components and engineering principles.",
  },
  {
    icon: Wrench,
    title: "Vehicle Maintenance",
    description:
      "Hands-on learning related to inspection, servicing, maintenance and troubleshooting of vehicles.",
  },
  {
    icon: FlaskConical,
    title: "Engine Laboratory",
    description:
      "Practical study of automobile engines and their operating principles.",
  },
];


/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="auto-section-title">
      <span className="auto-title-line"></span>

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

export default function AutomobileDepartment() {
  return (
    <main className="auto-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="site-hero auto-hero">

        <div className="auto-hero-inner">

          <div>

            <span className="auto-hero-label">
              GOVERNMENT POLYTECHNIC COLLEGE
            </span>

            <h1>
              Department of
              <br />
              Automobile Engineering
            </h1>

            <p>
              Government Polytechnic College, Masab Tank, Hyderabad
            </p>

          </div>


          <div className="auto-breadcrumb">

            <a href="/">
              Home
            </a>

            <ChevronRight size={15} />

            <a href="/departments">
              Departments
            </a>

            <ChevronRight size={15} />

            <span>
              Automobile Engineering
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="auto-stats">

        <div className="auto-stat">

          <div className="auto-stat-icon">
            <Users size={24} />
          </div>

          <strong>{faculty.length}</strong>

          <span>
            Faculty Members
          </span>

        </div>


        <div className="auto-stat">

          <div className="auto-stat-icon">
            <Car size={24} />
          </div>

          <strong>AE</strong>

          <span>
            Automobile Engineering
          </span>

        </div>


        <div className="auto-stat">

          <div className="auto-stat-icon">
            <Wrench size={24} />
          </div>

          <strong>Practical</strong>

          <span>
            Technical Training
          </span>

        </div>


        <div className="auto-stat">

          <div className="auto-stat-icon">
            <Award size={24} />
          </div>

          <strong>Diploma</strong>

          <span>
            Engineering Programme
          </span>

        </div>

      </section>


      {/* =====================================================
          ABOUT DEPARTMENT
      ===================================================== */}

      <section className="auto-section">

        <SectionTitle icon={Info}>
          About the Department
        </SectionTitle>


        <div className="auto-about-grid">

          <div className="auto-about-content">

            <div className="auto-established">

              <CalendarDays size={18} />

              <span>
                Department of Automobile Engineering
              </span>

            </div>


            <p>
              The Automobile Engineering Department specializes in
              the design, operation, and maintenance of various types
              of vehicles including cars, trucks, and two-wheelers.
              The department provides in-depth knowledge of automobile
              engines, vehicle transmission systems, chassis design,
              automotive electrical systems, and vehicle maintenance
              practices.
            </p>


            <p>
              Practical training in automobile workshops and engine
              laboratories enables students to understand the working
              principles of modern vehicles and automotive technologies.
            </p>


            <p>
              Graduates from this department can pursue careers in
              automobile manufacturing companies, service industries,
              and vehicle maintenance sectors.
            </p>

          </div>


          <div className="auto-about-card">

            <div className="auto-about-icon">

              <Car size={30} />

            </div>


            <h3>
              Automobile Engineering
            </h3>


            <p>
              Developing practical knowledge and technical skills
              related to modern vehicles, automobile systems and
              maintenance technologies.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOD
      ===================================================== */}

      <section className="auto-section">

        <SectionTitle icon={UserRound}>
          Head of the Department
        </SectionTitle>


        <div className="auto-hod">

          <div className="auto-hod-photo">

            <img
              src="/images/departments/automobile/hod.jpg"
              alt="Sri K. Hari Krishna"
              onError={(e) => {

                e.currentTarget.style.display = "none";

                e.currentTarget.parentElement.classList.add(
                  "auto-image-placeholder"
                );

              }}
            />


            <div className="auto-hod-placeholder">

              <UserRound size={48} />

              <span>
                HOD
              </span>

            </div>

          </div>


          <div className="auto-hod-details">

            <span className="auto-small-label">
              HEAD OF DEPARTMENT
            </span>


            <h3>
              Sri K. Hari Krishna
            </h3>


            <p className="auto-hod-role">
              Head of Department — Automobile Engineering
            </p>


            <div className="auto-hod-info">

              <p>
                He was appointed as{" "}
                <strong>
                  Lecturer in the Department of Automobile Engineering
                </strong>{" "}
                in the Department of Technical Education on{" "}
                <strong>
                  13th March 1997
                </strong>.
              </p>


              <p>
                Since his appointment, he has been actively involved
                in teaching and academic activities in the field of
                Automobile Engineering.
              </p>


              <p>
                Over the years, he has gained extensive teaching
                experience in Government Polytechnic institutions
                under the Department of Technical Education. He has
                played an important role in guiding students and
                contributing to the development of technical education.
              </p>


              <p>
                Through his dedication and service, he has supported
                various academic and institutional activities.
              </p>


              <p>
                At present, he is serving as the{" "}
                <strong>
                  Head of the Department (HOD) – Automobile Engineering.
                </strong>
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          EDUCATIONAL QUALIFICATIONS
      ===================================================== */}

      <section className="auto-section">

        <SectionTitle icon={GraduationCap}>
          Educational Qualifications
        </SectionTitle>


        <div className="auto-qualification-grid">

          <div className="auto-qualification-card">

            <div className="auto-qualification-icon">
              <GraduationCap size={25} />
            </div>

            <div>

              <span>
                Bachelor of Engineering
              </span>

              <h3>
                B.E – Automobile Engineering
              </h3>

              <p>
                Rural Engineering College Hulkoti,
                affiliated to Karnatak University
              </p>

            </div>

          </div>


          <div className="auto-qualification-card">

            <div className="auto-qualification-icon">
              <GraduationCap size={25} />
            </div>

            <div>

              <span>
                Master of Technology
              </span>

              <h3>
                M.Tech – Industrial Engineering and Management
              </h3>

              <p>
                Jawaharlal Nehru Technological University Hyderabad,
                Hyderabad, Telangana
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PROFESSIONAL EXPERIENCE
      ===================================================== */}

      <section className="auto-section">

        <SectionTitle icon={Award}>
          Professional Experience
        </SectionTitle>


        <div className="auto-experience-card">

          <div className="auto-experience-icon">

            <CalendarDays size={28} />

          </div>


          <div>

            <span className="auto-experience-label">
              DEPARTMENT OF TECHNICAL EDUCATION
            </span>


            <h3>
              Experience since 13-03-1997
            </h3>


            <p>
              Sri K. Hari Krishna has been working in the
              Department of Technical Education since
              <strong> 13-03-1997</strong> and has several years
              of teaching experience in Government Polytechnic
              colleges.
            </p>


            <p>
              He is currently serving as Head of the Department
              of Automobile Engineering, contributing to academic
              development and student learning.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          VISION & MISSION
      ===================================================== */}

      <section className="auto-section">

        <div className="auto-vision-mission">

          {/* VISION */}

          <div className="auto-vm-card vision">

            <div className="auto-vm-icon">

              <Lightbulb size={26} />

            </div>


            <div>

              <span>
                VISION OF THE DEPARTMENT
              </span>


              <p>
                Contribute in producing Diploma holders in
                Automobile Engineering with ethical and moral
                values to meet the technological standards of
                21st Century of the globe and the nation.
              </p>

            </div>

          </div>


          {/* MISSION */}

          <div className="auto-vm-card mission">

            <div className="auto-vm-icon">

              <Target size={26} />

            </div>


            <div>

              <span>
                MISSION OF THE DEPARTMENT
              </span>


              <div className="auto-mission-list">

                <p>
                  <strong>M1:</strong>{" "}
                  To impart knowledge through systematic teaching
                  and learning process in automobile engineering
                  along with fundamentals in interaction with
                  industry and alumni.
                </p>


                <p>
                  <strong>M2:</strong>{" "}
                  Develop value-based system of education which
                  promotes good civic sense by offering
                  well-balanced programme of instruction.
                </p>


                <p>
                  <strong>M3:</strong>{" "}
                  To enhance overall personality development
                  and hands on experience in automobile engineering.
                </p>


                <p>
                  <strong>M4:</strong>{" "}
                  Create enthusiasm for life-long learning by
                  enhancing the knowledge base and skills necessary
                  to contribute to the improvement of their
                  profession and community.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FACULTY
      ===================================================== */}

      <section className="auto-section">

        <div className="auto-section-heading-row">

          <SectionTitle icon={Users}>
            Faculty Details
          </SectionTitle>


          <span className="auto-faculty-count">
            {faculty.length} Faculty Members
          </span>

        </div>


        <div className="auto-faculty-grid">

          {faculty.map((member) => (

            <article
              className="auto-faculty-card"
              key={member.name}
            >

              <div className="auto-faculty-photo">

                <img
                  src={member.image}
                  alt={member.name}
                  onError={(e) => {

                    e.currentTarget.style.display = "none";

                    e.currentTarget.parentElement.classList.add(
                      "auto-faculty-image-placeholder"
                    );

                  }}
                />


                <div className="auto-faculty-placeholder">

                  <UserRound size={38} />

                  <span>
                    Faculty
                  </span>

                </div>

              </div>


              <div className="auto-faculty-details">

                <span className="auto-faculty-designation">
                  {member.designation}
                </span>


                <h3>
                  {member.name}
                </h3>


                <div className="auto-faculty-profile">

                  <span>
                    Automobile Engineering
                  </span>

                </div>


                <button
                  type="button"
                  className="auto-profile-btn"
                  onClick={() => {
                    document
                      .getElementById("auto-faculty-profile-note")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                  }}
                >
                  <Eye size={16} />
                  Faculty Profile
                </button>

              </div>

            </article>

          ))}

        </div>


        <div
          id="auto-faculty-profile-note"
          className="auto-profile-note"
        >

          <Info size={18} />

          <span>
            Faculty names and designations are displayed from the
            department information provided for Government
            Polytechnic College, Masab Tank.
          </span>

        </div>

      </section>


      {/* =====================================================
          FACILITIES
      ===================================================== */}

      <section className="auto-section">

        <SectionTitle icon={FlaskConical}>
          Laboratories & Learning Facilities
        </SectionTitle>


        <div className="auto-facilities-grid">

          {facilities.map((facility) => {

            const Icon = facility.icon;

            return (
              <div
                className="auto-facility-card"
                key={facility.title}
              >

                <div className="auto-facility-icon">

                  <Icon size={27} />

                </div>


                <h3>
                  {facility.title}
                </h3>


                <p>
                  {facility.description}
                </p>

              </div>
            );

          })}

        </div>

      </section>


      {/* =====================================================
          PROGRAMME INFORMATION
      ===================================================== */}

      <section className="auto-section">

        <SectionTitle icon={GraduationCap}>
          Programme Information
        </SectionTitle>


        <div className="auto-program-card">

          <div className="auto-program-icon">

            <Car size={38} />

          </div>


          <div>

            <span className="auto-program-label">
              DIPLOMA PROGRAMME
            </span>


            <h3>
              Diploma in Automobile Engineering
            </h3>


            <p>
              The Automobile Engineering programme provides
              students with theoretical knowledge and practical
              exposure in automobile systems, vehicle technology,
              maintenance and related engineering practices.
            </p>

          </div>

        </div>

      </section>


     

    </main>
  );
}