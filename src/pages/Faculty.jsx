import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  GraduationCap,
  Mail,
  Phone,
  Search,
  UserRound,
  Award,
  BookOpen,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import "./Faculty.css";
import API_BASE_URL from "../apiConfig";
import { principalData as defaultPrincipal, facultyList as defaultFacultyList } from "../data/facultyData";
import ImageWithFallback from "../components/ImageWithFallback";

const normalizeFacultyDepartment = (faculty) => ({
  ...faculty,
  department:
    typeof faculty.department === "string" &&
    faculty.department.trim().toLowerCase() === "general"
      ? "Humanities and Sciences"
      : faculty.department,
});

const getDesignationPriority = (designation) => {
  const normalizedDesignation =
    typeof designation === "string" ? designation.trim().toLowerCase() : "";

  if (normalizedDesignation.includes("hod") || normalizedDesignation.includes("head of")) {
    return 0;
  }
  if (
    normalizedDesignation.includes("senior lecturer") ||
    /^sl\s*\//.test(normalizedDesignation)
  ) {
    return 1;
  }
  if (
    normalizedDesignation.includes("lectur") ||
    /^l\s*\//.test(normalizedDesignation)
  ) {
    return 2;
  }
  return 3;
};

export default function Faculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [searchTerm, setSearchTerm] = useState("");

  const buildFallbackFaculty = () => [
    {
      ...defaultPrincipal,
      id: "principal",
      is_leadership: true,
      department: "Leadership",
      photo: defaultPrincipal.image || "/principal.jpg",
    },
    ...defaultFacultyList.map((f) => ({
      ...normalizeFacultyDepartment(f),
      photo: f.image || "/images/faculty/faculty-placeholder.png",
      is_leadership: false,
    })),
  ];

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/content/faculty`);
      const result = await response.json();
      if (response.ok && result.success && Array.isArray(result.data) && result.data.length > 0) {
        setFacultyList(result.data.map(normalizeFacultyDepartment));
      } else {
        setFacultyList(buildFallbackFaculty());
      }
    } catch (err) {
      console.warn("Faculty content API unavailable, using verified academic faculty roster:", err.message);
      setFacultyList(buildFallbackFaculty());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
    window.addEventListener("faculty-updated", fetchFaculty);
    window.addEventListener("storage", fetchFaculty);

    return () => {
      window.removeEventListener("faculty-updated", fetchFaculty);
      window.removeEventListener("storage", fetchFaculty);
    };
  }, []);

  // Separate institutional leadership (e.g. Principal) if present in database
  const principal = facultyList.find(
    (member) =>
      Boolean(member.is_leadership) ||
      Number(member.is_leadership) === 1 ||
      member.department === "Principal" ||
      (typeof member.designation === "string" &&
        member.designation.toLowerCase().includes("principal"))
  );

  const facultyMembers = facultyList.filter((member) => member !== principal);

  const departments = [
    "All Departments",
    ...new Set(facultyMembers.map((faculty) => faculty.department).filter(Boolean)),
  ];

  const filteredFaculty = facultyMembers
    .filter((faculty) => {
      const matchesDepartment =
        selectedDepartment === "All Departments" ||
        faculty.department === selectedDepartment;

      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        (faculty.name || "").toLowerCase().includes(searchValue) ||
        (faculty.department || "").toLowerCase().includes(searchValue) ||
        (faculty.designation || "").toLowerCase().includes(searchValue) ||
        (faculty.specialization || "").toLowerCase().includes(searchValue) ||
        (faculty.qualification || "").toLowerCase().includes(searchValue) ||
        String(faculty.faculty_code || faculty.id || "").toLowerCase().includes(searchValue);

      return matchesDepartment && matchesSearch;
    })
    .sort(
      (first, second) =>
        getDesignationPriority(first.designation) -
        getDesignationPriority(second.designation)
    );

  return (
    <main className="faculty-page">
      {/* HERO SECTION */}
      <section className="site-hero faculty-hero">
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

      {/* PRINCIPAL SPOTLIGHT (Rendered dynamically only when present in database) */}
      {principal && (
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
                <ImageWithFallback
                  src={principal.photo || "/principal.jpg"}
                  alt={principal.name || "Principal"}
                  fallbackSrc="/principal.jpg"
                />
                <span className="principal-badge">
                  <Award size={14} /> Principal
                </span>
              </div>

              <div className="principal-details">
                <h3>{principal.name}</h3>
                <p className="principal-sub">{principal.designation || "Head of Institution"}</p>

                <div className="principal-meta">
                  {principal.qualification && (
                    <span>
                      <GraduationCap size={16} /> {principal.qualification}
                    </span>
                  )}
                  {principal.experience && (
                    <span>
                      <BriefcaseBusiness size={16} /> {principal.experience}
                    </span>
                  )}
                </div>

                {principal.message && (
                  <blockquote className="principal-quote">
                    "{principal.message}"
                  </blockquote>
                )}

                <div className="principal-contact">
                  {principal.email && (
                    <a href={`mailto:${principal.email}`}>
                      <Mail size={15} /> {principal.email}
                    </a>
                  )}
                  {principal.phone && (
                    <span>
                      <Phone size={15} /> {principal.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

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
            <div className="faculty-department-dropdown-wrap">
              <label htmlFor="faculty-dept-select">Department:</label>
              <select
                id="faculty-dept-select"
                className="faculty-department-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                aria-label="Filter by department"
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div className="department-filters">
              {departments.map((department) => (
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

          {/* LOADING STATE */}
          {loading && (
            <div className="faculty-loading-state">
              <RefreshCw size={36} className="events-spinner" />
              <p>Loading faculty records from database...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="faculty-empty">
              <AlertCircle size={44} style={{ color: "#9c1c20" }} />
              <h3>Unable to Load Faculty</h3>
              <p>{error}</p>
              <button
                type="button"
                className="faculty-retry-btn"
                onClick={fetchFaculty}
              >
                Retry
              </button>
            </div>
          )}

          {/* NO RECORDS FOUND */}
          {!loading && !error && facultyList.length === 0 && (
            <div className="faculty-empty">
              <UserRound size={52} />
              <h3>No Faculty Records Found</h3>
              <p>Faculty added through the Admin Dashboard will appear here automatically.</p>
            </div>
          )}

          {/* FILTERED EMPTY */}
          {!loading && !error && facultyList.length > 0 && filteredFaculty.length === 0 && (
            <div className="faculty-empty">
              <UserRound size={48} />
              <h3>No Faculty Members Match Your Criteria</h3>
              <p>Try switching departments or clearing your search term.</p>
              <button
                type="button"
                className="faculty-retry-btn"
                onClick={() => {
                  setSelectedDepartment("All Departments");
                  setSearchTerm("");
                }}
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* FACULTY CARDS GRID */}
          {!loading && !error && filteredFaculty.length > 0 && (
            <div className="faculty-grid">
              {filteredFaculty.map((faculty) => (
                <article className="faculty-card" key={faculty.id || faculty.faculty_code || faculty.name}>
                  {/* PHOTO */}
                  <div className="faculty-photo">
                    <ImageWithFallback
                      src={faculty.photo}
                      alt={faculty.name}
                      fallback={
                        <div className="faculty-photo-placeholder">
                          <UserRound size={56} />
                          <span>{faculty.name}</span>
                        </div>
                      }
                    />
                    {faculty.department && (
                      <div className="faculty-department-badge">
                        {faculty.department}
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="faculty-card-body">
                    {(faculty.faculty_code || faculty.id) && (
                      <span className="faculty-id">FACULTY ID: {faculty.faculty_code || faculty.id}</span>
                    )}
                    <h3>{faculty.name}</h3>
                    <p className="faculty-designation">{faculty.designation}</p>

                    <div className="faculty-info">
                      {faculty.qualification && (
                        <div className="faculty-info-row">
                          <GraduationCap size={16} />
                          <div>
                            <small>Qualification</small>
                            <strong>{faculty.qualification}</strong>
                          </div>
                        </div>
                      )}

                      {faculty.experience && (
                        <div className="faculty-info-row">
                          <BriefcaseBusiness size={16} />
                          <div>
                            <small>Experience</small>
                            <strong>{faculty.experience}</strong>
                          </div>
                        </div>
                      )}
                    </div>

                    {faculty.specialization && (
                      <div className="faculty-specialization">
                        <span>Specialization</span>
                        <p>{faculty.specialization}</p>
                      </div>
                    )}

                    {faculty.email && (
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
                    )}
                  </div>
                </article>
              ))}
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
