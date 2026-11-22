import React from "react";
import {
  Building2,
  Users,
  GraduationCap,
  CalendarDays,
  MapPin,
  Trophy,
  ChevronRight,
  Car,
  HardHat,
  Cpu,
  Radio,
  Zap,
  Cog,
  Pill,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import "./About.css";

/* =========================================================
   VERIFIED DEPARTMENTS / PROGRAMMES
   Government Polytechnic, Masab Tank
========================================================= */

const departments = [
  {
    name: "Automobile Engineering",
    code: "AU",
    slug: "automobile",
    icon: Car,
  },
  {
    name: "Civil Engineering",
    code: "CE",
    slug: "civil",
    icon: HardHat,
  },
  {
    name: "Computer Science and Engineering",
    code: "CS",
    slug: "cse",
    icon: Cpu,
  },
  {
    name: "Electronics & Communication Engineering",
    code: "EC",
    slug: "ece",
    icon: Radio,
  },
  {
    name: "Electrical & Electronics Engineering",
    code: "EE",
    slug: "eee",
    icon: Zap,
  },
  {
    name: "Mechanical Engineering",
    code: "ME",
    slug: "mechanical",
    icon: Cog,
  },
  {
    name: "Pharmacy",
    code: "PH",
    slug: "pharmacy",
    icon: Pill,
  },
];

function About() {
  return (
    <div className="gptm-about-page">

      {/* =====================================================
          TOP PAGE HEADER
      ====================================================== */}

      <section className="site-hero gptm-page-header">

        <div className="gptm-header-overlay"></div>

        <div className="gptm-header-container">

          <div className="gptm-header-left">

            <div className="gptm-header-title">
              <Building2 size={34} strokeWidth={2.3} />

              <div>
                <h1>
                  About Government Polytechnic
                </h1>

                <h2>
                  Masab Tank
                </h2>
              </div>
            </div>

            <p>
              Quality Technical Education for a Brighter Future
            </p>

          </div>

          {/* Breadcrumb */}

          <div className="gptm-breadcrumb">

            <Link to="/">
              Home
            </Link>

            <span>/</span>

            <Link to="/about">
              About
            </Link>

            <span>/</span>

            <strong>
              Government Polytechnic
            </strong>

          </div>

        </div>
      </section>


      {/* =====================================================
          STATISTICS STRIP
      ====================================================== */}

      


      {/* =====================================================
          MAIN ABOUT CONTENT
      ====================================================== */}

      <main className="gptm-main-content">

        {/* ===================================================
            ABOUT COLLEGE
        ==================================================== */}

        <section className="gptm-about-section">

          <div className="gptm-about-text">

            <p>
              <strong>
                Government Polytechnic, Masab Tank
              </strong>{" "}
              is a government technical education institution located at
              Masab Tank, Hyderabad, Telangana.
            </p>

            <p>
              The institution is part of the Telangana State Board of
              Technical Education and Training system and is identified
              by <strong>College Code 001</strong> in SBTET records.
            </p>

            <p>
              Government Polytechnic, Masab Tank offers diploma-level
              technical education through engineering programmes including
              Automobile Engineering, Civil Engineering, Computer Science
              and Engineering, Electronics & Communication Engineering,
              Electrical & Electronics Engineering and Mechanical Engineering.
            </p>

          </div>


          {/* College Image */}

          <div className="gptm-about-image">

            <img
              src="images/college.jpg"
              alt="Government Polytechnic Masab Tank"
              loading="lazy"
            />

            <div className="gptm-image-label">

              <MapPin size={18} />

              <div>
                <strong>
                  Government Polytechnic
                </strong>

                <span>
                  Masab Tank, Hyderabad
                </span>
              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            COLLEGE INFORMATION CARDS
        ==================================================== */}

        <section className="gptm-info-cards">

          <div className="gptm-info-card">

            <strong>
              1923
            </strong>

            <span>
              Established
            </span>

          </div>


          <div className="gptm-info-card">

            <strong>
              001
            </strong>

            <span>
              SBTET College Code
            </span>

          </div>


          <div className="gptm-info-card">

            <strong>
              10
            </strong>

            <span>
              Listed Programmes
            </span>

          </div>


          <div className="gptm-info-card">

            <strong>
              1800
            </strong>

            <span>
              2025 Listed Intake
            </span>

          </div>

        </section>


        {/* ===================================================
            EDUCATIONAL OBJECTIVES
        ==================================================== */}

        <section className="gptm-content-section">

          <div className="gptm-section-title">

            <span></span>

            <h2>
              Educational Objectives
            </h2>

          </div>

          <ul className="gptm-objectives">

            <li>
              To provide diploma-level technical education in
              engineering disciplines.
            </li>

            <li>
              To provide students with academic and technical
              knowledge relevant to their chosen engineering programme.
            </li>

            <li>
              To develop practical and technical skills through
              polytechnic education.
            </li>

            <li>
              To prepare students for further education and
              employment in technical fields.
            </li>

          </ul>

        </section>
        


        {/* ===================================================
            LOCATION
        ==================================================== */}

        <section className="gptm-content-section">

          <div className="gptm-section-title">

            <span></span>

            <h2>
              Location — Masab Tank
            </h2>

          </div>

          <p className="gptm-location-text">

            Government Polytechnic, Masab Tank is located in
            <strong> Masab Tank, Hyderabad, Telangana – 500028.</strong>

          </p>

          <p className="gptm-location-text">

            The institution is situated in Hyderabad and forms part
            of Telangana's government technical education system.

          </p>

        </section>


        {/* ===================================================
            DEPARTMENTS
        ==================================================== */}

        <section
          className="gptm-departments-section"
          id="departments"
        >

          <div className="gptm-section-title">

            <span></span>

            <h2>
              Departments
            </h2>

          </div>


          <div className="gptm-department-grid">

            {departments.map((department) => {

              const Icon = department.icon;

              return (
                <Link
                  key={department.slug}
                  to={`/departments/${department.slug}`}
                  className="gptm-department-card"
                >

                  <div className="gptm-department-left">

                    <div className="gptm-department-icon">
                      <Icon size={22} />
                    </div>

                    <div>

                      <h3>
                        {department.name}
                      </h3>

                      <span>
                        Diploma Programme
                      </span>

                    </div>

                  </div>


                  <div className="gptm-department-right">

                    <small>
                      {department.code}
                    </small>

                    <ChevronRight size={21} />

                  </div>

                </Link>
              );
            })}

          </div>

          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Link
              to="/departments"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 28px",
                background: "linear-gradient(135deg, #800000 0%, #5e0508 100%)",
                color: "#ffffff",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
                boxShadow: "0 6px 18px rgba(128, 0, 0, 0.22)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <span>Explore All Academic Departments</span>
              <ArrowRight size={17} />
            </Link>
          </div>

        </section>

      </main>

    </div>
  );
}

export default About;