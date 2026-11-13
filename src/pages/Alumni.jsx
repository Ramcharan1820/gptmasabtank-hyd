import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  BookOpen,
  BriefcaseBusiness,
  HeartHandshake,
  Award,
  ArrowRight,
  Building2,
  Mail,
  MapPin,
  CalendarDays,
  Handshake,
  Target,
  Lightbulb,
  Network,
  Globe,
  Sparkles,
  Phone,
  Clock,
  CheckCircle2,
  Trophy,
  ChevronRight,
  Share2,
  Compass,
  Rocket,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import "./Alumni.css";

const NAV_ITEMS = [
  { id: "about", label: "About Network" },
  { id: "vision", label: "Vision & Mission" },
  { id: "objectives", label: "Core Objectives" },
  { id: "hall-of-fame", label: "Wall of Fame" },
  { id: "portal", label: "Alumni Portal" },
  { id: "giving-back", label: "Giving Back" },
  { id: "activities", label: "Events & Reunions" },
  { id: "contact", label: "Secretariat Contact" },
];

const IMPACT_STATS = [
  {
    value: "100+",
    unit: "Years",
    title: "Centennial Heritage",
    subtitle: "Pioneering technical education since 1923",
  },
  {
    value: "25,000+",
    unit: "Graduates",
    title: "Global Alumni",
    subtitle: "Thriving across leading industries & PSUs",
  },
  {
    value: "7",
    unit: "Core Branches",
    title: "Engineering Wings",
    subtitle: "Civil, Mech, EEE, ECE, CSE, Auto & Pharm",
  },
  {
    value: "15+",
    unit: "Countries",
    title: "Global Chapters",
    subtitle: "Active professional networks worldwide",
  },
];

const OBJECTIVES = [
  {
    title: "Lifelong Alumni Fraternity",
    desc: "Maintain a comprehensive digital directory linking all past and graduating batches into a unified global network.",
  },
  {
    title: "High-Impact Mentorship",
    desc: "Empower current diploma students through 1-on-1 career guidance, mock interviews, and industry insights.",
  },
  {
    title: "Industrial & Career Opportunities",
    desc: "Facilitate direct campus hiring, industrial apprenticeships, and specialized training referrals across corporate partners.",
  },
  {
    title: "Curriculum & Lab Modernization",
    desc: "Engage industry veterans to review departmental curricula, advisory boards, and state-of-the-art lab facilities.",
  },
  {
    title: "Celebration of Excellence",
    desc: "Recognize distinguished alumni achievements in public service, defense, technological breakthroughs, and entrepreneurship.",
  },
  {
    title: "Institutional Growth & Reunions",
    desc: "Host annual homecomings, silver and golden jubilee reunions, and regional chapters across major metropolitan hubs.",
  },
];

const DISTINGUISHED_ALUMNI = [
  {
    role: "Aerospace & Defense",
    org: "ISRO / DRDO",
    field: "Space & Defense Missions",
    desc: "Graduates playing pivotal roles in telemetry, avionics, launch vehicles, and satellite communication missions.",
    badge: "Public Service & Defense",
  },
  {
    role: "Public Infrastructure & Power",
    org: "BHEL, NTPC & State Transco",
    field: "Power Generation & Grid",
    desc: "Senior and Chief Engineers executing national super thermal power plants, transmission networks, and heavy machinery.",
    badge: "PSU Leadership",
  },
  {
    role: "Enterprise Software & Tech",
    org: "Global IT & Silicon Valley",
    field: "Systems & Cloud Architecture",
    desc: "Engineering Directors, Solution Architects, and Product Leads architecting cloud, AI, and cybersecurity platforms.",
    badge: "Global Tech",
  },
  {
    role: "State Engineering Services",
    org: "Telangana R&B & Irrigation",
    field: "Civil & Water Infrastructure",
    desc: "Superintending Engineers heading landmark regional irrigation barrages, lift irrigation, highways, and bridges.",
    badge: "Govt. Administration",
  },
];

const GIVING_BACK_OPTIONS = [
  {
    icon: <Users size={24} />,
    title: "Student Mentorship",
    desc: "Mentor aspiring diploma engineers on emerging industry skills, higher education choices (ECET/B.Tech), and career roadmaps.",
  },
  {
    icon: <Sparkles size={24} />,
    title: "Guest Masterclasses",
    desc: "Deliver interactive expert workshops, seminars, or practical demos on modern tools and technologies in your sector.",
  },
  {
    icon: <BriefcaseBusiness size={24} />,
    title: "Internships & Referrals",
    desc: "Partner with our Training & Placement Cell to sponsor apprentice slots, paid internships, or campus recruitment drives.",
  },
  {
    icon: <Building2 size={24} />,
    title: "Lab & Campus Endowments",
    desc: "Sponsor modernized lab kits, equipment, library reference volumes, or student project development funds.",
  },
];

