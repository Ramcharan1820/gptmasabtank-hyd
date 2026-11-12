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
  Radio,
  Cpu,
  CircuitBoard,
  ChevronRight,
} from "lucide-react";

import "./ECEDepartment.css";

/* =========================================================
   ECE FACULTY
========================================================= */

const faculty = [
  {
    name: "K. SAI PRASHANTH",
    designation: "LECTURER",
    image: "/images/departments/ece/k-sai-prashanth.jpg",
  },
  {
    name: "RAMANJANEYULU",
    designation: "LECTURER",
    employeeId: "Emp.ID: 4515108",
    image: "/images/departments/ece/ramanjaneyulu.jpg",
  },
  {
    name: "REFAI",
    designation: "LECTURER",
    image: "/images/departments/ece/refai.jpg",
  },
  {
    name: "E. BAGA REDDY",
    designation: "LECTURER",
    image: "/images/departments/ece/e-baga-reddy.jpg",
  },
];


/* =========================================================
   ECE LABORATORIES / FACILITIES
========================================================= */

const facilities = [
  {
    icon: CircuitBoard,
    title: "Electronics Laboratory",
    description:
      "Practical learning environment for electronic circuits, devices and fundamental electronics concepts.",
  },
  {
    icon: Radio,
    title: "Communication Laboratory",
    description:
      "Practical exposure to communication systems, signals and modern communication technologies.",
  },
  {
    icon: Cpu,
    title: "Digital Electronics Laboratory",
    description:
      "Hands-on learning in digital circuits, logic systems, microprocessors and digital technologies.",
  },
  {
    icon: FlaskConical,
    title: "Embedded Systems Laboratory",
    description:
      "Practical study of embedded systems, controllers and electronic applications used in modern technology.",
  },
];


/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="ece-section-title">
      <span className="ece-title-line"></span>

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

