import React from "react";
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
} from "lucide-react";

import "./PharmacyDepartment.css";

const areas = [
  {
    icon: Pill,
    title: "Pharmaceutics",
    text: "Formulation, manufacturing, and dosage forms of various pharmaceutical drugs.",
  },
  {
    icon: FlaskConical,
    title: "Pharmaceutical Chemistry",
    text: "Chemical structure, synthesis, and analysis of active medicinal ingredients.",
  },
  {
    icon: Microscope,
    title: "Pharmacognosy",
    text: "Study of natural drugs derived from plants, animals, and mineral sources.",
  },
  {
    icon: HeartPulse,
    title: "Pharmacology & Anatomy",
    text: "Understanding human physiology and drug interactions within the body.",
  },
  {
    icon: Scale,
    title: "Hospital & Clinical Pharmacy",
    text: "Patient care, drug dispensing, dosage regulation, and inventory management.",
  },
  {
    icon: FileText,
    title: "Drug Store & Jurisprudence",
    text: "Understanding pharmacy laws, medical ethics, and pharmaceutical business operations.",
  },
];

function PharmacyDepartment() {
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
            drug formulation, clinical care, and medicine administration.
          </p>

        </div>
      </section>


      {/* ABOUT */}
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
              The Pharmacy department provides students with comprehensive knowledge
              of drug composition, therapeutic uses, formulation practices, and healthcare delivery.
            </p>

            <p>
              Through practical laboratory training and clinical exposure, students learn to
              analyze chemical compounds, prepare formulations, and manage hospital and community retail pharmacies.
            </p>
          </div>

        </div>
      </section>


      {/* VISION & MISSION */}
      <section className="pharm-light-section">
        <div className="container">

          <div className="pharm-heading">
            <span>OUR DIRECTION</span>
            <h2>Vision & Mission</h2>
          </div>

          <div className="pharm-two-column">

            <article>
              <Pill size={25} />

              <h3>Vision</h3>

              <p>
                To produce ethical, highly competent, and skilled pharmacy professionals
                committed to improving public health and supporting the healthcare ecosystem.
              </p>
            </article>

            <article>
              <FlaskConical size={25} />

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
      <section className="pharm-section">
        <div className="container">

          <div className="pharm-heading">
            <span>ACADEMIC FOCUS</span>
            <h2>Core Areas</h2>
          </div>

          <div className="pharm-grid">

            {areas.map((area, index) => {
              const Icon = area.icon;

              return (
                <article className="pharm-card" key={index}>

                  <div className="pharm-icon">
                    <Icon size={23} />
                  </div>

                  <h3>{area.title}</h3>

                  <p>{area.text}</p>

                </article>
              );
            })}

          </div>

        </div>
      </section>


      {/* LABORATORIES */}
      <section className="pharm-light-section">
        <div className="container">

          <div className="pharm-heading">
            <span>PRACTICAL LEARNING</span>
            <h2>Laboratories</h2>
          </div>

          <div className="pharm-labs">

            <div>Pharmaceutics Laboratory</div>
            <div>Pharmaceutical Chemistry Lab</div>
            <div>Pharmacognosy Laboratory</div>
            <div>Human Anatomy & Physiology Lab</div>
            <div>Biochemistry & Pathology Lab</div>
            <div>Community Pharmacy Practice Unit</div>

          </div>

        </div>
      </section>


      {/* DEPARTMENT DETAILS */}
      <section className="pharm-section">
        <div className="container">

          <div className="pharm-details">

            <div>
              <span>DEPARTMENT</span>

              <h2>
                Pharmacy (D.Pharm)
              </h2>

              <p>
                Government Polytechnic College,
                Masab Tank, Hyderabad.
              </p>
            </div>

            <div>
              <span>STUDENT DEVELOPMENT</span>

              <ul>
                <li>Drug Compounding & Dispensing</li>
                <li>Chemical & Pharmacognostic Analysis</li>
                <li>Patient Counseling & Dosage Safety</li>
                <li>Pharmacy Management Practices</li>
              </ul>
            </div>

          </div>

        </div>
      </section>


      {/* CTA */}
      <section className="pharm-cta">
        <div className="container">

          <div>
            <span>EXPLORE MORE</span>

            <h2>
              Explore other academic departments.
            </h2>
          </div>

          <Link to="/departments">
            View Departments
            <ArrowRight size={17} />
          </Link>

        </div>
      </section>

    </main>
  );
}

export default PharmacyDepartment;