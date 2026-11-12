import React from "react";
import {
  Info,
  UserRound,
  Eye,
  Target,
  GraduationCap,
  Award,
  Settings,
  Wrench,
  Factory,
  Cog,
  Thermometer,
  Droplets,
  ChevronRight,
} from "lucide-react";

import "./MechanicalDepartment.css";

const MechanicalDepartment = () => {
  return (
    <div className="mechanical-page">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="site-hero mechanical-hero">
        <div className="mechanical-hero-overlay">
          <div className="mechanical-hero-content">

            <div className="mechanical-hero-icon">
              <Cog size={42} strokeWidth={1.8} />
            </div>

            <div>
              <p className="mechanical-hero-label">
                DEPARTMENT OF
              </p>

              <h1>
                MECHANICAL ENGINEERING
              </h1>

              <p className="mechanical-hero-subtitle">
                Government Polytechnic College, Masab Tank
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="mechanical-container">


        {/* =================================================
            BREADCRUMB
        ================================================= */}
        <div className="mechanical-breadcrumb">
          <span>Departments</span>
          <ChevronRight size={16} />
          <span className="active">
            Mechanical Engineering
          </span>
        </div>


        {/* =================================================
            HOD SECTION
        ================================================= */}
        <section className="mechanical-section mechanical-hod-section">

          <div className="mechanical-section-heading">
            <div className="mechanical-section-icon">
              <UserRound size={24} />
            </div>

            <div>
              <p className="mechanical-section-label">
                DEPARTMENT LEADERSHIP
              </p>

              <h2>
                Head of the Department
              </h2>
            </div>
          </div>


          <div className="mechanical-hod-layout">

            {/* HOD IMAGE */}
            <div className="mechanical-hod-image-wrapper">

              <div className="mechanical-hod-image">

                <img
                  src="/images/departments/mechanical/hod.jpg"
                  alt="Smt. N. Rajitha Rani"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling.style.display = "flex";
                  }}
                />

                <div className="mechanical-hod-placeholder">
                  <UserRound size={70} strokeWidth={1.4} />
                  <span>HOD</span>
                </div>

              </div>

              <div className="mechanical-hod-badge">
                <Award size={17} />
                <span>Head of Department</span>
              </div>

            </div>


            {/* HOD INFORMATION */}
            <div className="mechanical-hod-content">

              <h3>
                Smt. N. Rajitha Rani
              </h3>

              <p className="mechanical-hod-designation">
                Head of the Department - Mechanical Engineering
              </p>

              <p>
                She was appointed as <strong>Lecturer in the
                Department of Mechanical Engineering</strong> in the
                <strong> Department of Technical Education</strong> on
                <strong> 28th July 1999</strong>. Since her appointment,
                she has been actively involved in teaching and academic
                activities in the field of Mechanical Engineering.
              </p>

              <p>
                Over the years, she has gained extensive teaching
                experience in Government Polytechnic institutions
                under the Department of Technical Education. She has
                been dedicated to guiding students, strengthening
                their technical knowledge, and contributing to
                academic and institutional development.
              </p>

              <p>
                At present, she is serving as the
                <strong> Head of the Department (HOD) -
                Mechanical Engineering.</strong>
              </p>


              {/* QUALIFICATIONS */}
              <div className="mechanical-info-box">

                <div className="mechanical-info-box-title">
                  <GraduationCap size={21} />
                  <h4>Educational Qualifications</h4>
                </div>

                <ul>
                  <li>
                    <span className="mechanical-list-dot"></span>
                    <div>
                      <strong>Bachelor of Technology (B.Tech)</strong>
                      <br />
                      Jawaharlal Nehru Technological University
                      Hyderabad, Hyderabad
                    </div>
                  </li>

                  <li>
                    <span className="mechanical-list-dot"></span>
                    <div>
                      <strong>
                        Master of Technology (M.Tech -
                        Thermal Engineering)
                      </strong>
                      <br />
                      Jawaharlal Nehru Technological University
                      Hyderabad, Hyderabad, Telangana
                    </div>
                  </li>
                </ul>

              </div>


              {/* EXPERIENCE */}
              <div className="mechanical-info-box">

                <div className="mechanical-info-box-title">
                  <Award size={21} />
                  <h4>Professional Experience</h4>
                </div>

                <p>
                  Smt. N. Rajitha Rani has been working in the
                  <strong> Department of Technical Education</strong>
                  since <strong>28-07-1999</strong> and has
                  <strong> 26 years of teaching experience</strong>
                  in Government Polytechnic colleges. She is
                  currently serving as
                  <strong> Head of the Department of Mechanical
                  Engineering</strong>, contributing to academic
                  excellence and student development.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            ABOUT DEPARTMENT
        ================================================= */}
        <section className="mechanical-section">

          <div className="mechanical-section-heading">

            <div className="mechanical-section-icon">
              <Info size={24} />
            </div>

            <div>
              <p className="mechanical-section-label">
                DEPARTMENT PROFILE
              </p>

              <h2>
                About the Department
              </h2>
            </div>

          </div>


          <div className="mechanical-about-content">

            <div className="mechanical-about-text">

              <p>
                The <strong>Mechanical Engineering Department</strong>
                focuses on the design, manufacturing, and maintenance
                of mechanical systems and machines. This department
                covers fundamental areas such as
                <strong> thermodynamics, fluid mechanics,
                manufacturing technology, machine design,</strong>
                and <strong>production engineering.</strong>
              </p>

              <p>
                Students gain hands-on experience in workshops
                including <strong>fitting, welding, machining,</strong>
                and thermal engineering laboratories. Mechanical
                Engineering plays a crucial role in industrial
                production, manufacturing processes, and machinery
                maintenance.
              </p>

            </div>


            {/* DEPARTMENT AREAS */}
            <div className="mechanical-focus-grid">

              <div className="mechanical-focus-card">
                <div className="mechanical-focus-icon">
                  <Cog size={26} />
                </div>
                <h3>Machine Design</h3>
                <p>
                  Understanding mechanical systems, components,
                  machines and design principles.
                </p>
              </div>


              <div className="mechanical-focus-card">
                <div className="mechanical-focus-icon">
                  <Thermometer size={26} />
                </div>
                <h3>Thermal Engineering</h3>
                <p>
                  Study of thermodynamics, heat transfer and
                  thermal systems.
                </p>
              </div>


              <div className="mechanical-focus-card">
                <div className="mechanical-focus-icon">
                  <Factory size={26} />
                </div>
                <h3>Manufacturing</h3>
                <p>
                  Practical knowledge of manufacturing processes
                  and industrial production.
                </p>
              </div>


              <div className="mechanical-focus-card">
                <div className="mechanical-focus-icon">
                  <Wrench size={26} />
                </div>
                <h3>Workshop Practice</h3>
                <p>
                  Hands-on experience in fitting, welding and
                  machining operations.
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            VISION
        ================================================= */}
        <section className="mechanical-section mechanical-vision-section">

          <div className="mechanical-section-heading">

            <div className="mechanical-section-icon">
              <Eye size={24} />
            </div>

            <div>
              <p className="mechanical-section-label">
                OUR DIRECTION
              </p>

              <h2>
                Vision of the Department
              </h2>
            </div>

          </div>


          <div className="mechanical-vision-card">

            <div className="mechanical-vision-icon">
              <Eye size={30} />
            </div>

            <div>
              <span>VISION</span>

              <p>
                To train and produce skilled Mechanical Engineers
                and knowledge workers in adequate numbers to suit
                the needs of Industry and Community.
              </p>
            </div>

          </div>

        </section>


        {/* =================================================
            MISSION
        ================================================= */}
        <section className="mechanical-section">

          <div className="mechanical-section-heading">

            <div className="mechanical-section-icon">
              <Target size={24} />
            </div>

            <div>
              <p className="mechanical-section-label">
                OUR COMMITMENT
              </p>

              <h2>
                Mission of the Department
              </h2>
            </div>

          </div>


          <div className="mechanical-mission-grid">

            {/* M1 */}
            <div className="mechanical-mission-card">

              <div className="mechanical-mission-number">
                M1
              </div>

              <div>
                <h3>
                  Industry-Ready Knowledge
                </h3>

                <p>
                  The curriculum of Mechanical Engineering is
                  planned with the specific objective of imparting
                  up-to-date knowledge, improving the skills and
                  developing a better and positive attitude in
                  students to cater to the needs of the Industry.
                </p>
              </div>

            </div>


            {/* M2 */}
            <div className="mechanical-mission-card">

              <div className="mechanical-mission-number">
                M2
              </div>

              <div>
                <h3>
                  Quality Diploma Engineers
                </h3>

                <p>
                  To turn out quality Diploma Engineers in
                  Mechanical Engineering, trained by committed
                  faculty with latest techniques and infrastructure
                  up to Industry expectations.
                </p>
              </div>

            </div>


            {/* M3 */}
            <div className="mechanical-mission-card">

              <div className="mechanical-mission-number">
                M3
              </div>

              <div>
                <h3>
                  Practical Excellence
                </h3>

                <p>
                  Technical ingenuity is promoted through excellence
                  in academic achievement and continuous assessment.
                  Practical skills are developed through laboratory
                  exercises, in-plant training and industrial
                  training.
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            DEPARTMENT STRENGTH
        ================================================= */}
        <section className="mechanical-section mechanical-strength-section">

          <div className="mechanical-section-heading">

            <div className="mechanical-section-icon">
              <Settings size={24} />
            </div>

            <div>
              <p className="mechanical-section-label">
                LEARNING & PRACTICAL TRAINING
              </p>

              <h2>
                Mechanical Engineering at a Glance
              </h2>
            </div>

          </div>


          <div className="mechanical-strength-grid">

            <div className="mechanical-strength-card">
              <Cog size={30} />
              <h3>Machine Design</h3>
              <p>
                Mechanical components and machine design principles.
              </p>
            </div>


            <div className="mechanical-strength-card">
              <Factory size={30} />
              <h3>Industrial Production</h3>
              <p>
                Manufacturing processes and industrial production.
              </p>
            </div>


            <div className="mechanical-strength-card">
              <Wrench size={30} />
              <h3>Workshop Training</h3>
              <p>
                Practical workshop experience and technical skills.
              </p>
            </div>


            <div className="mechanical-strength-card">
              <Droplets size={30} />
              <h3>Fluid Mechanics</h3>
              <p>
                Fundamentals of fluid systems and applications.
              </p>
            </div>

          </div>

        </section>


        {/* =================================================
            FOOTER NOTE
        ================================================= */}
        <div className="mechanical-bottom-note">
          <Settings size={18} />
          <span>
            Mechanical Engineering Department • Government
            Polytechnic College, Masab Tank
          </span>
        </div>

      </main>

    </div>
  );
};

export default MechanicalDepartment;