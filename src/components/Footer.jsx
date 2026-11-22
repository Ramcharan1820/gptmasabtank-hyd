import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, GraduationCap } from "lucide-react";
import API_BASE_URL from "../apiConfig";
import "./Footer.css";

function Footer() {
  const [contactDetails, setContactDetails] = useState(null);

  useEffect(() => {
    let active = true;

    fetch(`${API_BASE_URL}/api/content/contact`)
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
        console.error("Footer contact content API error:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className="footer">

      <div className="footer-main">

        {/* COLLEGE */}
        <div className="footer-about">
          <div className="footer-logo-box">
            <img
              src="/college-logo.jpg"
              alt="Government Polytechnic College Logo"
              className="footer-logo-img"
            />
          </div>

          <h3>Government Polytechnic College</h3>

          <p>Masab Tank, Hyderabad</p>

          <p>
            Providing quality technical education,
            practical learning and professional
            development for students.
          </p>
        </div>


        {/* QUICK LINKS */}
        <div className="footer-column">
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/departments">Departments</Link>
          <Link to="/faculty">Faculty</Link>
          <Link to="/placements">Placements</Link>
          <Link to="/events">Events</Link>
        </div>


        {/* EXPLORE */}
        <div className="footer-column">
          <h3>Explore</h3>

          <Link to="/gallery">Gallery</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/student-portal">
            <GraduationCap size={15} />
            Student Portal
          </Link>
        </div>


        {/* CONTACT */}
        <div className="footer-column footer-contact">
          <h3>Contact Us</h3>

          <p>
            <MapPin size={16} />
            {contactDetails?.address || "Masab Tank, Hyderabad, Telangana – 500028"}
          </p>

          <p>
            <Phone size={16} />
            {(() => {
              const rawPhone = contactDetails?.phone || "040-23393246, 9912342001";
              const numbers = rawPhone.split(/[,/]+/).map((n) => n.trim()).filter(Boolean);
              return numbers.map((num, i) => (
                <React.Fragment key={num}>
                  {i > 0 && <span style={{ margin: "0 3px", opacity: 0.7 }}>/</span>}
                  <a href={`tel:${num.replace(/[^0-9+]/g, "")}`}>
                    {num}
                  </a>
                </React.Fragment>
              ));
            })()}
          </p>

          <p>
            <Mail size={16} />
            <a href={`mailto:${contactDetails?.email || "gpthyd01@gmail.com"}`}>
              {contactDetails?.email || "gpthyd01@gmail.com"}
            </a>
          </p>

          <div className="footer-social-links">
            <a
              href="https://www.instagram.com/gpt_masabtank_official"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @gpt_masabtank_official"
              className="footer-instagram-link"
              title="@gpt_masabtank_official on Instagram"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/gpt_masabtank_official"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-instagram-handle-link"
              title="Visit gpt_masabtank_official on Instagram"
            >
              gpt_masabtank_official
            </a>
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">

        <span>
          © {new Date().getFullYear()} Government Polytechnic College, Masab Tank. All Rights Reserved.
        </span>

        <div>
          <Link to="/contact">Contact</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/about">About</Link>
          <Link to="/student-portal">Student Portal</Link>
        </div>

      </div>

    </footer>
  );
}

export default Footer;