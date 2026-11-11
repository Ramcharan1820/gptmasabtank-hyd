import React from "react";
import {
  Info,
  CalendarDays,
  Users,
  UserRound,
  Eye,
  Target,
  Lightbulb,
  FlaskConical,
  GraduationCap,
  Award,
  Zap,
  CircuitBoard,
  BatteryCharging,
  ChevronRight,
} from "lucide-react";

import "./EEEDepartment.css";


/* =========================================================
   FACULTY DATA
========================================================= */

const faculty = [
  {
    name: "PASU MALLESHAM",
    designation: "LECTURER",
    image: "/images/departments/eee/pasu-malleshm.jpg",
  },
  {
    name: "DESHABOINA SARITHA",
    designation: "LECTURER",
    image: "/images/departments/eee/deshaboina-saritha.jpg",
  },
];


/* =========================================================
   FACILITIES
========================================================= */

const facilities = [
  {
    icon: Zap,
    title: "Electrical Machines Laboratory",
    description:
      "Practical training in electrical machines, their operation, characteristics, control and applications.",
  },
  {
    icon: BatteryCharging,
    title: "Power Systems Laboratory",
    description:
      "Practical exposure to electrical power generation, transmission, distribution and power system concepts.",
  },
  {
    icon: CircuitBoard,
    title: "Electrical Measurements Laboratory",
    description:
      "Hands-on learning in electrical measurements, measuring instruments, testing and measurement techniques.",
  },
  {
    icon: FlaskConical,
    title: "Power Electronics Laboratory",
    description:
      "Practical study of power electronic devices, converters, control techniques and modern electrical applications.",
  },
];


/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="eee-section-title">
      <span className="eee-title-line"></span>

      <Icon
        size={21}
        strokeWidth={2.2}
      />

      <h2>{children}</h2>
    </div>
  );
}


/* =========================================================
   EEE DEPARTMENT PAGE
========================================================= */

