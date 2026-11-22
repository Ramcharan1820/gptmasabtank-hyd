import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  FileText,
  ClipboardList,
  ExternalLink,
  ArrowRight,
  GraduationCap,
  Award,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  Download,
  BookOpen,
  Landmark,
} from "lucide-react";

import "./StudentPortal.css";

const internalServices = [
  {
    title: "Student Attendance",
    text: "Check your live biometric/daily attendance, monthly trends, and semester exam eligibility from SBTET.",
    icon: CalendarCheck,
    url: "/student-portal/attendance",
    linkText: "Check Live Attendance",
    badge: "Official SBTET",
  },
  {
    title: "Examination Results",
    text: "View real-time Mid-1, Mid-2, and Semester examination results with subject-wise marks and totals.",
    icon: FileText,
    url: "/student-portal/result",
    linkText: "View Exam Result",
    badge: "Mid & Semester",
  },
  {
    title: "Curriculum & Syllabus",
    text: "Access official SBTET curriculum, branch-wise diploma syllabus schemes (C-24, C-21, C-18), and subject course structures.",
    icon: BookOpen,
    url: "https://www.sbtet.telangana.gov.in/",
    linkText: "Explore SBTET Curriculum",
    badge: "Syllabus & Scheme",
    isExternal: true,
  },
  {
    title: "Consolidated Result",
    text: "Access your complete multi-semester academic ledger, subject credits, GPA/CGPA summary, and printable memo.",
    icon: ClipboardList,
    url: "/student-portal/consolidated-result",
    linkText: "View Consolidated Memo",
    badge: "Academic Ledger",
  },
];

const externalServices = [
  {
    title: "SBTET Official Portal",
    text: "State Board of Technical Education and Training official portal for diploma notifications, circulars and timetables.",
    icon: Landmark,
    url: "https://www.sbtet.telangana.gov.in/",
    linkText: "Visit SBTET Portal",
  },
  {
    title: "Hall Tickets & Fee Payment",
    text: "Download regular/backlog examination hall tickets and pay semester examination fees online.",
    icon: FileCheck2,
    url: "https://www.sbtet.telangana.gov.in/",
    linkText: "Exam Fee & Hall Ticket",
  },
  {
    title: "TS ePass Scholarship",
    text: "Apply for Post-Matric Scholarships (PMS), fee reimbursement, and track application verification status.",
    icon: Award,
    url: "https://telanganaepass.cgg.gov.in/",
    linkText: "ePass Scholarship Portal",
  },
  {
    title: "TS POLYCET Admission",
    text: "Official admission counseling portal for polytechnic diploma courses across Telangana institutions.",
    icon: GraduationCap,
    url: "https://polycet.sbtet.telangana.gov.in/",
    linkText: "POLYCET Counseling",
  },
];

const regulations = [
  {
    title: "75% Attendance Requirement",
    desc: "A candidate is eligible to appear for the semester-end examination only if they secure at least 75% aggregate attendance. Condonation between 65% and 74% is granted only on valid medical grounds with an authorized fee.",
  },
  {
    title: "Continuous Internal Assessment",
    desc: "Mid-1 and Mid-2 examinations contribute to continuous internal evaluation. Laboratory performance, assignments, and workshop submissions are mandatory for semester completion.",
  },
  {
    title: "SBTET Hybrid Grading System",
    desc: "Performance is evaluated on SGPA (Semester Grade Point Average) and CGPA (Cumulative Grade Point Average) scales across C18, C21, C24, and C26 curricula.",
  },
];

export default function StudentPortal() {
  return (
    <main className="student-portal-page">
      {/* HERO SECTION */}
      <section className="site-hero student-portal-hero">
        <div className="student-portal-container">
          <span>GOVERNMENT POLYTECHNIC COLLEGE, MASAB TANK</span>
          <h1>Student Services Portal</h1>
          <p>
            One-stop institutional hub providing real-time SBTET academic attendance, examination
            results, consolidated grade cards, and essential government educational services.
          </p>
        </div>
      </section>

      {/* CORE INTEGRATED SERVICES */}
      <section className="student-portal-section">
        <div className="student-portal-container">
          <div className="student-portal-heading">
            <span>CORE ACADEMIC SERVICES</span>
            <h2>Integrated Student Services</h2>
            <p>Direct live data connections to official Telangana SBTET academic databases.</p>
          </div>

          <div className="student-portal-grid">
            {internalServices.map((item) => {
              const Icon = item.icon;
              const cardContent = (
                <>
                  <div className="student-service-top">
                    <div className="student-service-icon">
                      <Icon size={24} />
                    </div>
                    {item.badge && <span className="student-service-badge">{item.badge}</span>}
                  </div>

                  <div className="student-service-content">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>

                    <span className="student-service-link">
                      {item.linkText}
                      {item.isExternal ? <ExternalLink size={15} /> : <ArrowRight size={16} />}
                    </span>
                  </div>
                </>
              );

              return item.isExternal ? (
                <a
                  key={item.title}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="student-service-card"
                >
                  {cardContent}
                </a>
              ) : (
                <Link key={item.title} to={item.url} className="student-service-card">
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* EXTERNAL GOVERNMENT & BOARD SERVICES */}
      <section className="student-portal-section student-portal-external-section">
        <div className="student-portal-container">
          <div className="student-portal-heading">
            <span>OFFICIAL BOARD SERVICES</span>
            <h2>SBTET & State Portals</h2>
            <p>Authorized external links to government examination, scholarship, and counseling systems.</p>
          </div>

          <div className="student-portal-grid">
            {externalServices.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="student-service-card external"
                >
                  <div className="student-service-top">
                    <div className="student-service-icon">
                      <Icon size={24} />
                    </div>
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

      {/* ACADEMIC REGULATIONS NOTICE */}
      <section className="student-portal-regulations">
        <div className="student-portal-container">
          <div className="student-portal-heading">
            <span>RULES & GUIDELINES</span>
            <h2>Academic Guidelines & Regulations</h2>
          </div>

          <div className="student-regulations-grid">
            {regulations.map((r, i) => (
              <div className="student-regulation-card" key={i}>
                <div className="regulation-card-header">
                  <AlertCircle size={20} className="reg-icon" />
                  <h3>{r.title}</h3>
                </div>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
