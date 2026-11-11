import { Link } from "react-router-dom";

import {
  CalendarCheck,
  FileText,
  ClipboardList,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

import "./StudentPortal.css";

const links = [
  {
    title: "Student Attendance",
    text: "View your latest attendance details from SBTET.",
    icon: CalendarCheck,
    type: "internal",
    url: "/student-portal/attendance",
    linkText: "View Attendance",
  },

  {
    title: "Student Result",
    text: "View your latest examination result from SBTET.",
    icon: FileText,
    type: "internal",
    url: "/student-portal/result",
    linkText: "View Result",
  },

  {
    title: "Consolidated Result",
    text: "View your consolidated academic result.",
    icon: ClipboardList,
    type: "internal",
    url: "/student-portal/consolidated-result",
    linkText: "View Consolidated Result",
  },
];

function StudentPortal() {
  return (
    <main className="student-portal-page">

      {/* =========================
          HERO SECTION
      ========================== */}

      <section className="student-portal-hero">

        <div className="student-portal-container">

          <span>GOVERNMENT POLYTECHNIC COLLEGE</span>

          <h1>Student Portal</h1>

          <p>
            Access official student services through the
            Telangana State Board of Technical Education and
            Training portal.
          </p>

        </div>

      </section>


      {/* =========================
          STUDENT SERVICES
      ========================== */}

      <section className="student-portal-section">

        <div className="student-portal-container">

          <div className="student-portal-heading">

            <span>STUDENT SERVICES</span>

            <h2>Student Information</h2>

            <p>
              Select a service below to continue to the
              student services portal.
            </p>

          </div>


          {/* =========================
              SERVICE CARDS
          ========================== */}

          <div className="student-portal-grid">

            {links.map((item) => {

              const Icon = item.icon;


              {/* =========================
                  INTERNAL PAGES
              ========================== */}

              if (item.type === "internal") {

                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className="student-service-card"
                  >

                    <div className="student-service-icon">
                      <Icon size={24} />
                    </div>


                    <div className="student-service-content">

                      <h3>{item.title}</h3>

                      <p>{item.text}</p>

                      <span className="student-service-link">

                        {item.linkText}

                        <ArrowRight size={16} />

                      </span>

                    </div>

                  </Link>
                );
              }


              {/* =========================
                  EXTERNAL SBTET PAGE
              ========================== */}

              return (
                <a
                  key={item.title}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="student-service-card"
                >

                  <div className="student-service-icon">
                    <Icon size={24} />
                  </div>


                  <div className="student-service-content">

                    <h3>{item.title}</h3>

                    <p>{item.text}</p>

                    <span className="student-service-link">

                      {item.linkText}

                      <ExternalLink size={14} />

                    </span>

                  </div>

                </a>
              );

            })}

          </div>

        </div>

      </section>

    </main>
  );
}

export default StudentPortal;