export default function EEEDepartment() {
  return (
    <main className="eee-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="eee-hero">

        <div className="eee-hero-inner">

          <div>

            <span className="eee-hero-label">
              GOVERNMENT POLYTECHNIC COLLEGE
            </span>

            <h1>
              Electrical & Electronics
              <br />
              Engineering
            </h1>

            <p>
              Government Polytechnic College, Masab Tank, Hyderabad
            </p>

          </div>


          <div className="eee-breadcrumb">

            <a href="/">Home</a>

            <ChevronRight size={15} />

            <a href="/departments">Departments</a>

            <ChevronRight size={15} />

            <span>EEE</span>

          </div>

        </div>

      </section>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="eee-stats">

        <div className="eee-stat">

          <div className="eee-stat-icon">
            <Users size={24} />
          </div>

          <strong>{faculty.length}</strong>

          <span>Faculty Members</span>

        </div>


        <div className="eee-stat">

          <div className="eee-stat-icon">
            <Zap size={24} />
          </div>

          <strong>EEE</strong>

          <span>Electrical & Electronics</span>

        </div>


        <div className="eee-stat">

          <div className="eee-stat-icon">
            <BatteryCharging size={24} />
          </div>

          <strong>Practical</strong>

          <span>Technical Training</span>

        </div>


        <div className="eee-stat">

          <div className="eee-stat-icon">
            <Award size={24} />
          </div>

          <strong>Diploma</strong>

          <span>Engineering Programme</span>

        </div>

      </section>


      {/* =====================================================
          ABOUT DEPARTMENT
      ===================================================== */}

      <section className="eee-section">

        <SectionTitle icon={Info}>
          About the Department
        </SectionTitle>


        <div className="eee-about-grid">

          <div className="eee-about-content">

            <div className="eee-established">

              <CalendarDays size={18} />

              <span>
                Department of Electrical & Electronics Engineering
              </span>

            </div>


            <p>
              The Electrical and Electronics Engineering (EEE)
              Department focuses on the generation, transmission,
              distribution, and utilization of electrical power along
              with the study of electrical machines and electronic
              systems.
            </p>


            <p>
              The department provides comprehensive knowledge of
              electrical circuits, power systems, control systems,
              and power electronics.
            </p>


            <p>
              Practical training in electrical machines, measurement
              techniques, and electrical maintenance enables students
              to develop the skills required to work in power plants,
              electrical industries, and maintenance sectors.
            </p>

          </div>


          <div className="eee-about-card">

            <div className="eee-about-icon">
              <Zap size={30} />
            </div>

            <h3>
              Electrical & Electronics Engineering
            </h3>

            <p>
              Developing technical knowledge and practical skills in
              electrical power systems, electrical machines,
              measurements, control systems and power electronics.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOD
      ===================================================== */}

      <section className="eee-section">

        <SectionTitle icon={UserRound}>
          Head of the Department
        </SectionTitle>


        <div className="eee-hod">

          <div className="eee-hod-photo">

            <img
              src="/images/departments/eee/hod.jpg"
              alt="Sri N. Srinivasa Rao"
              onError={(e) => {
                e.currentTarget.style.display = "none";

                e.currentTarget.parentElement.classList.add(
                  "eee-image-placeholder"
                );
              }}
            />

            <div className="eee-hod-placeholder">

              <UserRound size={48} />

              <span>HOD</span>

            </div>

          </div>


          <div className="eee-hod-details">

            <span className="eee-small-label">
              HEAD OF DEPARTMENT
            </span>


            <h3>
              Sri N. Srinivasa Rao
            </h3>


            <p className="eee-hod-role">
              Head of Department — Electrical & Electronics Engineering
            </p>


            <div className="eee-hod-info">

              <p>
                He was appointed as{" "}
                <strong>
                  Lecturer in the Department of Electrical and
                  Electronics Engineering (EEE)
                </strong>{" "}
                in the{" "}
                <strong>
                  Department of Technical Education
                </strong>{" "}
                on{" "}
                <strong>
                  12th July 1995
                </strong>.
              </p>


              <p>
                Since his appointment, he has been actively involved
                in teaching and academic activities in the field of
                Electrical and Electronics Engineering.
              </p>


              <p>
                He has been serving in Government Polytechnic
                institutions under the Department of Technical
                Education and has gained extensive experience in
                technical teaching and student guidance.
              </p>


              <p>
                Over the years, he has contributed to the development
                of students by imparting technical knowledge and
                supporting various academic programs in Electrical
                Engineering.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          EDUCATIONAL QUALIFICATIONS
      ===================================================== */}

      <section className="eee-section">

        <SectionTitle icon={GraduationCap}>
          Educational Qualifications
        </SectionTitle>


        <div className="eee-qualification-grid">

          <div className="eee-qualification-card">

            <div className="eee-qualification-icon">

              <GraduationCap size={25} />

            </div>


            <div>

              <span>
                Bachelor of Technology
              </span>

              <h3>
                B.Tech – Electrical & Electronics Engineering
              </h3>

              <p>
                Jawaharlal Nehru Technological University Kakinada,
                Kakinada
              </p>

            </div>

          </div>


          <div className="eee-qualification-card">

            <div className="eee-qualification-icon">

              <GraduationCap size={25} />

            </div>


            <div>

              <span>
                Master of Technology
              </span>

              <h3>
                M.Tech – Power Systems
              </h3>

              <p>
                Jawaharlal Nehru Technological University Kakinada,
                Kakinada
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PROFESSIONAL EXPERIENCE
      ===================================================== */}

      <section className="eee-section">

        <SectionTitle icon={Award}>
          Professional Experience
        </SectionTitle>


        <div className="eee-experience-card">

          <div className="eee-experience-icon">

            <CalendarDays size={28} />

          </div>


          <div>

            <span className="eee-experience-label">
              DEPARTMENT OF TECHNICAL EDUCATION
            </span>


            <h3>
              Experience since 12-07-1995
            </h3>


            <p>
              Sri N. Srinivasa Rao has been working in the{" "}
              <strong>
                Department of Technical Education
              </strong>{" "}
              since{" "}
              <strong>
                12-07-1995
              </strong>{" "}
              and has several years of teaching experience in the{" "}
              <strong>
                Department of Electrical and Electronics Engineering
                (EEE)
              </strong>{" "}
              in Government Polytechnic colleges.
            </p>


            <p>
              He has gained extensive experience in technical
              teaching and student guidance and has contributed to
              various academic activities and programmes in the
              field of Electrical Engineering.
            </p>


            <p>
              He continues to contribute to the academic development
              and learning of students in the Electrical and
              Electronics Engineering department.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          VISION & MISSION
      ===================================================== */}

      <section className="eee-section">

        <div className="eee-vision-mission">

          {/* VISION */}

          <div className="eee-vm-card vision">

            <div className="eee-vm-icon">

              <Lightbulb size={26} />

            </div>


            <div>

              <span>
                VISION OF THE DEPARTMENT
              </span>


              <p>
                To prepare an effective and socially responsible
                Electrical Engineer to serve the future needs and
                challenges of the society.
              </p>

            </div>

          </div>


          {/* MISSION */}

          <div className="eee-vm-card mission">

            <div className="eee-vm-icon">

              <Target size={26} />

            </div>


            <div>

              <span>
                MISSION OF THE DEPARTMENT
              </span>


              <div className="eee-mission-list">

                <p>
                  <strong>M1:</strong>{" "}
                  To provide adequate knowledge in the field of
                  Electrical and Electronics Engineering to take the
                  real time challenges with professional skills.
                </p>


                <p>
                  <strong>M2:</strong>{" "}
                  To enhance continuous learning skills to meet
                  employability objectives.
                </p>


                <p>
                  <strong>M3:</strong>{" "}
                  To impart strong ethical qualities among students
                  for serving the society.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FACULTY
      ===================================================== */}

      <section className="eee-section">

        <div className="eee-section-heading-row">

          <SectionTitle icon={Users}>
            Faculty Details
          </SectionTitle>


          <span className="eee-faculty-count">
            {faculty.length} Faculty Members
          </span>

        </div>


        <div className="eee-faculty-grid">

          {faculty.map((member) => (

            <article
              className="eee-faculty-card"
              key={member.name}
            >

              <div className="eee-faculty-photo">

                <img
                  src={member.image}
                  alt={member.name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";

                    e.currentTarget.parentElement.classList.add(
                      "eee-faculty-image-placeholder"
                    );
                  }}
                />


                <div className="eee-faculty-placeholder">

                  <UserRound size={38} />

                  <span>
                    Faculty
                  </span>

                </div>

              </div>


              <div className="eee-faculty-details">

                <span className="eee-faculty-designation">
                  {member.designation}
                </span>


                <h3>
                  {member.name}
                </h3>


                <div className="eee-faculty-profile">

                  <span>
                    Electrical & Electronics Engineering
                  </span>

                </div>


                <button
                  type="button"
                  className="eee-profile-btn"
                  onClick={() => {
                    document
                      .getElementById("eee-faculty-profile-note")
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
          id="eee-faculty-profile-note"
          className="eee-profile-note"
        >

          <Info size={18} />

          <span>
            Faculty names and designations are displayed from the
            Electrical and Electronics Engineering department
            information provided for Government Polytechnic College,
            Masab Tank.
          </span>

        </div>

      </section>


      {/* =====================================================
          LABORATORIES
      ===================================================== */}

      <section className="eee-section">

        <SectionTitle icon={FlaskConical}>
          Laboratories & Learning Facilities
        </SectionTitle>


        <div className="eee-facilities-grid">

          {facilities.map((facility) => {

            const Icon = facility.icon;

            return (

              <div
                className="eee-facility-card"
                key={facility.title}
              >

                <div className="eee-facility-icon">

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
          PROGRAMME
      ===================================================== */}

      <section className="eee-section">

        <SectionTitle icon={GraduationCap}>
          Programme Information
        </SectionTitle>


        <div className="eee-program-card">

          <div className="eee-program-icon">

            <Zap size={38} />

          </div>


          <div>

            <span className="eee-program-label">
              DIPLOMA PROGRAMME
            </span>


            <h3>
              Diploma in Electrical & Electronics Engineering
            </h3>


            <p>
              The Electrical and Electronics Engineering programme
              provides students with theoretical knowledge and
              practical exposure in electrical circuits, electrical
              machines, power systems, control systems, electrical
              measurements, power electronics and related
              technologies.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}