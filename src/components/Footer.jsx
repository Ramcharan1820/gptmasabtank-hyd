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
          <div className="footer-logo">GPT</div>

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
            {contactDetails?.address || "Masab Tank, Hyderabad, Telangana"}
          </p>

          <p>
            <Phone size={16} />
            {contactDetails?.phone || "Official College Phone"}
          </p>

          <p>
            <Mail size={16} />
            {contactDetails?.email || "Official College Email"}
          </p>
        </div>

      </div>


      {/* BOTTOM */}
      <div className="footer-bottom">

        <span>
          © {new Date().getFullYear()} Government Polytechnic College, Masab Tank.
          All Rights Reserved.
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