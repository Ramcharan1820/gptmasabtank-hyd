import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  HardHat,
  Laptop,
  Zap,
  Cpu,
  Cog,
  Pill,
} from "lucide-react";
import "./Header.css";

const departmentLinks = [
  { name: "Computer Science & Engineering", path: "/departments/cse", icon: Laptop },
  { name: "Electronics & Communication Engineering", path: "/departments/ece", icon: Cpu },
  { name: "Electrical & Electronics Engineering", path: "/departments/eee", icon: Zap },
  { name: "Mechanical Engineering", path: "/departments/mechanical", icon: Cog },
  { name: "Civil Engineering", path: "/departments/civil", icon: HardHat },
  { name: "Automobile Engineering", path: "/departments/automobile", icon: Car },
  { name: "Pharmacy", path: "/departments/pharmacy", icon: Pill },
];

export default function Header({ showNavigation = true }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  const [contactDetails, setContactDetails] = useState(null);

  useEffect(() => {
    let active = true;

    fetch("http://localhost:5000/api/content/contact")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load contact details.");
        }
        return result.data;
      })
      .then((records) => {
        if (active && Array.isArray(records) && records[0]) {
          setContactDetails(records[0]);
        }
      })
      .catch((error) => {
        console.error("Header contact content API error:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="site-header">
      <div className="header-top">
        <Link to="/" className="college-brand">
          <div className="logo-box">
            <img
              src="/college-logo.jpg"
              alt="Government Polytechnic College Logo"
            />
          </div>

          <div className="college-text">
            <h1>Government Polytechnic College</h1>
            <p>Masab Tank, Hyderabad</p>
          </div>
        </Link>

        <div className="official-profile">
          <div className="official-photo">
            <img
              src="/images/chairperson.jpg"
              alt="Smt. A. Sridevasena, IAS"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="official-info">
            <h3>Smt. A. Sridevasena, IAS</h3>
            <p>CHAIRPERSON</p>
          </div>
        </div>

        <div className="official-profile">
          <div className="official-photo">
            <img
              src="/images/principal.jpg"
              alt="Sri DR. K. Chandra Sekhar"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="official-info">
            <h3>Sri DR. K. Chandrashekar</h3>
            <p>PRINCIPAL</p>
          </div>
        </div>

        <div className="header-contact">
          <div className="contact-item">
            <span className="contact-icon">✉</span>
            <a href={`mailto:${contactDetails?.email || "gpthyd01@gmail.com"}`}>
              {contactDetails?.email || "gpthyd01@gmail.com"}
            </a>
          </div>

          <div className="contact-item">
            <span className="contact-icon">☎</span>
            <a href={`tel:${contactDetails?.phone || "9912342001"}`}>
              {contactDetails?.phone || "9912342001"}
            </a>
          </div>

          <div className="working-hours">
            {contactDetails?.working_hours || "All Working Days: 09:30 AM to 04:00 PM"}
          </div>

          <div className="social-links">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Twitter">𝕏</a>
          </div>
        </div>
      </div>

      {showNavigation && <div className="navigation-wrapper">
        <button
          className="menu-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`main-nav ${mobileMenuOpen ? "open" : ""}`}>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>

          <div
            className={`departments-menu ${departmentsOpen ? "departments-open" : ""}`}
            onMouseEnter={() => setDepartmentsOpen(true)}
            onMouseLeave={() => setDepartmentsOpen(false)}
          >
            <button
              type="button"
              className="departments-trigger"
              onClick={() => setDepartmentsOpen((prev) => !prev)}
            >
              Departments
              <span className="departments-arrow">▾</span>
            </button>

            {departmentsOpen && (
              <div className="departments-dropdown">
                {departmentLinks.map(({ name, path, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className="department-dropdown-item"
                    onClick={() => setDepartmentsOpen(false)}
                  >
                    <Icon className="department-dropdown-icon" size={18} />
                    <span>{name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/faculty">Faculty</Link>
          <Link to="/placements">Placements</Link>
          <Link to="/events">Events</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/alumni">Alumni</Link>
          <Link to="/student-portal" className="student-btn">
            Student Portal
          </Link>
          <Link to="/admin/login" className="admin-login-nav-link">
            Admin Login
          </Link>
        </nav>
      </div>}
    </header>
  );
}