import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Atom,
  BookOpen,
  Briefcase,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  Languages,
  Users,
} from "lucide-react";

import "./HumanitiesSciencesDepartment.css";

const facultyGroups = [
  {
    subject: "English",
    icon: Languages,
    lecturers: ["Athiya Anjum", "Sangeeta Tummala"],
  },
  {
    subject: "Mathematics",
    icon: GraduationCap,
    lecturers: ["Dr. K. Praveen Kumar", "M. Srinivas"],
  },
  {
    subject: "Physics",
    icon: Atom,
    lecturers: ["Praveen Kumar Baikadi", "V. Krishnam Raju"],
  },
  {
    subject: "Chemistry",
    icon: FlaskConical,
    lecturers: ["Dr. Kurra Mohan", "A. Aruna Kumari"],
  },
];

const missions = [
  "Impart fundamental knowledge in mathematics, physics, chemistry, and communication skills through systematic teaching and learning integrated with practical laboratory experience.",
  "Foster value-based education that promotes ethical behavior, civic sense, and social responsibility among students.",
  "Enhance overall personality development by building analytical, problem-solving, and communication skills for professional and personal growth.",
  "Cultivate life-long learning by encouraging curiosity, critical thinking, and continuous improvement in knowledge and skills relevant to science, technology, and society.",
];

function HumanitiesSciencesDepartment() {
  return (
    <main className="hs-department-page">
      <section className="site-hero hs-department-hero">
        <div className="hs-container hs-hero-content">
          <Link to="/departments" className="hs-back-link">
            <ArrowLeft size={16} />
            Back to Departments
          </Link>
          <span className="hs-eyebrow">ACADEMIC DEPARTMENT</span>
          <h1>Humanities and Sciences</h1>
          <p>Building strong foundations for future engineering professionals.</p>
        </div>
      </section>

      <div className="hs-container hs-content">
        <section className="hs-section hs-hod-section" aria-labelledby="hs-hod">
          <div className="hs-section-heading">
            <span className="hs-section-icon"><Users size={22} /></span>
            <div>
              <span className="hs-section-label">DEPARTMENT LEADERSHIP</span>
              <h2 id="hs-hod">Head of the Department</h2>
            </div>
          </div>

          <div className="hs-hod-card">
            <div className="hs-hod-intro">
              <span className="hs-role">HEAD OF THE DEPARTMENT</span>
              <h3>Dr. G. Narender Reddy</h3>
              <p>
                Head of the Department – Humanities and Sciences, Department of
                Technical Education
              </p>
            </div>

            <div className="hs-hod-details">
              <article>
                <GraduationCap size={20} />
                <div>
                  <h4>Educational Qualifications</h4>
                  <p>Master of Science (M.Sc – Organic Chemistry), Osmania University</p>
                  <p>Doctor of Philosophy (Ph.D – Chemistry), Jawaharlal Nehru Technological University Hyderabad</p>
                </div>
              </article>
              <article>
                <Briefcase size={20} />
                <div>
                  <h4>Professional Experience</h4>
                  <p>
                    Appointed as a Lecturer in the Department of Humanities and
                    Sciences, Department of Technical Education, on 6 March
                    1991. He has extensive teaching experience in Government
                    Polytechnic colleges, teaching Chemistry and guiding
                    students in science education.
                  </p>
                  <p>
                    He has contributed to the development of students in basic
                    sciences and continues to strengthen foundation subjects
                    for engineering students as Head of the Department.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="hs-section" aria-labelledby="hs-about">
          <div className="hs-section-heading">
            <span className="hs-section-icon"><BookOpen size={22} /></span>
            <div>
              <span className="hs-section-label">ABOUT THE DEPARTMENT</span>
              <h2 id="hs-about">Foundations for engineering education</h2>
            </div>
          </div>
          <div className="hs-about-copy">
            <p>
              The Department of Humanities and Sciences plays a vital role in
              diploma-level engineering education. It provides students with
              the basic scientific knowledge and communication skills needed
              to understand engineering subjects effectively. Mathematics,
              physics, chemistry, and English form the foundation for all
              engineering branches.
            </p>
            <p>
              The department develops analytical thinking, problem-solving
              abilities, and effective communication skills while preparing
              students for higher studies, employment, and professional growth.
              Through theory classes and well-equipped physics, chemistry, and
              language-skills laboratories, students gain practical
              understanding alongside conceptual knowledge.
            </p>
          </div>
        </section>

        <section className="hs-vision-mission" aria-label="Department vision and mission">
          <article className="hs-vision-card">
            <span className="hs-section-label">VISION OF THE DEPARTMENT</span>
            <h2>Strong foundations, responsible professionals</h2>
            <p>
              To develop technically competent diploma holders with a strong
              foundation in science, mathematics, and communication skills,
              equipped with ethical and moral values to meet global and
              national standards of the 21st century.
            </p>
          </article>

          <article className="hs-section hs-mission-card">
            <span className="hs-section-label">MISSION OF THE DEPARTMENT</span>
            <h2>Our Mission</h2>
            <ul>
              {missions.map((mission, index) => (
                <li key={mission}>
                  <CheckCircle2 size={19} />
                  <span><strong>M{index + 1}:</strong> {mission}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="hs-section" aria-labelledby="hs-faculty">
          <div className="hs-section-heading">
            <span className="hs-section-icon"><Users size={22} /></span>
            <div>
              <span className="hs-section-label">FACULTY DETAILS</span>
              <h2 id="hs-faculty">Our Faculty</h2>
            </div>
          </div>
          <div className="hs-faculty-grid">
            {facultyGroups.map(({ subject, icon: Icon, lecturers }) => (
              <article className="hs-faculty-card" key={subject}>
                <span className="hs-faculty-icon"><Icon size={21} /></span>
                <h3>{subject}</h3>
                <span className="hs-faculty-designation">Lecturers</span>
                <ul>
                  {lecturers.map((lecturer) => <li key={lecturer}>{lecturer}</li>)}
                </ul>
              </article>
            ))}
            <article className="hs-faculty-card hs-librarian-card">
              <span className="hs-faculty-icon"><BookOpen size={21} /></span>
              <h3>Library</h3>
              <span className="hs-faculty-designation">Librarian</span>
              <ul><li>Gurrala Goutham Reddy</li></ul>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

export default HumanitiesSciencesDepartment;
