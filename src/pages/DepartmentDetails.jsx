import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  GraduationCap,
  Laptop,
  Network,
  UserRound,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./DepartmentDetails.css";

function DepartmentDetails() {
  return (
    <main className="cse-department-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="site-hero cse-hero">

        <div className="container cse-hero-grid">

          <div className="cse-hero-content">

            <Link
              to="/departments"
              className="back-department-link"
            >
              <ArrowLeft size={16} />
              Back to Departments
            </Link>

            <span className="cse-eyebrow">
              ACADEMIC DEPARTMENT
            </span>

            <h1>
              Computer Science
              <span>& Engineering</span>
            </h1>

            <p>
              Building strong foundations in computer science,
              programming, software development and modern
              computing technologies through practical,
              industry-oriented education.
            </p>

            <div className="cse-hero-tags">
              <span>Programming</span>
              <span>Software Development</span>
              <span>Computer Networks</span>
              <span>Database Systems</span>
            </div>

          </div>


          <div className="cse-hero-visual">

            <div className="cse-visual-circle">

              <Cpu size={48} />

              <strong>CSE</strong>

              <span>
                Computer Science & Engineering
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          INTRODUCTION
      ===================================================== */}

      <section className="cse-introduction">

        <div className="container">

          <div className="cse-introduction-grid">

            <div>

              <span className="cse-section-label">
                ABOUT THE DEPARTMENT
              </span>

              <h2>
                Developing tomorrow's technology professionals.
              </h2>

            </div>


            <div>

              <p>
                The Computer Science & Engineering department
                provides students with a strong foundation in
                computer programming, software development,
                databases, networking and modern computing
                technologies.
              </p>

              <p>
                Students are encouraged to develop practical
                skills through laboratory work, projects,
                technical activities and problem-solving
                exercises.
              </p>

              <p>
                The department focuses on combining theoretical
                knowledge with practical implementation so that
                students are prepared for higher education,
                employment and professional development.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          VISION & MISSION
      ===================================================== */}

      <section className="cse-vision-section">

        <div className="container">

          <div className="cse-section-heading">

            <span>
              OUR DIRECTION
            </span>

            <h2>
              Vision & Mission
            </h2>

            <p>
              Building a strong academic environment focused
              on knowledge, innovation and practical skills.
            </p>

          </div>


          <div className="vision-mission-grid">

            {/* VISION */}

            <article className="vision-card">

              <div className="vision-icon">
                <GraduationCap size={25} />
              </div>

              <span>
                OUR VISION
              </span>

              <h3>
                Excellence in Computer Science Education
              </h3>

              <p>
                To provide quality technical education in
                computer science and engineering and develop
                skilled, responsible and innovative
                professionals.
              </p>

            </article>


            {/* MISSION */}

            <article className="mission-card">

              <div className="vision-icon">
                <CheckCircle2 size={25} />
              </div>

              <span>
                OUR MISSION
              </span>

              <ul>

                <li>
                  <CheckCircle2 size={17} />
                  <span>
                    Provide strong theoretical and practical
                    knowledge in computer science.
                  </span>
                </li>

                <li>
                  <CheckCircle2 size={17} />
                  <span>
                    Encourage programming, problem-solving
                    and logical thinking skills.
                  </span>
                </li>

                <li>
                  <CheckCircle2 size={17} />
                  <span>
                    Provide hands-on laboratory and project
                    experience.
                  </span>
                </li>

                <li>
                  <CheckCircle2 size={17} />
                  <span>
                    Prepare students for higher education
                    and professional careers.
                  </span>
                </li>

              </ul>

            </article>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOD
      ===================================================== */}

      <section className="cse-hod-section">

        <div className="container">

          <div className="cse-section-heading">

            <span>
              DEPARTMENT LEADERSHIP
            </span>

            <h2>
              Head of the Department
            </h2>

            <p>
              Academic leadership supporting teaching,
              learning and departmental development.
            </p>

          </div>


          <div className="hod-card">

            <div className="hod-photo-placeholder">

              <UserRound size={72} />

              <span>
                HOD Photo
              </span>

            </div>


            <div className="hod-information">

              <span className="hod-label">
                HEAD OF DEPARTMENT
              </span>

              <h3>
                Computer Science & Engineering
              </h3>

              <p className="hod-designation">
                Head of the Department
              </p>


              <div className="hod-details">

                <div>
                  <strong>
                    Department
                  </strong>

                  <span>
                    Computer Science & Engineering
                  </span>
                </div>


                <div>
                  <strong>
                    Institution
                  </strong>

                  <span>
                    Government Polytechnic College,
                    Masab Tank
                  </span>
                </div>


                <div>
                  <strong>
                    Location
                  </strong>

                  <span>
                    Masab Tank, Hyderabad
                  </span>
                </div>


                <div>
                  <strong>
                    Education
                  </strong>

                  <span>
                    Technical Education
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FACULTY
      ===================================================== */}

      <section className="cse-faculty-section">

        <div className="container">

          <div className="cse-section-heading">

            <span>
              OUR TEAM
            </span>

            <h2>
              Faculty
            </h2>

            <p>
              Experienced faculty members supporting students
              throughout their academic journey.
            </p>

          </div>


          <div className="faculty-placeholder-grid">

            <article className="faculty-placeholder-card">

              <div className="faculty-placeholder-photo">
                <UserRound size={38} />
              </div>

              <h3>
                Faculty Member
              </h3>

              <span>
                Lecturer
              </span>

              <p>
                Computer Science & Engineering
              </p>

              <button type="button">
                Faculty Profile
              </button>

            </article>


            <article className="faculty-placeholder-card">

              <div className="faculty-placeholder-photo">
                <UserRound size={38} />
              </div>

              <h3>
                Faculty Member
              </h3>

              <span>
                Lecturer
              </span>

              <p>
                Computer Science & Engineering
              </p>

              <button type="button">
                Faculty Profile
              </button>

            </article>


            <article className="faculty-placeholder-card">

              <div className="faculty-placeholder-photo">
                <UserRound size={38} />
              </div>

              <h3>
                Faculty Member
              </h3>

              <span>
                Lecturer
              </span>

              <p>
                Computer Science & Engineering
              </p>

              <button type="button">
                Faculty Profile
              </button>

            </article>

          </div>

        </div>

      </section>


      {/* =====================================================
          LABORATORIES
      ===================================================== */}

      <section className="cse-labs-section">

        <div className="container">

          <div className="cse-section-heading">

            <span>
              PRACTICAL LEARNING
            </span>

            <h2>
              Laboratories
            </h2>

            <p>
              Practical learning environments that help
              students develop technical and programming skills.
            </p>

          </div>


          <div className="labs-grid">

            <article className="lab-card">

              <div className="lab-icon">
                <Laptop size={25} />
              </div>

              <h3>
                Programming Laboratory
              </h3>

              <p>
                Practical training in programming languages,
                algorithms, data structures and problem solving.
              </p>

            </article>


            <article className="lab-card">

              <div className="lab-icon">
                <Code2 size={25} />
              </div>

              <h3>
                Web Technology Laboratory
              </h3>

              <p>
                Hands-on learning in HTML, CSS, JavaScript,
                web development and modern web technologies.
              </p>

            </article>


            <article className="lab-card">

              <div className="lab-icon">
                <Database size={25} />
              </div>

              <h3>
                Database Laboratory
              </h3>

              <p>
                Practical experience with database concepts,
                SQL, data management and database applications.
              </p>

            </article>


            <article className="lab-card">

              <div className="lab-icon">
                <Network size={25} />
              </div>

              <h3>
                Computer Networks Laboratory
              </h3>

              <p>
                Practical understanding of networking,
                communication systems and network configuration.
              </p>

            </article>


            <article className="lab-card">

              <div className="lab-icon">
                <Cpu size={25} />
              </div>

              <h3>
                Computer Hardware Laboratory
              </h3>

              <p>
                Learning about computer components,
                hardware configuration and troubleshooting.
              </p>

            </article>


            <article className="lab-card">

              <div className="lab-icon">
                <BookOpen size={25} />
              </div>

              <h3>
                Software & Project Laboratory
              </h3>

              <p>
                Project-based learning that allows students
                to apply their technical knowledge to practical
                problems.
              </p>

            </article>

          </div>

        </div>

      </section>

    </main>
  );
}

export default DepartmentDetails;