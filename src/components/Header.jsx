import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Car,
  HardHat,
  Laptop,
  Zap,
  Cpu,
  Cog,
  Pill,
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  Lock,
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
  const [mobileDeptOpen, setMobileDeptOpen] = useState(false);
  const [contactDetails, setContactDetails] = useState(null);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("mobile-menu-active");
    } else {
      document.body.classList.remove("mobile-menu-active");
    }
    return () => {
      document.body.classList.remove("mobile-menu-active");
    };
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

        {/* Mobile Hamburger Toggle Button (inside header-top for clean mobile alignment) */}
        {showNavigation && (
          <button
            type="button"
            className="mobile-nav-toggle-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        )}
      </div>

      {/* Desktop Navigation Bar */}
      {showNavigation && (
        <div className="navigation-wrapper desktop-nav-bar">
          <nav className="main-nav">
            <Link to="/" className={location.pathname === "/" ? "nav-link-active" : ""}>
              Home
            </Link>
            <Link to="/about" className={location.pathname === "/about" ? "nav-link-active" : ""}>
              About
            </Link>

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

            <Link to="/faculty" className={location.pathname === "/faculty" ? "nav-link-active" : ""}>
              Faculty
            </Link>
            <Link to="/placements" className={location.pathname === "/placements" ? "nav-link-active" : ""}>
              Placements
            </Link>
            <Link to="/events" className={location.pathname === "/events" ? "nav-link-active" : ""}>
              Events
            </Link>
            <Link to="/gallery" className={location.pathname === "/gallery" ? "nav-link-active" : ""}>
              Gallery
            </Link>
            <Link to="/contact" className={location.pathname === "/contact" ? "nav-link-active" : ""}>
              Contact
            </Link>
            <Link to="/alumni" className={location.pathname === "/alumni" ? "nav-link-active" : ""}>
              Alumni
            </Link>
            <Link to="/student-portal" className="student-btn">
              Student Portal
            </Link>
            <Link to="/admin/login" className="admin-login-nav-link">
              Admin Login
            </Link>
          </nav>
        </div>
      )}

      {/* Modern Off-Canvas Mobile Drawer & Overlay */}
      {showNavigation && (
        <>
          <div
            className={`mobile-drawer-backdrop ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <aside
            className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}
            aria-label="Mobile Navigation Drawer"
          >
            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-brand">
                <div className="drawer-logo-wrap">
                  <img
                    src="/college-logo.jpg"
                    alt="GPT Masab Tank Logo"
                    className="drawer-logo"
                  />
                </div>
                <div className="drawer-brand-text">
                  <h3>GPT Masab Tank</h3>
                  <p>Govt. Polytechnic, Hyderabad</p>
                </div>
              </div>

              <button
                type="button"
                className="mobile-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="mobile-drawer-body">
              <nav className="mobile-drawer-links">
                <Link
                  to="/"
                  className={`mobile-drawer-link ${location.pathname === "/" ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>

                <Link
                  to="/about"
                  className={`mobile-drawer-link ${location.pathname === "/about" ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>

                {/* Collapsible Departments Accordion */}
                <div className="mobile-drawer-accordion">
                  <button
                    type="button"
                    className={`mobile-accordion-header ${
                      location.pathname.startsWith("/departments") ? "active" : ""
                    } ${mobileDeptOpen ? "expanded" : ""}`}
                    onClick={() => setMobileDeptOpen((prev) => !prev)}
                    aria-expanded={mobileDeptOpen}
                  >
                    <span>Departments</span>
                    <ChevronDown
                      size={18}
                      className={`mobile-accordion-arrow ${mobileDeptOpen ? "rotated" : ""}`}
                    />
                  </button>

                  <div className={`mobile-accordion-collapse ${mobileDeptOpen ? "open" : ""}`}>
                    {departmentLinks.map(({ name, path, icon: Icon }) => (
                      <Link
                        key={path}
                        to={path}
                        className={`mobile-dept-sublink ${
                          location.pathname === path ? "active" : ""
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon size={16} className="mobile-dept-icon" />
                        <span>{name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  to="/faculty"
                  className={`mobile-drawer-link ${location.pathname === "/faculty" ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Faculty
                </Link>

                <Link
                  to="/placements"
                  className={`mobile-drawer-link ${location.pathname === "/placements" ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Placements
                </Link>

                <Link
                  to="/events"
                  className={`mobile-drawer-link ${location.pathname === "/events" ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Events
                </Link>

                <Link
                  to="/gallery"
                  className={`mobile-drawer-link ${location.pathname === "/gallery" ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Gallery
                </Link>

                <Link
                  to="/contact"
                  className={`mobile-drawer-link ${location.pathname === "/contact" ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>

                <Link
                  to="/alumni"
                  className={`mobile-drawer-link ${location.pathname === "/alumni" ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Alumni
                </Link>
              </nav>

              {/* Action Buttons */}
              <div className="mobile-drawer-actions">
                <Link
                  to="/student-portal"
                  className="mobile-drawer-portal-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <GraduationCap size={18} />
                  <span>Student Portal</span>
                </Link>

                <Link
                  to="/admin/login"
                  className="mobile-drawer-admin-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Lock size={16} />
                  <span>Admin Login</span>
                </Link>
              </div>

              {/* Contact Footer in Drawer */}
              <div className="mobile-drawer-footer">
                <div className="drawer-contact-row">
                  <span className="drawer-contact-icon">✉</span>
                  <a href={`mailto:${contactDetails?.email || "gpthyd01@gmail.com"}`}>
                    {contactDetails?.email || "gpthyd01@gmail.com"}
                  </a>
                </div>
                <div className="drawer-contact-row">
                  <span className="drawer-contact-icon">☎</span>
                  <a href={`tel:${contactDetails?.phone || "9912342001"}`}>
                    {contactDetails?.phone || "9912342001"}
                  </a>
                </div>
                <p className="drawer-timing">
                  {contactDetails?.working_hours || "Working Days: 09:30 AM to 04:00 PM"}
                </p>
              </div>
            </div>
          </aside>
        </>
      )}
    </header>
  );
}
