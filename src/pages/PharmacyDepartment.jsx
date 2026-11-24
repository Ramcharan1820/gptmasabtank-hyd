import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Pill,
  FlaskConical,
  Microscope,
  HeartPulse,
  Scale,
  FileText,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Mail,
  UserRound,
  Award,
  BookOpen,
  CalendarDays,
  ShieldCheck,
  Building,
  Eye,
} from "lucide-react";

import "./PharmacyDepartment.css";
import useDepartmentFaculty from "../hooks/useDepartmentFaculty";
import FacultyProfileModal from "../components/FacultyProfileModal";
import ImageWithFallback from "../components/ImageWithFallback";

const stats = [
  { label: "Established Year", value: "1978", sub: "Decades of Excellence" },
  { label: "Program Duration", value: "2 Years", sub: "Diploma in Pharmacy (D.Pharm)" },
  { label: "Annual Intake", value: "60 Seats", sub: "PCI & SBTET Approved" },
  { label: "Specialized Labs", value: "6 Labs", sub: "Practical Training Units" },
];

const hodData = {
  name: "Smt. K. Lalitha",
  designation: "Head of Section (HOD)",
  department: "Pharmacy",
  qualification: "M.Pharm (Pharmacology)",
  experience: "18+ Years",
  email: "hod.pharmacy@gptmasab.ac.in",
  message:
    "Pharmacy is an indispensable pillar of modern healthcare. At Government Polytechnic Masab Tank, we impart comprehensive practical education in medicinal compounding, dosage accuracy, pharmacotherapy, and drug law jurisprudence. Our graduates are ethical, capable, and immediately industry-ready.",
};

const initialPharmacyFaculty = [
  {
    name: "Dr. M Vinay Kumar Chakravarthy",
    designation: "Lecturer in Pharmacy",
    qualification: "Ph.D, M.Pharmacy",
    experience: "14 Years",
    specialization: "Pharmaceutical Chemistry & Drug Analysis",
    email: "m.vinay2708@gmail.com",
    photo: "https://drive.google.com/uc?export=view&id=1feiocxWtSpCE9Wr0JPA3q_9dd7ypWzZ0",
  },
  {
    name: "D SUDHEER KUMAR",
    designation: "Senior Lecturer in Pharmacy",
    qualification: "M. Pharmacy",
    experience: "14 Years",
    specialization: "Pharmaceutics & Hospital Pharmacy Practice",
    email: "sudeer.donta@gmail.com",
    photo: "https://drive.google.com/uc?export=view&id=1uMT4ssIYzI9YavTqw5nkKLcTMXy_7qOA",
  },
  {
    name: "Sri R. Naveen",
    designation: "Lecturer in Pharmacy",
    qualification: "M.Pharm (Pharmacognosy)",
    experience: "9 Years",
    specialization: "Herbal Drug Standardization & Phytochemistry",
    email: "naveen.pharm@gptmasab.ac.in",
  },
  {
    name: "Smt. B. Swathi",
    designation: "Lecturer in Pharmacy",
    qualification: "M.Pharm (Clinical Pharmacy)",
    experience: "7 Years",
    specialization: "Hospital Pharmacy, Toxicology & Patient Care",
    email: "swathi.b@gptmasab.ac.in",
  },
];

const areas = [
  {
    icon: Pill,
    title: "Pharmaceutics",
    text: "Formulation, manufacturing, dosage forms, stability testing, and sterile product compounding.",
  },
  {
    icon: FlaskConical,
    title: "Pharmaceutical Chemistry",
    text: "Chemical structure, synthesis, qualitative analysis, and assaying of active pharmaceutical ingredients.",
  },
  {
    icon: Microscope,
    title: "Pharmacognosy",
    text: "Identification and extraction of therapeutic compounds derived from botanical and natural sources.",
  },
  {
    icon: HeartPulse,
    title: "Pharmacology & Anatomy",
    text: "Understanding human organ systems, biochemical mechanisms of drug action, and physiological effects.",
  },
  {
    icon: Scale,
    title: "Hospital & Clinical Pharmacy",
    text: "Direct patient care, dosage regimens, prescription auditing, adverse drug reactions, and hospital supply.",
  },
  {
    icon: FileText,
    title: "Drug Store & Jurisprudence",
    text: "Pharmacy Council regulations, Drugs and Cosmetics Act, ethics, licensing, and pharmaceutical retailing.",
  },
];

const careers = [
  { title: "Registered Pharmacist", desc: "Licensed dispensing of prescription medicines in community & retail pharmacies." },
  { title: "Hospital Pharmacist", desc: "Clinical pharmacy services, ICU medication therapy, and hospital supply logistics." },
  { title: "Quality Control (QC/QA)", desc: "Analytical testing and quality assurance in pharmaceutical manufacturing units." },
  { title: "Medical Representative", desc: "Scientific communication and professional engagement with healthcare practitioners." },
  { title: "Higher Education (B.Pharm)", desc: "Lateral entry into 2nd year B.Pharm via Telangana ECET entrance examinations." },
  { title: "Drug Regulatory Inspector", desc: "Government healthcare inspection and quality compliance enforcement." },
];

