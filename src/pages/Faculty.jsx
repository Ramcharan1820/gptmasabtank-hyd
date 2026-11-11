import React, { useState } from "react";
import {
  BriefcaseBusiness,
  GraduationCap,
  Mail,
  Phone,
  Search,
  UserRound,
  Award,
  BookOpen
} from "lucide-react";
import "./Faculty.css";

// Institutional Leadership
const PRINCIPAL_DATA = {
  name: "Dr. K. Chandra Sekhar",
  designation: "Principal / Head of Institution",
  qualification: "Ph.D, M.Tech (Mechanical Engg)",
  experience: "26+ Years",
  email: "gpthyd01@telangana.gov.in",
  phone: "040-23395914",
  photo: "/principal.jpg",
  message:
    "Government Polytechnic Masab Tank has a storied legacy of technical excellence. Our goal is to mentor students through rigorous practical lab training, skill development, and industry alignment."
};

// Department Faculty Dataset
const FACULTY_DATA = [
 
  // --- COMPUTER SCIENCE & ENGINEERING (CSE) ---
  {
    id: "CSE001",
    name: "Sri N. Srinivasulu ",
    designation: "Head of Section (HOD)",
    department: "CSE",
    qualification: "M.Tech (CSE)",
    experience: "18 Years",
    specialization: "AI, Full-Stack Web Technologies & Algorithms",
    email: "hod.cse@gptmasb.dte.telangana.gov.in",
    photo: "/csehod.png",
  },
  {
    id: "CSE002",
    name: "Sri MD.Riaz",
    designation: "Senior Lecturer",
    department: "CSE",
    qualification: "b.tech (m tech)",
    experience: "16 Years",
    specialization: "Relational Databases, Cloud & Cyber Security",
    email: "sunitha.p@gptmasb.dte.telangana.gov.in",
    photo: "/riaz.png",
  },
  {
    id: "CSE003",
    name: "Sri Srinivas",
    designation: "Senior Lecturer",
    department: "CSE",
    qualification: "B.Tech (.net ,ccp )",
    experience: "16 Years",
    specialization: "c++ programmer",
    email: "ramesh.t@gptmasb.dte.telangana.gov.in",
    photo: null,
  },
  {
    id: "CSE004",
    name: "Sri Ramanarshiah",
    designation: "Lecturer",
    department: "CSE",
    qualification: "B.Tech ( software engineering )",
    experience: "8 Years",
    specialization: "software engineer",
    email: "ramesh.t@gptmasb.dte.telangana.gov.in",
    photo: null,
  },
  {
    id: "CSE005",
    name: "Sri shailaja",
    designation: "Lecturer",
    department: "CSE",
    qualification: "B.Tech ( cyber security )",
    experience: "8 Years",
    specialization: "mobile application development",
    email: "ramesh.t@gptmasb.dte.telangana.gov.in",
    photo: null,
  },
  {
    id: "CSE006",
    name: "Sri N. mounika",
    designation: "Lecturer",
    department: "CSE",
    qualification: "B.Tech (Computer Networks)",
    experience: "8 Years",
    specialization: "Operating System, cloud computing ",
    email: "ramesh.t@gptmasb.dte.telangana.gov.in",
    photo: "/mounikan.png",
  },
  {
    id: "CSE007",
    name: "Sri N. mounika",
    designation: "Lecturer",
    department: "CSE",
    qualification: "B.Tech (python )",
    experience: "8 Years",
    specialization: "Python & operating system",
    email: "ramesh.t@gptmasb.dte.telangana.gov.in",
    photo: "/mounikab.png",
  },
 // --- MECHANICAL ENGINEERING ---
  {
    id: "ME001",
    name: "Dr. G. Venkat Rao",
    designation: "Head of Section (HOD)",
    department: "Mechanical",
    qualification: "Ph.D, M.Tech",
    experience: "21 Years",
    specialization: "CAD/CAM, Thermal Systems & Robotics",
    email: "hod.mech@gptmasb.dte.telangana.gov.in",
    photo: null,
  },
  {
    id: "ME002",
    name: "Smt. K. Saritha",
    designation: "Senior Lecturer",
    department: "Mechanical",
    qualification: "M.Tech (Production Engg)",
    experience: "14 Years",
    specialization: "Advanced Manufacturing & CNC Technology",
    email: "saritha.k@gptmasb.dte.telangana.gov.in",
    photo: null,
  },
  {
    id: "ME003",
    name: "Sri M. Anjaneyulu",
    designation: "Lecturer",
    department: "Mechanical",
    qualification: "M.Tech (Design Engg)",
    experience: "9 Years",
    specialization: "Kinematics & Workshop Practice",
    email: "anjaneyulu.m@gptmasb.dte.telangana.gov.in",
    photo: null,
  },

  // --- CIVIL ENGINEERING ---
  {
    id: "CE001",
    name: "Sri V. Ramesh",
    designation: "Head of Section (HOD)",
    department: "Civil",
    qualification: "M.Tech (Structural Engg)",
    experience: "19 Years",
    specialization: "Structural Analysis & Total Station Surveying",
    email: "hod.civil@gptmasb.dte.telangana.gov.in",
    photo: null,
  },
  {
    id: "CE002",
    name: "Smt. D. Aruna",
    designation: "Lecturer",
    department: "Civil",
    qualification: "M.Tech (Geotechnical Engg)",
    experience: "10 Years",
    specialization: "Soil Mechanics & Concrete Technology",
    email: "aruna.d@gptmasb.dte.telangana.gov.in",
    photo: null,
  },

  // --- ELECTRICAL & ELECTRONICS ENGINEERING (EEE) ---
  {
    id: "EEE001",
    name: "Sri D. Suresh Babu",
    designation: "Head of Section (HOD)",
    department: "EEE",
    qualification: "M.Tech (Power Systems)",
    experience: "20 Years",
    specialization: "Power Distribution & Electrical Machines",
    email: "hod.eee@gptmasb.dte.telangana.gov.in",
    photo: null,
  },
  {
    id: "EEE002",
    name: "Smt. Ch. Latha",
    designation: "Lecturer",
    department: "EEE",
    qualification: "M.Tech (Power Electronics)",
    experience: "12 Years",
    specialization: "Control Systems & Renewable Energy",
    email: "latha.ch@gptmasb.dte.telangana.gov.in",
    photo: null,
  },

  // --- ELECTRONICS & COMMUNICATION ENGINEERING (ECE) ---
  {
    id: "ECE001",
    name: "Dr. B. Radhika",
    designation: "Head of Section (HOD)",
    department: "ECE",
    qualification: "Ph.D, M.Tech (VLSI & Embedded)",
    experience: "17 Years",
    specialization: "Microcontrollers, DSP & IoT Architectures",
    email: "hod.ece@gptmasb.dte.telangana.gov.in",
    photo: null,
  },
  {
    id: "ECE002",
    name: "Sri K. Naresh",
    designation: "Lecturer",
    department: "ECE",
    qualification: "M.Tech (Embedded Systems)",
    experience: "9 Years",
    specialization: "Digital Electronics & Communication Circuits",
    email: "naresh.k@gptmasb.dte.telangana.gov.in",
    photo: null,
  },

  // --- AUTOMOBILE ENGINEERING ---
  {
    id: "AUTO001",
    name: "Sri K. Praveen Kumar",
    designation: "Head of Section (HOD)",
    department: "Automobile",
    qualification: "M.Tech (Automotive Engg)",
    experience: "15 Years",
    specialization: "IC Engines, Chassis Design & EV Systems",
    email: "hod.auto@gptmasb.dte.telangana.gov.in",
    photo: null,
  },

  // --- GENERAL / APPLIED SCIENCE ---
  {
    id: "GEN001",
    name: "Dr. A. Srinivas",
    designation: "Head of General Section",
    department: "General",
    qualification: "Ph.D (Applied Mathematics)",
    experience: "22 Years",
    specialization: "Engineering Mathematics & Statistics",
    email: "gen.math@gptmasb.dte.telangana.gov.in",
    photo: null,
  }
];

