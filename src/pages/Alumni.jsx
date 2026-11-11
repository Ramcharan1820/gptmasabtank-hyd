import React from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  BookOpen,
  BriefcaseBusiness,
  HeartHandshake,
  Award,
  ArrowRight,
  ExternalLink,
  Building2,
  Mail,
  MapPin,
  CalendarDays,
  Handshake,
  Target,
  Lightbulb,
  Network,
  UserRoundCheck,
} from "lucide-react";

import "./Alumni.css";

function Alumni() {
  const objectives = [
    "Maintain a strong connection between the college and its alumni.",
    "Encourage professional networking among former students.",
    "Support current students through mentorship and career guidance.",
    "Share employment opportunities and professional achievements.",
    "Encourage alumni participation in college development activities.",
    "Build a supportive community for past and present students.",
  ];

  const activities = [
    {
      icon: <Users size={22} />,
      title: "Alumni Meetups",
      description:
        "Organize alumni gatherings to reconnect former classmates, share experiences, and strengthen relationships.",
    },
    {
      icon: <BookOpen size={22} />,
      title: "Student Mentorship",
      description:
        "Encourage alumni to guide current students with academic advice, career planning, and professional experience.",
    },
    {
      icon: <BriefcaseBusiness size={22} />,
      title: "Career Opportunities",
      description:
        "Share relevant job openings, internship opportunities, and career information with the college community.",
    },
    {
      icon: <HeartHandshake size={22} />,
      title: "College Development",
      description:
        "Invite alumni to contribute ideas, technical knowledge, and support for educational and institutional activities.",
    },
  ];

  const services = [
    {
      icon: <Network size={27} />,
      title: "Connect",
      description:
        "Reconnect with former classmates, faculty members, and other graduates of the college.",
    },
    {
      icon: <UserRoundCheck size={27} />,
      title: "Mentor",
      description:
        "Share your experience and help current students make informed academic and career decisions.",
    },
    {
      icon: <Award size={27} />,
      title: "Achieve Together",
      description:
        "Celebrate alumni achievements and inspire the next generation of students.",
    },
  ];

  return (
    <main className="alumni-page">
      {/* Page Banner */}
      <section className="alumni-page-banner">
        <div className="alumni-banner-overlay"></div>

        <div className="alumni-container alumni-banner-content">
          <span className="alumni-banner-label">
            OUR COLLEGE COMMUNITY
          </span>

          <h1 className="alumni-banner-title">Alumni Network</h1>

          <p className="alumni-banner-description">
            Once a student, always a part of our college family.
            Stay connected, share your journey, and help build a
            stronger future for the next generation.
          </p>

          <div className="alumni-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Alumni</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="alumni-main-section">
        <div className="alumni-container alumni-layout">
          {/* Sidebar */}
          <aside className="alumni-sidebar">
            <h2 className="alumni-sidebar-heading">
              Alumni Navigation
            </h2>

            <a href="#about" className="alumni-sidebar-link">
              About Alumni
              <ArrowRight size={16} />
            </a>

            <a href="#vision" className="alumni-sidebar-link">
              Vision & Mission
              <ArrowRight size={16} />
            </a>

            <a href="#objectives" className="alumni-sidebar-link">
              Objectives
              <ArrowRight size={16} />
            </a>

            <a href="#portal" className="alumni-sidebar-link">
              Alumni Registration
              <ArrowRight size={16} />
            </a>

            <a href="#activities" className="alumni-sidebar-link">
              Activities
              <ArrowRight size={16} />
            </a>

            <a href="#contact" className="alumni-sidebar-link">
              Contact Information
              <ArrowRight size={16} />
            </a>

            <div className="alumni-sidebar-cta">
              <div className="alumni-sidebar-icon">
                <GraduationCap size={30} />
              </div>

              <h3>Stay Connected</h3>

              <p>
                Join the alumni community and stay connected
                with your college.
              </p>

              <Link
                to="/alumni/register"
                className="alumni-sidebar-button"
              >
                Register Now
                <ArrowRight size={16} />
              </Link>
            </div>
          </aside>

          {/* Main Article */}
          <div className="alumni-content">
            {/* About */}
            <section
              id="about"
              className="alumni-content-section"
            >
              <span className="alumni-section-label">
                WELCOME BACK
              </span>

              <h2 className="alumni-content-heading">
                About Our Alumni Network
              </h2>

              <p className="alumni-body-text">
                The Alumni Network of Government Polytechnic
                College, Masab Tank, Hyderabad, aims to maintain
                a meaningful connection between the institution
                and its former students.
              </p>

              <p className="alumni-body-text">
                Alumni are an important part of the college
                community. Their professional experiences,
                achievements, and guidance can inspire current
                students and contribute to the continued growth
                of the institution.
              </p>

              <p className="alumni-body-text">
                This platform is intended to help graduates
                reconnect with classmates, share professional
                updates, explore networking opportunities, and
                participate in college-related activities.
              </p>
            </section>

            {/* Vision and Mission */}
            <section
              id="vision"
              className="alumni-content-section alumni-vision-section"
            >
              <div className="alumni-vision-card">
                <div className="alumni-vision-icon">
                  <Lightbulb size={27} />
                </div>

                <div>
                  <h3 className="alumni-card-heading">
                    Our Vision
                  </h3>

                  <p className="alumni-vision-text">
                    To build a connected and supportive alumni
                    community that promotes lifelong
                    relationships, professional growth, and
                    educational excellence.
                  </p>
                </div>
              </div>

              <div className="alumni-vision-card alumni-mission-card">
                <div className="alumni-vision-icon">
                  <Target size={27} />
                </div>

                <div>
                  <h3 className="alumni-card-heading">
                    Our Mission
                  </h3>

                  <p className="alumni-vision-text">
                    To encourage communication, mentorship,
                    knowledge sharing, and active participation
                    between alumni, students, faculty, and the
                    college.
                  </p>
                </div>
              </div>
            </section>

            {/* Objectives */}
            <section
              id="objectives"
              className="alumni-content-section"
            >
              <span className="alumni-section-label">
                OUR PURPOSE
              </span>

              <h2 className="alumni-content-heading">
                Objectives of the Alumni Network
              </h2>

              <p className="alumni-body-text">
                The network aims to create opportunities for
                alumni to remain connected with one another
                and contribute to the development of the
                college community.
              </p>

              <ul className="alumni-objectives-list">
                {objectives.map((objective, index) => (
                  <li key={index}>
                    <span className="alumni-objective-check">
                      ✓
                    </span>

                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Alumni Portal */}
            <section
              id="portal"
              className="alumni-content-section"
            >
              <div className="alumni-portal-card">
                <div className="alumni-portal-icon">
                  <GraduationCap size={36} />
                </div>

                <div className="alumni-portal-content">
                  <span className="alumni-section-label">
                    JOIN OUR COMMUNITY
                  </span>

                  <h2 className="alumni-content-heading">
                    Alumni Registration Portal
                  </h2>

                  <p className="alumni-body-text">
                    Are you a former student of Government
                    Polytechnic College, Masab Tank? Register
                    to become part of our alumni community.
                    Connect with fellow graduates and explore
                    opportunities to stay involved with your
                    college.
                  </p>

                  <ul className="alumni-portal-list">
                    <li>
                      <span>✓</span>
                      Create your alumni profile.
                    </li>

                    <li>
                      <span>✓</span>
                      Share your education and career details.
                    </li>

                    <li>
                      <span>✓</span>
                      Stay informed about alumni activities.
                    </li>

                    <li>
                      <span>✓</span>
                      Explore mentorship and networking.
                    </li>
                  </ul>

                  <Link
                    to="/alumni/register"
                    className="alumni-primary-button"
                  >
                    Register as Alumni
                    <ArrowRight size={18} />
                  </Link>

                  <p className="alumni-portal-note">
                    Please provide accurate information when
                    completing your registration.
                  </p>
                </div>
              </div>
            </section>

            {/* Benefits */}
            <section className="alumni-content-section">
              <span className="alumni-section-label">
                STRONGER TOGETHER
              </span>

              <h2 className="alumni-content-heading">
                Be a Part of Our Community
              </h2>

              <p className="alumni-body-text">
                An active alumni network creates opportunities
                for learning, collaboration, and lasting
                professional relationships.
              </p>

              <div className="alumni-information-grid">
                {services.map((service, index) => (
                  <article
                    className="alumni-information-card"
                    key={index}
                  >
                    <div className="alumni-information-icon">
                      {service.icon}
                    </div>

                    <h3>{service.title}</h3>

                    <p>{service.description}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* Activities */}
            <section
              id="activities"
              className="alumni-content-section"
            >
              <span className="alumni-section-label">
                PARTICIPATE AND CONTRIBUTE
              </span>

              <h2 className="alumni-content-heading">
                Alumni Activities
              </h2>

              <p className="alumni-body-text">
                Alumni can support the college community in
                many ways by sharing their knowledge,
                experience, and professional connections.
              </p>

              <div className="alumni-activity-list">
                {activities.map((activity, index) => (
                  <article
                    className="alumni-activity-item"
                    key={index}
                  >
                    <div className="alumni-activity-icon">
                      {activity.icon}
                    </div>

                    <div>
                      <h3>{activity.title}</h3>

                      <p>{activity.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Contact */}
            <section
              id="contact"
              className="alumni-content-section alumni-office-section"
            >
              <span className="alumni-section-label">
                GET IN TOUCH
              </span>

              <h2 className="alumni-content-heading">
                College Contact Information
              </h2>

              <p className="alumni-body-text">
                For information about alumni activities or
                college-related enquiries, contact the college
                through its official communication channels.
              </p>

              <div className="alumni-office-card">
                <div className="alumni-office-icon">
                  <Building2 size={30} />
                </div>

                <div className="alumni-office-details">
                  <h3>
                    Government Polytechnic College,
                    Masab Tank
                  </h3>

                  <p>
                    <MapPin size={17} />
                    <span>
                      Masab Tank, Hyderabad, Telangana, India
                    </span>
                  </p>

                  <p>
                    <Mail size={17} />
                    <span>
                      Please refer to the official college
                      website for verified contact details.
                    </span>
                  </p>

                  <p>
                    <CalendarDays size={17} />
                    <span>
                      Alumni meetings and activities can be
                      announced through official college
                      communication channels.
                    </span>
                  </p>
                </div>
              </div>

              <p className="alumni-office-disclaimer">
                Note: Alumni activities, events, and contact
                arrangements should be confirmed with the
                college. This page does not imply that a
                particular event or alumni association has
                already been officially established.
              </p>
            </section>
          </div>
        </div>
      </section>

      {/* Bottom Call to Action */}
      <section className="alumni-bottom-cta">
        <div className="alumni-container alumni-bottom-cta-inner">
          <div className="alumni-bottom-cta-icon">
            <Handshake size={38} />
          </div>

          <div className="alumni-bottom-cta-text">
            <h2>Your Journey with Us Continues</h2>

            <p>
              Reconnect with your college and help inspire
              future generations of students.
            </p>
          </div>

          <Link
            to="/alumni/register"
            className="alumni-bottom-cta-button"
          >
            Join Alumni Network
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Alumni;