function PharmacyDepartment() {
  const { faculty: pharmacyFaculty } = useDepartmentFaculty("Pharmacy", initialPharmacyFaculty);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const isHod = (member) => {
    if (!member || !member.designation) return false;
    const desig = member.designation.toLowerCase();
    return (
      desig.includes("hod") ||
      desig.includes("head of section") ||
      desig.includes("head of department") ||
      desig.includes("head of the department")
    );
  };

  const activeHod = pharmacyFaculty.find(isHod) || hodData;
  const hodPhotoUrl = activeHod.photo || activeHod.image || "";

  return (
    <main className="pharm-page">
      {/* HERO */}
      <section className="site-hero pharm-hero">
        <div className="container">
          <Link to="/departments" className="pharm-back">
            <ArrowLeft size={16} />
            Back to Departments
          </Link>

          <span>ACADEMIC DEPARTMENT</span>

          <h1>
            Department of
            <strong>Pharmacy (D.Pharm)</strong>
          </h1>

          <p>
            Educating competent healthcare professionals skilled in pharmaceutical chemistry,
            drug formulation, clinical care, and ethical medicine dispensing since 1978.
          </p>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="pharm-stats-strip">
        <div className="container pharm-stats-grid">
          {stats.map((s, idx) => (
            <div className="pharm-stat-item" key={idx}>
              <strong>{s.value}</strong>
              <span className="pharm-stat-label">{s.label}</span>
              <span className="pharm-stat-sub">{s.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT & OVERVIEW */}
      <section className="pharm-section">
        <div className="container pharm-about">
          <div>
            <span>ABOUT THE DEPARTMENT</span>
            <h2>
              Healthcare, pharmaceutical science, and patient care.
            </h2>
          </div>

          <div>
            <p>
              The Department of Pharmacy at Government Polytechnic College, Masab Tank, is approved by the
              Pharmacy Council of India (PCI) and the State Board of Technical Education and Training (SBTET),
              Telangana.
            </p>
            <p>
              Through comprehensive laboratory coursework, analytical instrumentation, and compulsory hospital
              internship training, students master the preparation of medicines, drug safety guidelines, and
              community health care standards.
            </p>
          </div>
        </div>
      </section>

      {/* HOD SECTION */}
      <section className="pharm-light-section pharm-hod-section">
        <div className="container">
          <div className="pharm-heading">
            <span>DEPARTMENT LEADERSHIP</span>
            <h2>Head of Department Desk</h2>
          </div>

          <div className="pharm-hod-card">
            <div className="pharm-hod-photo-wrap">
              <div className="pharm-hod-photo">
                <ImageWithFallback
                  src={hodPhotoUrl}
                  alt={activeHod.name || "Head of Section"}
                  fallback={
                    <UserRound
                      size={64}
                      className="pharm-hod-icon"
                      style={{ display: "block" }}
                    />
                  }
                />
              </div>
              <span className="pharm-hod-badge">
                <Award size={14} /> Head of Section
              </span>
            </div>

            <div className="pharm-hod-info">
              <h3>{activeHod.name}</h3>
              <p className="pharm-hod-title">{activeHod.designation}</p>

              <div className="pharm-hod-meta">
                {activeHod.qualification && (
                  <span>
                    <GraduationCap size={16} /> {activeHod.qualification}
                  </span>
                )}
                {activeHod.experience && (
                  <span>
                    <Briefcase size={16} /> {activeHod.experience} Teaching & Research
                  </span>
                )}
                {activeHod.email && (
                  <a href={`mailto:${activeHod.email}`} className="pharm-hod-email">
                    <Mail size={16} /> {activeHod.email}
                  </a>
                )}
              </div>

              {activeHod.message && (
                <blockquote className="pharm-hod-quote">
                  "{activeHod.message}"
                </blockquote>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="pharm-section">
        <div className="container">
          <div className="pharm-heading">
            <span>OUR DIRECTION</span>
            <h2>Vision & Mission</h2>
          </div>

          <div className="pharm-two-column">
            <article>
              <Pill size={28} />
              <h3>Vision</h3>
              <p>
                To produce ethical, highly competent, and skilled pharmacy professionals
                committed to improving public health and supporting the healthcare ecosystem
                with integrity and patient-centric focus.
              </p>
            </article>

            <article>
              <FlaskConical size={28} />
              <h3>Mission</h3>
              <ul>
                <li>Provide rigorous practical training in pharmaceutical chemistry and formulation.</li>
                <li>Instill ethical clinical standards and professional drug dispensing habits.</li>
                <li>Educate students on pharmacy laws, community health, and patient safety.</li>
                <li>Prepare students for hospital positions, industrial roles, and higher studies (B.Pharm).</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* CORE AREAS */}
      <section className="pharm-light-section">
        <div className="container">
          <div className="pharm-heading">
            <span>ACADEMIC FOCUS</span>
            <h2>Core Areas of Study</h2>
          </div>

          <div className="pharm-grid">
            {areas.map((area, index) => {
              const Icon = area.icon;
              return (
                <article className="pharm-card" key={index}>
                  <div className="pharm-icon">
                    <Icon size={24} />
                  </div>
                  <h3>{area.title}</h3>
                  <p>{area.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* TEACHING FACULTY */}
      <section className="pharm-section pharm-faculty-section">
        <div className="container">
          <div className="pharm-heading-row">
            <div>
              <span>ACADEMIC MENTORS</span>
              <h2>Teaching Faculty Directory</h2>
            </div>
            <div className="pharm-faculty-count">
              <strong>{pharmacyFaculty.length}</strong>
              <span>Faculty Profiles</span>
            </div>
          </div>

          <div className="pharm-faculty-grid">
            {pharmacyFaculty.map((member, index) => (
              <article className="pharm-faculty-card" key={index}>
                <div className="pharm-faculty-photo">
                  <ImageWithFallback
                    src={member.photo}
                    alt={member.name}
                    fallback={
                      <div className="pharm-faculty-placeholder" style={{ display: "flex" }}>
                        <UserRound size={42} />
                      </div>
                    }
                  />
                  <span className="pharm-faculty-badge">{member.designation}</span>
                </div>

                <div className="pharm-faculty-details">
                  <h3>{member.name}</h3>

                  <div className="pharm-faculty-meta">
                    <span>
                      <GraduationCap size={15} /> {member.qualification}
                    </span>
                    <span>
                      <Briefcase size={15} /> {member.experience} Experience
                    </span>
                  </div>

                  {member.specialization && (
                    <p className="pharm-faculty-spec">
                      <BookOpen size={14} /> {member.specialization}
                    </p>
                  )}

                  <div className="pharm-faculty-actions">
                    <button
                      type="button"
                      className="pharm-profile-btn"
                      onClick={() => setSelectedFaculty(member)}
                    >
                      <Eye size={14} /> View Profile
                    </button>

                    {member.email && (
                      <a href={`mailto:${member.email}`} className="pharm-faculty-email">
                        <Mail size={14} /> {member.email}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <Link
              to="/faculty?department=Pharmacy"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "11px 24px",
                background: "linear-gradient(135deg, #800000 0%, #5e0508 100%)",
                color: "#ffffff",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "13.5px",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(128, 0, 0, 0.2)",
              }}
            >
              <span>View Pharmacy Faculty in Directory</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* LABORATORIES */}
      <section className="pharm-light-section">
        <div className="container">
          <div className="pharm-heading">
            <span>PRACTICAL LEARNING</span>
            <h2>State-of-the-Art Laboratories</h2>
            <p className="pharm-subtext">
              Fully equipped departmental laboratories supporting analytical, clinical, and compounding coursework:
            </p>
          </div>

          <div className="pharm-labs">
            <div>
              <FlaskConical size={18} /> Pharmaceutics Laboratory
            </div>
            <div>
              <Microscope size={18} /> Pharmaceutical Chemistry Lab
            </div>
            <div>
              <Pill size={18} /> Pharmacognosy Laboratory
            </div>
            <div>
              <HeartPulse size={18} /> Human Anatomy & Physiology Lab
            </div>
            <div>
              <FlaskConical size={18} /> Biochemistry & Pathology Lab
            </div>
            <div>
              <ShieldCheck size={18} /> Community & Hospital Pharmacy Unit
            </div>
          </div>
        </div>
      </section>

      {/* CAREER PATHWAYS */}
      <section className="pharm-section">
        <div className="container">
          <div className="pharm-heading">
            <span>CAREER HORIZONS</span>
            <h2>Career Pathways for D.Pharm Graduates</h2>
          </div>

          <div className="pharm-careers-grid">
            {careers.map((c, i) => (
              <div className="pharm-career-card" key={i}>
                <div className="pharm-career-num">{String(i + 1).padStart(2, "0")}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pharm-cta">
        <div className="container">
          <div>
            <span>EXPLORE MORE</span>
            <h2>Explore other academic departments.</h2>
          </div>

          <Link to="/departments">
            View All Departments
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {selectedFaculty && (
        <FacultyProfileModal
          faculty={selectedFaculty}
          onClose={() => setSelectedFaculty(null)}
        />
      )}
    </main>
  );
}

export default PharmacyDepartment;