const DEPARTMENTS = [
  "All Departments",
  "Mechanical",
  "CSE",
  "Civil",
  "EEE",
  "ECE",
  "Automobile",
  "General"
];

export default function Faculty() {
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaculty = FACULTY_DATA.filter((faculty) => {
    const matchesDepartment =
      selectedDepartment === "All Departments" ||
      faculty.department === selectedDepartment;

    const searchValue = searchTerm.toLowerCase();

    const matchesSearch =
      faculty.name.toLowerCase().includes(searchValue) ||
      faculty.department.toLowerCase().includes(searchValue) ||
      faculty.designation.toLowerCase().includes(searchValue) ||
      faculty.specialization.toLowerCase().includes(searchValue) ||
      faculty.id.toLowerCase().includes(searchValue);

    return matchesDepartment && matchesSearch;
  });

  return (
    <main className="faculty-page">
      {/* HERO SECTION */}
      <section className="faculty-hero">
        <div className="faculty-hero-pattern"></div>
        <div className="faculty-container faculty-hero-content">
          <span className="faculty-eyebrow">GOVERNMENT POLYTECHNIC, MASAB TANK</span>
          <h1>
            Faculty <span>& Academic Mentors</span>
          </h1>
          <p>
            Meet the experienced educators and department heads driving technical training, 
            hands-on workshop practice, and diploma engineering standards.
          </p>
        </div>
      </section>

      {/* PRINCIPAL SPOTLIGHT */}
      <section className="faculty-section" style={{ paddingBottom: "20px" }}>
        <div className="faculty-container">
          <div className="faculty-heading">
            <div>
              <span className="faculty-section-label">INSTITUTIONAL LEADERSHIP</span>
              <h2>Office of the Principal</h2>
            </div>
          </div>

          <div className="faculty-principal-spotlight">
            <div className="principal-image-wrap">
              <img
                src={PRINCIPAL_DATA.photo}
                alt={PRINCIPAL_DATA.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/principal.jpg";
                }}
              />
              <span className="principal-badge">
                <Award size={14} /> Principal
              </span>
            </div>

            <div className="principal-details">
              <h3>{PRINCIPAL_DATA.name}</h3>
              <p className="principal-sub">{PRINCIPAL_DATA.designation}</p>

              <div className="principal-meta">
                <span>
                  <GraduationCap size={16} /> {PRINCIPAL_DATA.qualification}
                </span>
                <span>
                  <BriefcaseBusiness size={16} /> {PRINCIPAL_DATA.experience}
                </span>
              </div>

              <blockquote className="principal-quote">
                "{PRINCIPAL_DATA.message}"
              </blockquote>

              <div className="principal-contact">
                <a href={`mailto:${PRINCIPAL_DATA.email}`}>
                  <Mail size={15} /> {PRINCIPAL_DATA.email}
                </a>
                <span>
                  <Phone size={15} /> {PRINCIPAL_DATA.phone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEACHING FACULTY DIRECTORY */}
      <section className="faculty-section">
        <div className="faculty-container">
          <div className="faculty-heading">
            <div>
              <span className="faculty-section-label">TEACHING FACULTY</span>
              <h2>Faculty Directory</h2>
              <p>
                Filter by academic department or search by name, qualification, and specialization area.
              </p>
            </div>

            <div className="faculty-count">
              <strong>{filteredFaculty.length}</strong>
              <span>Faculty Members</span>
            </div>
          </div>

          {/* CONTROLS (FILTERS & SEARCH) */}
          <div className="faculty-controls">
            <div className="department-filters">
              {DEPARTMENTS.map((department) => (
                <button
                  key={department}
                  type="button"
                  className={
                    selectedDepartment === department
                      ? "department-filter active"
                      : "department-filter"
                  }
                  onClick={() => setSelectedDepartment(department)}
                >
                  {department}
                </button>
              ))}
            </div>

            <div className="faculty-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search faculty, branch, role..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          {/* FACULTY CARDS GRID */}
          {filteredFaculty.length > 0 ? (
            <div className="faculty-grid">
              {filteredFaculty.map((faculty) => (
                <article className="faculty-card" key={faculty.id}>
                  {/* PHOTO */}
                  <div className="faculty-photo">
                    {faculty.photo ? (
                      <img src={faculty.photo} alt={faculty.name} />
                    ) : (
                      <div className="faculty-photo-placeholder">
                        <UserRound size={56} />
                        <span>{faculty.name}</span>
                      </div>
                    )}
                    <div className="faculty-department-badge">
                      {faculty.department}
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="faculty-card-body">
                    <span className="faculty-id">FACULTY ID: {faculty.id}</span>
                    <h3>{faculty.name}</h3>
                    <p className="faculty-designation">{faculty.designation}</p>

                    <div className="faculty-info">
                      <div className="faculty-info-row">
                        <GraduationCap size={16} />
                        <div>
                          <small>Qualification</small>
                          <strong>{faculty.qualification}</strong>
                        </div>
                      </div>

                      <div className="faculty-info-row">
                        <BriefcaseBusiness size={16} />
                        <div>
                          <small>Experience</small>
                          <strong>{faculty.experience}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="faculty-specialization">
                      <span>Specialization</span>
                      <p>{faculty.specialization}</p>
                    </div>

                    <a
                      href={`mailto:${faculty.email}`}
                      className="faculty-profile-button"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        textDecoration: "none"
                      }}
                    >
                      <Mail size={14} /> Contact Faculty
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="faculty-empty">
              <UserRound size={48} />
              <h3>No Faculty Members Found</h3>
              <p>Try switching departments or clearing your search term.</p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER CALLOUT BANNER */}
      <section className="faculty-message">
        <div className="faculty-container">
          <div className="faculty-message-box">
            <div className="faculty-message-icon">
              <BookOpen size={32} />
            </div>
            <div>
              <span>STATE BOARD OF TECHNICAL EDUCATION & TRAINING (SBTET)</span>
              <h2>Dedicated Mentorship. Practical Excellence.</h2>
              <p>
                Our staff maintain up-to-date curricula conforming to SBTET norms, providing 
                students with hands-on industrial laboratory exposure, technical skills, and campus placement mentorship.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}