export default function ECEDepartment() {
  return (
    <main className="ece-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="site-hero ece-hero">

        <div className="ece-hero-inner">

          <div>

            <span className="ece-hero-label">
              GOVERNMENT POLYTECHNIC COLLEGE
            </span>

            <h1>
              Department of Electronics
              <br />
              & Communication Engineering
            </h1>

            <p>
              Government Polytechnic College, Masab Tank, Hyderabad
            </p>

          </div>


          <div className="ece-breadcrumb">

            <a href="/">
              Home
            </a>

            <ChevronRight size={15} />

            <a href="/departments">
              Departments
            </a>

            <ChevronRight size={15} />

            <span>
              ECE
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="ece-stats">

        <div className="ece-stat">

          <div className="ece-stat-icon">
            <Users size={24} />
          </div>

          <strong>
            {faculty.length}
          </strong>

          <span>
            Faculty Members
          </span>

        </div>


        <div className="ece-stat">

          <div className="ece-stat-icon">
            <Radio size={24} />
          </div>

          <strong>
            ECE
          </strong>

          <span>
            Electronics & Communication
          </span>

        </div>


        <div className="ece-stat">

          <div className="ece-stat-icon">
            <Cpu size={24} />
          </div>

          <strong>
            Practical
          </strong>

          <span>
            Technical Training
          </span>

        </div>


        <div className="ece-stat">

          <div className="ece-stat-icon">
            <Award size={24} />
          </div>

          <strong>
            Diploma
          </strong>

          <span>
            Engineering Programme
          </span>

        </div>

      </section>


      {/* =====================================================
          ABOUT DEPARTMENT
      ===================================================== */}

      <section className="ece-section">

        <SectionTitle icon={Info}>
          About the Department
        </SectionTitle>


        <div className="ece-about-grid">

          <div className="ece-about-content">

            <div className="ece-established">

              <CalendarDays size={18} />

              <span>
                Department of Electronics & Communication Engineering
              </span>

            </div>


            <p>
              The Electronics and Communication Engineering (ECE)
              Department deals with electronic circuits, communication
              systems, and modern electronic technologies.
            </p>


            <p>
              The curriculum includes subjects such as electronic
              devices, digital electronics, microprocessors,
              communication systems, and embedded systems. Through
              laboratory experiments and projects, students learn how
              electronic devices and communication technologies operate
              in real-world applications.
            </p>


            <p>
              The department prepares students for careers in
              electronics manufacturing, telecommunications, embedded
              system design and other technology-oriented industries.
            </p>

          </div>


          <div className="ece-about-card">

            <div className="ece-about-icon">

              <CircuitBoard size={30} />

            </div>


            <h3>
              Electronics & Communication Engineering
            </h3>


            <p>
              Developing technical knowledge and practical skills in
              electronics, communication systems, digital technologies
              and embedded systems.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOD
      ===================================================== */}

      <section className="ece-section">

        <SectionTitle icon={UserRound}>
          Head of the Department
        </SectionTitle>


        <div className="ece-hod">

          <div className="ece-hod-photo">

            <img
              src="/images/departments/ece/hod.jpg"
              alt="Sri Boda Raja"
              onError={(e) => {

                e.currentTarget.style.display = "none";

                e.currentTarget.parentElement.classList.add(
                  "ece-image-placeholder"
                );

              }}
            />


            <div className="ece-hod-placeholder">

              <UserRound size={48} />

              <span>
                HOD
              </span>

            </div>

          </div>


          <div className="ece-hod-details">

            <span className="ece-small-label">
              HEAD OF DEPARTMENT
            </span>


            <h3>
              Sri Boda Raja
            </h3>


            <p className="ece-hod-role">
              Head of Department — Electronics & Communication Engineering
            </p>


            <div className="ece-hod-info">

              <p>
                He was appointed as{" "}
                <strong>
                  Lecturer in the Department of Electronics and
                  Communication Engineering (ECE)
                </strong>{" "}
                in the Department of Technical Education on{" "}
                <strong>
                  22nd March 1996
                </strong>.
              </p>


              <p>
                Since his appointment, he has been actively involved
                in teaching and academic activities in the field of
                Electronics and Communication Engineering.
              </p>


              <p>
                Over the years, he has gained extensive teaching
                experience in Government Polytechnic institutions
                under the Department of Technical Education. He has
                contributed to the academic development of students
                by imparting technical knowledge and guiding them in
                their studies.
              </p>


              <p>
                At present, he is serving as the{" "}
                <strong>
                  Head of the Department (HOD) – Electronics and
                  Communication Engineering (ECE).
                </strong>
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          EDUCATIONAL QUALIFICATIONS
      ===================================================== */}

      <section className="ece-section">

        <SectionTitle icon={GraduationCap}>
          Educational Qualifications
        </SectionTitle>


        <div className="ece-qualification-grid">

          <div className="ece-qualification-card">

            <div className="ece-qualification-icon">

              <GraduationCap size={25} />

            </div>


            <div>

              <span>
                Bachelor of Engineering
              </span>

              <h3>
                B.E – Electronics and Communication Engineering
              </h3>

              <p>
                MVSR Engineering College
              </p>

            </div>

          </div>


          <div className="ece-qualification-card">

            <div className="ece-qualification-icon">

              <GraduationCap size={25} />

            </div>


            <div>

              <span>
                Master of Engineering
              </span>

              <h3>
                M.E – Digital Systems Engineering
              </h3>

              <p>
                Osmania University, Hyderabad, Telangana
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PROFESSIONAL EXPERIENCE
      ===================================================== */}

      <section className="ece-section">

        <SectionTitle icon={Award}>
          Professional Experience
        </SectionTitle>


        <div className="ece-experience-card">

          <div className="ece-experience-icon">

            <CalendarDays size={28} />

          </div>


          <div>

            <span className="ece-experience-label">
              DEPARTMENT OF TECHNICAL EDUCATION
            </span>


            <h3>
              Experience since 22-03-1996
            </h3>


            <p>
              Sri Boda Raja has been working in the{" "}
              <strong>
                Department of Technical Education
              </strong>{" "}
              since <strong>22-03-1996</strong> and has several years
              of teaching experience in Government Polytechnic colleges.
            </p>


            <p>
              He worked as{" "}
              <strong>
                Principal (FAC)
              </strong>{" "}
              for 3 years, from <strong>2018 to 2021</strong>, at
              GPT Nandipet.
            </p>


            <p>
              He is currently serving as{" "}
              <strong>
                Head of the Department of Electronics and Communication
                Engineering (ECE)
              </strong>
              , contributing to academic development and student learning.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          VISION & MISSION
      ===================================================== */}

      <section className="ece-section">

        <div className="ece-vision-mission">

          {/* VISION */}

          <div className="ece-vm-card vision">

            <div className="ece-vm-icon">

              <Lightbulb size={26} />

            </div>


            <div>

              <span>
                VISION OF THE DEPARTMENT
              </span>


              <p>
                To provide quality technical education and professional
                skills in Electronics and Communication Engineering by
                creating effective teaching learning environment with
                practical exposure to make the students industry ready
                or pursue higher education.
              </p>

            </div>

          </div>


          {/* MISSION */}

          <div className="ece-vm-card mission">

            <div className="ece-vm-icon">

              <Target size={26} />

            </div>


            <div>

              <span>
                MISSION OF THE DEPARTMENT
              </span>


              <div className="ece-mission-list">

                <p>
                  <strong>
                    M1:
                  </strong>{" "}
                  To impart quality technical education in the field
                  of Electronics and Communication Engineering with
                  practical exposure to the technological advancements,
                  making the students industry ready.
                </p>


                <p>
                  <strong>
                    M2:
                  </strong>{" "}
                  To ensure that the students excel with good academic
                  discipline and professional competency.
                </p>


                <p>
                  <strong>
                    M3:
                  </strong>{" "}
                  To prepare the students for continuing their higher
                  education.
                </p>


                <p>
                  <strong>
                    M4:
                  </strong>{" "}
                  To develop the professional and ethical values among
                  the students.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FACULTY
      ===================================================== */}

      <section className="ece-section">

        <div className="ece-section-heading-row">

          <SectionTitle icon={Users}>
            Faculty Details
          </SectionTitle>


          <span className="ece-faculty-count">
            {faculty.length} Faculty Members
          </span>

        </div>


        <div className="ece-faculty-grid">

          {faculty.map((member) => (

            <article
              className="ece-faculty-card"
              key={member.name}
            >

              <div className="ece-faculty-photo">

                <img
                  src={member.image}
                  alt={member.name}
                  onError={(e) => {

                    e.currentTarget.style.display = "none";

                    e.currentTarget.parentElement.classList.add(
                      "ece-faculty-image-placeholder"
                    );

                  }}
                />


                <div className="ece-faculty-placeholder">

                  <UserRound size={38} />

                  <span>
                    Faculty
                  </span>

                </div>

              </div>


              <div className="ece-faculty-details">

                <span className="ece-faculty-designation">
                  {member.designation}
                </span>


                <h3>
                  {member.name}
                </h3>


                {member.employeeId && (
                  <div className="ece-faculty-employee">

                    {member.employeeId}

                  </div>
                )}


                <div className="ece-faculty-profile">

                  <span>
                    Electronics & Communication Engineering
                  </span>

                </div>


                <button
                  type="button"
                  className="ece-profile-btn"
                  onClick={() => {
                    document
                      .getElementById("ece-faculty-profile-note")
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
          id="ece-faculty-profile-note"
          className="ece-profile-note"
        >

          <Info size={18} />

          <span>
            Faculty names and designations are displayed from the
            Electronics & Communication Engineering department
            information provided for Government Polytechnic College,
            Masab Tank.
          </span>

        </div>

      </section>


      {/* =====================================================
          FACILITIES
      ===================================================== */}

      <section className="ece-section">

        <SectionTitle icon={FlaskConical}>
          Laboratories & Learning Facilities
        </SectionTitle>


        <div className="ece-facilities-grid">

          {facilities.map((facility) => {

            const Icon = facility.icon;

            return (

              <div
                className="ece-facility-card"
                key={facility.title}
              >

                <div className="ece-facility-icon">

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

      <section className="ece-section">

        <SectionTitle icon={GraduationCap}>
          Programme Information
        </SectionTitle>


        <div className="ece-program-card">

          <div className="ece-program-icon">

            <Radio size={38} />

          </div>


          <div>

            <span className="ece-program-label">
              DIPLOMA PROGRAMME
            </span>


            <h3>
              Diploma in Electronics & Communication Engineering
            </h3>


            <p>
              The Electronics and Communication Engineering programme
              provides students with theoretical knowledge and
              practical exposure in electronic devices, digital
              electronics, communication systems, microprocessors,
              embedded systems and related technologies.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}