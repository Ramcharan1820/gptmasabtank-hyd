import React from "react";
import {
  Info,
  UserRound,
  Eye,
  Target,
  GraduationCap,
  Award,
  Building2,
  Ruler,
  HardHat,
  Factory,
  Map,
  ChevronRight,
} from "lucide-react";

import "./CivilDepartment.css";

const CivilDepartment = () => {
  const faculty = [
    {
      name: "V. KRISHNAIAH",
      image: "/images/departments/civil/v-krishnaiah.jpg",
    },
    {
      name: "SANDEEP",
      image: "/images/departments/civil/sandeep.jpg",
    },
    {
      name: "KHAJA",
      image: "/images/departments/civil/khaja.jpg",
    },
    {
      name: "G. RAKESH",
      image: "/images/departments/civil/g-rakesh.jpg",
    },
    {
      name: "J. HARIKA",
      image: "/images/departments/civil/j-harika.jpg",
    },
  ];

  return (
    <div className="civil-page">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="civil-hero">
        <div className="civil-hero-overlay">

          <div className="civil-hero-content">

            <div className="civil-hero-icon">
              <Building2 size={42} strokeWidth={1.8} />
            </div>

            <div>
              <p className="civil-hero-label">
                DEPARTMENT OF
              </p>

              <h1>
                CIVIL ENGINEERING
              </h1>

              <p className="civil-hero-subtitle">
                Government Polytechnic College, Masab Tank
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="civil-container">


        {/* =================================================
            BREADCRUMB
        ================================================= */}
        <div className="civil-breadcrumb">

          <span>
            Departments
          </span>

          <ChevronRight size={16} />

          <span className="active">
            Civil Engineering
          </span>

        </div>


        {/* =================================================
            HOD SECTION
        ================================================= */}
        <section className="civil-section civil-hod-section">

          <div className="civil-section-heading">

            <div className="civil-section-icon">
              <UserRound size={24} />
            </div>

            <div>

              <p className="civil-section-label">
                DEPARTMENT LEADERSHIP
              </p>

              <h2>
                Head of the Department
              </h2>

            </div>

          </div>


          <div className="civil-hod-layout">


            {/* HOD IMAGE */}
            <div className="civil-hod-image-wrapper">

              <div className="civil-hod-image">

                <img
                  src="/images/departments/civil/hod.jpg"
                  alt="Dr. C. V. V. Prasad"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";

                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display =
                        "flex";
                    }
                  }}
                />

                <div className="civil-hod-placeholder">

                  <UserRound
                    size={70}
                    strokeWidth={1.4}
                  />

                  <span>
                    HOD
                  </span>

                </div>

              </div>


              <div className="civil-hod-badge">

                <Award size={17} />

                <span>
                  Head of Department
                </span>

              </div>

            </div>


            {/* HOD INFORMATION */}
            <div className="civil-hod-content">

              <h3>
                Dr. C. V. V. PRASAD, Ph.D
              </h3>

              <p className="civil-hod-designation">
                Head of the Department - Civil Engineering
              </p>


              <p>
                He was appointed as{" "}
                <strong>Lecturer</strong> in the{" "}
                <strong>
                  Department of Technical Education
                </strong>{" "}
                on <strong>10th March 1987</strong>. He has
                been serving in the field of technical education
                for several decades and has contributed
                significantly to teaching and academic
                development.
              </p>


              <p>
                Over the years, he has worked in various
                academic positions and has gained vast
                experience in engineering education. He has
                rich teaching experience and has served in
                different capacities in Government Polytechnic
                colleges under the Department of Technical
                Education, Telangana.
              </p>


              <p>
                Through his long academic career, he has been
                actively involved in teaching, mentoring
                students, and supporting institutional
                development.
              </p>


              {/* EDUCATIONAL QUALIFICATIONS */}
              <div className="civil-info-box">

                <div className="civil-info-box-title">

                  <GraduationCap size={21} />

                  <h4>
                    Educational Qualifications
                  </h4>

                </div>


                <ul>

                  <li>

                    <span className="civil-list-dot"></span>

                    <div>
                      <strong>
                        Doctor of Philosophy (Ph.D)
                      </strong>
                    </div>

                  </li>


                  <li>

                    <span className="civil-list-dot"></span>

                    <div>

                      <strong>
                        Master of Technology
                        (M.Tech - Computer Science
                        and Engineering)
                      </strong>

                      <br />

                      Jawaharlal Nehru Technological
                      University Hyderabad, Hyderabad,
                      Telangana

                    </div>

                  </li>


                  <li>

                    <span className="civil-list-dot"></span>

                    <div>

                      <strong>
                        Bachelor of Engineering
                        (B.E - Civil Engineering)
                      </strong>

                      <br />

                      Chaitanya Bharathi Institute of
                      Technology, affiliated to
                      Osmania University

                    </div>

                  </li>

                </ul>

              </div>


              {/* PROFESSIONAL EXPERIENCE */}
              <div className="civil-info-box">

                <div className="civil-info-box-title">

                  <Award size={21} />

                  <h4>
                    Professional Experience
                  </h4>

                </div>


                <p>
                  Dr. C. V. V. Prasad has extensive
                  experience in technical education and
                  engineering teaching. He has served in
                  various capacities in Government
                  Polytechnic colleges under the Department
                  of Technical Education, Telangana.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            ABOUT DEPARTMENT
        ================================================= */}
        <section className="civil-section">

          <div className="civil-section-heading">

            <div className="civil-section-icon">
              <Info size={24} />
            </div>

            <div>

              <p className="civil-section-label">
                DEPARTMENT PROFILE
              </p>

              <h2>
                About the Department
              </h2>

            </div>

          </div>


          <div className="civil-about-content">

            <div className="civil-about-text">

              <p>
                <strong>
                  Civil Engineering
                </strong>{" "}
                is the oldest engineering discipline,
                responsible for the infrastructure that
                sustains modern life. Our program emphasizes
                sustainable construction practices,
                structural integrity, and urban planning
                using the latest CAD and surveying
                technologies.
              </p>


              <p>
                The department emphasizes subjects like
                <strong>
                  {" "}surveying, structural engineering,
                  building construction, environmental
                  engineering,{" "}
                </strong>
                and{" "}
                <strong>
                  transportation engineering.
                </strong>
                Students receive practical training in
                surveying techniques, material testing,
                and construction practices through
                specialized laboratories and fieldwork.
              </p>


              <p>
                Graduates from this department contribute
                significantly to the development of
                infrastructure and urban planning.
              </p>

            </div>


            {/* CIVIL ENGINEERING FOCUS AREAS */}
            <div className="civil-focus-grid">


              <div className="civil-focus-card">

                <div className="civil-focus-icon">
                  <Ruler size={26} />
                </div>

                <h3>
                  Surveying
                </h3>

                <p>
                  Practical training in surveying techniques,
                  measurements and modern surveying methods.
                </p>

              </div>


              <div className="civil-focus-card">

                <div className="civil-focus-icon">
                  <Building2 size={26} />
                </div>

                <h3>
                  Structural Engineering
                </h3>

                <p>
                  Study of structural systems, strength,
                  stability and structural integrity.
                </p>

              </div>


              <div className="civil-focus-card">

                <div className="civil-focus-icon">
                  <HardHat size={26} />
                </div>

                <h3>
                  Construction
                </h3>

                <p>
                  Knowledge of building construction,
                  construction practices and materials.
                </p>

              </div>


              <div className="civil-focus-card">

                <div className="civil-focus-icon">
                  <Map size={26} />
                </div>

                <h3>
                  Urban Planning
                </h3>

                <p>
                  Understanding infrastructure development,
                  transportation and urban planning.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            VISION
        ================================================= */}
        <section className="civil-section civil-vision-section">

          <div className="civil-section-heading">

            <div className="civil-section-icon">
              <Eye size={24} />
            </div>

            <div>

              <p className="civil-section-label">
                OUR DIRECTION
              </p>

              <h2>
                Vision of the Department
              </h2>

            </div>

          </div>


          <div className="civil-vision-card">

            <div className="civil-vision-icon">

              <Eye size={30} />

            </div>


            <div>

              <span>
                VISION
              </span>

              <p>
                To train and produce Skilled Civil Engineers
                and Knowledge workers in adequate numbers to
                suit the needs of Industry and Community.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            MISSION
        ================================================= */}
        <section className="civil-section">

          <div className="civil-section-heading">

            <div className="civil-section-icon">
              <Target size={24} />
            </div>

            <div>

              <p className="civil-section-label">
                OUR COMMITMENT
              </p>

              <h2>
                Mission of the Department
              </h2>

            </div>

          </div>


          <div className="civil-mission-grid">


            {/* M1 */}
            <div className="civil-mission-card">

              <div className="civil-mission-number">
                M1
              </div>

              <div>

                <h3>
                  Industry-Ready Knowledge
                </h3>

                <p>
                  The curriculum of Civil Engineering is
                  planned with the specific objective of
                  imparting up-to-date knowledge, improving
                  the skills and developing a better and
                  positive attitude in students to cater
                  the needs of the Industry.
                </p>

              </div>

            </div>


            {/* M2 */}
            <div className="civil-mission-card">

              <div className="civil-mission-number">
                M2
              </div>

              <div>

                <h3>
                  Quality Diploma Engineers
                </h3>

                <p>
                  To turn out quality Diploma Engineers
                  in Civil Engineering, trained by
                  Committed faculty with latest techniques
                  and infrastructure up to Industry
                  expectations.
                </p>

              </div>

            </div>


            {/* M3 */}
            <div className="civil-mission-card">

              <div className="civil-mission-number">
                M3
              </div>

              <div>

                <h3>
                  Practical Excellence
                </h3>

                <p>
                  The technical ingenuity is promoted
                  through Excellence in academic achievement,
                  continuous assessment, and practical skills
                  developed through Laboratory exercises,
                  in-plant training and industrial training.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            FACULTY
        ================================================= */}
        <section className="civil-section">

          <div className="civil-section-heading">

            <div className="civil-section-icon">
              <UserRound size={24} />
            </div>

            <div>

              <p className="civil-section-label">
                ACADEMIC TEAM
              </p>

              <h2>
                Faculty Details
              </h2>

            </div>

          </div>


          <div className="civil-faculty-grid">

            {faculty.map((member, index) => (

              <div
                className="civil-faculty-card"
                key={member.name}
              >

                <div className="civil-faculty-image">

                  <img
                    src={member.image}
                    alt={member.name}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";

                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display =
                          "flex";
                      }
                    }}
                  />

                  <div className="civil-faculty-placeholder">

                    <UserRound
                      size={50}
                      strokeWidth={1.5}
                    />

                  </div>

                </div>


                <div className="civil-faculty-content">

                  <span className="civil-faculty-number">
                    FACULTY {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3>
                    {member.name}
                  </h3>

                </div>

              </div>

            ))}

          </div>

        </section>


        {/* =================================================
            DEPARTMENT AT A GLANCE
        ================================================= */}
        <section className="civil-section civil-strength-section">

          <div className="civil-section-heading">

            <div className="civil-section-icon">
              <Factory size={24} />
            </div>

            <div>

              <p className="civil-section-label">
                LEARNING & PRACTICAL TRAINING
              </p>

              <h2>
                Civil Engineering at a Glance
              </h2>

            </div>

          </div>


          <div className="civil-strength-grid">


            <div className="civil-strength-card">

              <Ruler size={30} />

              <h3>
                Surveying
              </h3>

              <p>
                Practical surveying techniques and
                field-based measurements.
              </p>

            </div>


            <div className="civil-strength-card">

              <Building2 size={30} />

              <h3>
                Structures
              </h3>

              <p>
                Structural engineering and construction
                fundamentals.
              </p>

            </div>


            <div className="civil-strength-card">

              <HardHat size={30} />

              <h3>
                Construction
              </h3>

              <p>
                Building construction and practical
                construction techniques.
              </p>

            </div>


            <div className="civil-strength-card">

              <Map size={30} />

              <h3>
                Infrastructure
              </h3>

              <p>
                Infrastructure development and urban
                planning concepts.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            FOOTER NOTE
        ================================================= */}
        <div className="civil-bottom-note">

          <Building2 size={18} />

          <span>
            Civil Engineering Department • Government
            Polytechnic College, Masab Tank
          </span>

        </div>

      </main>

    </div>
  );
};

export default CivilDepartment;