const UPCOMING_ACTIVITIES = [
  {
    tag: "Flagship Annual Meet",
    title: "Annual Alumni Homecoming 2026",
    date: "Third Saturday of December",
    location: "Main Auditorium, GPT Masab Tank Campus",
    desc: "An evening of reconnection, felicitation of veteran faculty, networking dinner, and panel sessions with graduating students.",
  },
  {
    tag: "Virtual Global Connect",
    title: "Tech Connect Webinar Series",
    date: "Quarterly Session (Next: July 2026)",
    location: "Online / Microsoft Teams",
    desc: "International alumni share global technology trends, overseas career opportunities, and masters admissions guidance.",
  },
  {
    tag: "Milestone Celebration",
    title: "Silver & Golden Jubilee Batch Felicitations",
    date: "Every Republic Day Weekend",
    location: "College Conference Hall",
    desc: "Commemorating batches marking 25 and 50 years since graduation with custom mementos and campus walk memory tours.",
  },
];

function Alumni() {
  const [activeSection, setActiveSection] = useState("about");

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const item = NAV_ITEMS[i];
        const element = document.getElementById(item.id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
      setActiveSection(targetId);
    }
  };

  return (
    <main className="alumni-page">
      {/* =====================================================
          STANDARDIZED MAROON HERO BANNER
      ====================================================== */}
      <section className="site-hero alumni-page-banner">
        <div className="alumni-banner-overlay"></div>

        <div className="alumni-container alumni-banner-content">
          <div className="alumni-banner-badge">
            <Sparkles size={14} />
            <span>ESTD. 1923 · GLOBAL ALUMNI NETWORK</span>
          </div>

          <h1 className="alumni-banner-title">Alumni Association</h1>

          <p className="alumni-banner-description">
            Connecting a century of engineering excellence, technical leadership,
            and lifelong fraternity. Proudly uniting graduates of Government
            Polytechnic, Masab Tank across the globe.
          </p>

          <div className="alumni-banner-actions">
            <Link to="/alumni/register" className="alumni-hero-btn alumni-hero-btn-primary">
              <GraduationCap size={18} />
              <span>Register as Alumni</span>
            </Link>

            <a
              href="#hall-of-fame"
              onClick={(e) => handleNavClick(e, "hall-of-fame")}
              className="alumni-hero-btn alumni-hero-btn-secondary"
            >
              <Trophy size={17} />
              <span>Wall of Fame</span>
            </a>
          </div>

          <nav className="alumni-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Alumni</span>
          </nav>
        </div>
      </section>

      {/* =====================================================
          IMPACT STATS RIBBON
      ====================================================== */}
      <section className="alumni-stats-section" aria-label="Alumni impact statistics">
        <div className="alumni-container">
          <div className="alumni-stats-grid">
            {IMPACT_STATS.map((stat, index) => (
              <div key={index} className="alumni-stat-card">
                <div className="alumni-stat-header">
                  <span className="alumni-stat-value">{stat.value}</span>
                  <span className="alumni-stat-unit">{stat.unit}</span>
                </div>
                <h3 className="alumni-stat-title">{stat.title}</h3>
                <p className="alumni-stat-sub">{stat.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          STICKY MOBILE / TABLET IN-PAGE SUBNAV STRIP
      ====================================================== */}
      <nav className="alumni-mobile-subnav" aria-label="Alumni section quick navigation">
        <div className="alumni-container alumni-mobile-subnav-inner">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className={`alumni-mobile-chip ${
                activeSection === item.id ? "active" : ""
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* =====================================================
          MAIN SECTION WITH STICKY SIDEBAR + CONTENT
      ====================================================== */}
      <section className="alumni-main-section">
        <div className="alumni-container alumni-layout">
          {/* DESKTOP STICKY SIDEBAR */}
          <aside className="alumni-sidebar" aria-label="Alumni in-page navigation">
            <div className="alumni-sidebar-header">
              <span className="alumni-sidebar-eyebrow">QUICK JUMP</span>
              <h2 className="alumni-sidebar-heading">Alumni Sections</h2>
            </div>

            <nav className="alumni-sidebar-nav">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`alumni-sidebar-link ${
                    activeSection === item.id ? "active" : ""
                  }`}
                >
                  <span className="sidebar-link-bullet"></span>
                  <span className="sidebar-link-text">{item.label}</span>
                  <ChevronRight size={15} className="sidebar-link-arrow" />
                </a>
              ))}
            </nav>

            {/* Sidebar Registration CTA Card */}
            <div className="alumni-sidebar-cta">
              <div className="alumni-sidebar-icon">
                <GraduationCap size={28} />
              </div>

              <h3>Alumni Registration</h3>
              <p>
                Are you a former student of GPT Masab Tank? Join our verified
                directory to reconnect and give back.
              </p>

              <Link to="/alumni/register" className="alumni-sidebar-button">
                <span>Join Directory</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Helpline Box */}
            <div className="alumni-sidebar-contact-card">
              <div className="sidebar-contact-row">
                <Mail size={16} />
                <a href="mailto:alumni@gptmasabtank.ac.in">alumni@gptmasabtank.ac.in</a>
              </div>
              <div className="sidebar-contact-row">
                <Phone size={16} />
                <a href="tel:04023390001">+91 040-23390001</a>
              </div>
            </div>
          </aside>

          {/* MAIN ARTICLE CONTENT */}
          <div className="alumni-content">
            {/* 1. ABOUT SECTION */}
            <section id="about" className="alumni-content-section">
              <div className="alumni-section-header">
                <span className="alumni-section-label">CENTURY OF DISTINCTION</span>
                <h2 className="alumni-content-heading">Welcome to the Alumni Network</h2>
              </div>

              <p className="alumni-lead-text">
                Established originally in 1923 as Osmania Technical College and
                subsequently established as Government Polytechnic, Masab Tank, Hyderabad,
                our institution stands as one of India's most historic engineering
                diploma academies.
              </p>

              <p className="alumni-body-text">
                Over the past century, thousands of diploma graduates from our civil,
                mechanical, electrical, electronics, computer, automobile, and pharmacy
                departments have scaled the highest summits of Indian and global
                industry. From building mega infrastructure projects to commanding
                public sector corporations, defense programs, and software empires,
                our alumni are our proudest ambassadors.
              </p>

              <div className="alumni-pillars-grid">
                <div className="alumni-pillar-card">
                  <div className="pillar-icon-box">
                    <Network size={24} />
                  </div>
                  <h3>Lifelong Network</h3>
                  <p>
                    Seamlessly reconnect with former classmates, seniors, juniors,
                    and faculty through our verified alumni database.
                  </p>
                </div>

                <div className="alumni-pillar-card">
                  <div className="pillar-icon-box">
                    <UserCheck size={24} />
                  </div>
                  <h3>Student Mentorship</h3>
                  <p>
                    Guide budding diploma candidates on higher studies, ECET exams,
                    interviews, and technical problem-solving.
                  </p>
                </div>

                <div className="alumni-pillar-card">
                  <div className="pillar-icon-box">
                    <Award size={24} />
                  </div>
                  <h3>Alma Mater Growth</h3>
                  <p>
                    Contribute technical knowledge, sponsor modern lab tools,
                    and help shape industry-aligned training programs.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. VISION & MISSION */}
            <section id="vision" className="alumni-content-section">
              <div className="alumni-section-header">
                <span className="alumni-section-label">STRATEGIC ANCHOR</span>
                <h2 className="alumni-content-heading">Our Vision & Mission</h2>
              </div>

              <div className="alumni-vision-section">
                <div className="alumni-vision-card">
                  <div className="alumni-vision-icon">
                    <Lightbulb size={28} />
                  </div>
                  <div>
                    <span className="alumni-card-tag">THE VISION</span>
                    <h3 className="alumni-card-heading">Empowering Lifelong Excellence</h3>
                    <p className="alumni-vision-text">
                      To build an active, prestigious, and globally connected alumni
                      community that honors the centennial legacy of Government
                      Polytechnic Masab Tank, inspiring successive generations
                      of engineers to excel and innovate.
                    </p>
                  </div>
                </div>

                <div className="alumni-vision-card alumni-mission-card">
                  <div className="alumni-vision-icon">
                    <Target size={28} />
                  </div>
                  <div>
                    <span className="alumni-card-tag">THE MISSION</span>
                    <h3 className="alumni-card-heading">Fostering Impactful Partnerships</h3>
                    <p className="alumni-vision-text">
                      To facilitate meaningful engagement between alumni, students,
                      and faculty through active mentorship, industry collaborations,
                      annual reunions, and institutional development initiatives.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. CORE OBJECTIVES */}
            <section id="objectives" className="alumni-content-section">
              <div className="alumni-section-header">
                <span className="alumni-section-label">GUIDING PRINCIPLES</span>
                <h2 className="alumni-content-heading">Strategic Objectives</h2>
              </div>

              <p className="alumni-body-text">
                The Alumni Association operates with clear institutional mandates
                designed to preserve our proud history while accelerating modern
                advancements.
              </p>

              <div className="alumni-objectives-grid">
                {OBJECTIVES.map((item, index) => (
                  <div key={index} className="alumni-objective-item">
                    <div className="alumni-objective-bullet">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="alumni-obj-title">{item.title}</h4>
                      <p className="alumni-obj-desc">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. DISTINGUISHED ALUMNI / WALL OF FAME */}
            <section id="hall-of-fame" className="alumni-content-section">
              <div className="alumni-section-header">
                <span className="alumni-section-label">EXCELLENCE IN ACTION</span>
                <h2 className="alumni-content-heading">Wall of Fame & Alumni Leadership</h2>
              </div>

              <p className="alumni-body-text">
                Our graduates lead transformative projects across aerospace, national
                defense, power utilities, public works, and global technology firms.
              </p>

              <div className="alumni-distinguished-grid">
                {DISTINGUISHED_ALUMNI.map((alumnus, idx) => (
                  <div key={idx} className="alumni-distinguished-card">
                    <span className="distinguished-badge">{alumnus.badge}</span>
                    <h4 className="distinguished-org">{alumnus.org}</h4>
                    <span className="distinguished-role">{alumnus.role} · {alumnus.field}</span>
                    <p className="distinguished-desc">{alumnus.desc}</p>
                  </div>
                ))}
              </div>

              <div className="alumni-quote-banner">
                <div className="quote-mark">“</div>
                <div className="quote-body">
                  <p className="quote-text">
                    The hands-on laboratory rigour and disciplined technical foundations
                    we received at Government Polytechnic, Masab Tank gave us the
                    confidence to tackle the most complex engineering challenges of our careers.
                  </p>
                  <span className="quote-attribution">
                    — Alumni Consensus, All-Batch Reunion
                  </span>
                </div>
              </div>
            </section>

            {/* 5. REGISTRATION PORTAL */}
            <section id="portal" className="alumni-content-section">
              <div className="alumni-portal-card">
                <div className="alumni-portal-icon">
                  <GraduationCap size={44} />
                </div>

                <div className="alumni-portal-content">
                  <span className="alumni-section-label">CENTRAL DIRECTORY</span>
                  <h2 className="alumni-content-heading">Official Alumni Registration</h2>

                  <p className="alumni-body-text">
                    Whether you graduated recently or decades ago, registering ensures
                    you are counted in our official rolls, receive reunion invitations,
                    and stay in touch with your department.
                  </p>

                  <div className="alumni-portal-perks-grid">
                    <div className="portal-perk-item">
                      <ShieldCheck size={18} className="perk-icon" />
                      <span>Verified Alumni Profile & Directory Access</span>
                    </div>
                    <div className="portal-perk-item">
                      <CalendarDays size={18} className="perk-icon" />
                      <span>Exclusive Invitations to Annual Homecomings</span>
                    </div>
                    <div className="portal-perk-item">
                      <Handshake size={18} className="perk-icon" />
                      <span>Direct Mentorship with Department Students</span>
                    </div>
                    <div className="portal-perk-item">
                      <Share2 size={18} className="perk-icon" />
                      <span>Professional Networking & Career Referrals</span>
                    </div>
                  </div>

                  <div className="alumni-portal-actions">
                    <Link to="/alumni/register" className="alumni-primary-button">
                      <span>Begin Registration</span>
                      <ArrowRight size={18} />
                    </Link>

                    <span className="portal-secure-note">
                      🔒 Secure registration using Google or Verified Email
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. GIVING BACK & MENTORSHIP */}
            <section id="giving-back" className="alumni-content-section">
              <div className="alumni-section-header">
                <span className="alumni-section-label">PAY IT FORWARD</span>
                <h2 className="alumni-content-heading">Giving Back & Mentorship</h2>
              </div>

              <p className="alumni-body-text">
                Your experience can illuminate the path for a young diploma engineer.
                Here are the primary avenues through which our alumni actively
                collaborate with the college:
              </p>

              <div className="alumni-giving-grid">
                {GIVING_BACK_OPTIONS.map((item, idx) => (
                  <div key={idx} className="giving-card">
                    <div className="giving-icon-wrap">{item.icon}</div>
                    <h3 className="giving-title">{item.title}</h3>
                    <p className="giving-desc">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. ACTIVITIES & REUNIONS */}
            <section id="activities" className="alumni-content-section">
              <div className="alumni-section-header">
                <span className="alumni-section-label">COMMUNITY ENGAGEMENT</span>
                <h2 className="alumni-content-heading">Alumni Activities & Reunions</h2>
              </div>

              <p className="alumni-body-text">
                Stay updated with official alumni gatherings, technical panels,
                and milestone celebrations organized throughout the academic year.
              </p>

              <div className="alumni-events-stack">
                {UPCOMING_ACTIVITIES.map((act, index) => (
                  <article key={index} className="alumni-event-row">
                    <div className="event-date-col">
                      <CalendarDays size={24} />
                      <span className="event-tag">{act.tag}</span>
                    </div>

                    <div className="event-info-col">
                      <h3 className="event-title">{act.title}</h3>
                      <div className="event-meta-row">
                        <span className="event-meta-item">
                          <Clock size={14} /> {act.date}
                        </span>
                        <span className="event-meta-item">
                          <MapPin size={14} /> {act.location}
                        </span>
                      </div>
                      <p className="event-desc">{act.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* 8. CONTACT / SECRETARIAT */}
            <section id="contact" className="alumni-content-section alumni-contact-block">
              <div className="alumni-section-header">
                <span className="alumni-section-label">ALUMNI SECRETARIAT</span>
                <h2 className="alumni-content-heading">Office & Contact Details</h2>
              </div>

              <p className="alumni-body-text">
                For alumni verification, homecoming coordination, chapter formations,
                or guest lecture scheduling, reach out directly to the Alumni Relations Cell.
              </p>

              <div className="alumni-secretariat-card">
                <div className="secretariat-icon-box">
                  <Building2 size={36} />
                </div>

                <div className="secretariat-details">
                  <h3 className="secretariat-college-name">
                    Government Polytechnic College, Masab Tank
                  </h3>
                  <span className="secretariat-sub">Alumni Relations Cell & Secretariat</span>

                  <div className="secretariat-contacts-list">
                    <div className="secretariat-row">
                      <MapPin size={18} className="sec-icon" />
                      <div>
                        <strong>Campus Address:</strong>
                        <p>Masab Tank, Hyderabad, Telangana — 500028, India</p>
                      </div>
                    </div>

                    <div className="secretariat-row">
                      <Mail size={18} className="sec-icon" />
                      <div>
                        <strong>Official Email:</strong>
                        <p>
                          <a href="mailto:alumni@gptmasabtank.ac.in">alumni@gptmasabtank.ac.in</a> /{" "}
                          <a href="mailto:gpthyd01@gmail.com">gpthyd01@gmail.com</a>
                        </p>
                      </div>
                    </div>

                    <div className="secretariat-row">
                      <Phone size={18} className="sec-icon" />
                      <div>
                        <strong>Office Helpline:</strong>
                        <p>
                          <a href="tel:04023390001">+91 040-23390001</a> /{" "}
                          <a href="tel:9912342001">+91 9912342001</a>
                        </p>
                      </div>
                    </div>

                    <div className="secretariat-row">
                      <Clock size={18} className="sec-icon" />
                      <div>
                        <strong>Office Timings:</strong>
                        <p>Monday to Saturday: 09:30 AM to 04:30 PM (Except State Holidays)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alumni-campus-welcome-notice">
                <Sparkles size={18} className="notice-icon" />
                <p>
                  <strong>Visiting the Campus?</strong> Alumni are always warmly welcomed
                  to walk down memory lane. For group batch visits or campus tours,
                  please write to us 2 days in advance to ensure faculty coordination.
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* =====================================================
          BOTTOM CALL TO ACTION
      ====================================================== */}
      <section className="alumni-bottom-cta">
        <div className="alumni-container">
          <div className="alumni-bottom-cta-inner">
            <div className="alumni-bottom-cta-icon">
              <Handshake size={38} />
            </div>

            <div className="alumni-bottom-cta-text">
              <h2>Your Bond with Masab Tank is Forever</h2>
              <p>
                Be part of our vibrant alumni community. Reconnect with fellow
                graduates, share your achievements, and inspire the engineers of tomorrow.
              </p>
            </div>

            <div className="alumni-bottom-cta-buttons">
              <Link to="/alumni/register" className="alumni-bottom-cta-btn alumni-bottom-cta-primary">
                <span>Join Alumni Network</span>
                <ArrowRight size={18} />
              </Link>

              <Link to="/departments" className="alumni-bottom-cta-btn alumni-bottom-cta-secondary">
                <span>Explore Departments</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Alumni;
