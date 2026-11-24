import { useCallback, useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  GraduationCap,
  Users,
  Building2,
  RefreshCw,
  AlertCircle
} from "lucide-react";

import "./Placements.css";
import { safeFetchJson } from "../apiConfig";

const placementPlaceholderValues = new Set([
  "selected student",
  "company name",
  "placement details",
]);

const isRealPlacement = (student) => {
  const name = String(student.name || "").trim().toLowerCase();
  const details = [name, student.company, student.package, student.description]
    .map((value) => String(value || "").trim().toLowerCase());

  return Boolean(name) && !details.some((value) => placementPlaceholderValues.has(value));
};

function Placements() {
  const [managedPlacements, setManagedPlacements] = useState([]);
  const [databasePlacements, setDatabasePlacements] = useState([]);
  const [placementsApiUnavailable, setPlacementsApiUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlacements = useCallback(async () => {
    const loadData = async (endpoint, allowNotFound = false) => {
      let response;
      try {
        response = await safeFetchJson(endpoint);
      } catch (error) {
        const isUnavailableRoute =
          error.message.includes("API returned an invalid response") ||
          error.message.includes("returned an HTML document") ||
          error.message.includes("Route not found");
        if (allowNotFound && isUnavailableRoute) {
          console.warn("Placement records endpoint is not available; using published placement content.");
          return { data: [], recruiters: [], unavailable: true };
        }
        throw error;
      }

      if (!response.ok && allowNotFound && response.status === 404) {
        console.warn("Placement records endpoint is not available; using published placement content.");
        return { data: [], recruiters: [], unavailable: true };
      }
      if (!response.ok || !response.data.success || !Array.isArray(response.data.data)) {
        throw new Error(response.data.message || `Unable to load ${endpoint}.`);
      }
      return { data: response.data.data, unavailable: false };
    };

    return Promise.allSettled([
      loadData("/api/content/placements"),
      loadData("/api/placements", true),
    ]);
  }, []);

  const applyPlacementResults = useCallback(([contentResult, placementsResult]) => {
    const errors = [];
    if (contentResult.status === "fulfilled") {
      setManagedPlacements(contentResult.value.data);
    } else {
      console.error("Placement content API error:", contentResult.reason);
      errors.push(contentResult.reason.message || "Unable to load placement content.");
    }

    if (placementsResult.status === "fulfilled") {
      setDatabasePlacements(placementsResult.value.data);
      setPlacementsApiUnavailable(placementsResult.value.unavailable);
    } else {
      console.error("Placement records API error:", placementsResult.reason);
      errors.push(placementsResult.reason.message || "Unable to load placement records.");
      setPlacementsApiUnavailable(false);
    }

    setError(errors.length > 0 ? errors.join(" ") : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    loadPlacements().then((results) => {
      if (active) applyPlacementResults(results);
    });

    return () => {
      active = false;
    };
  }, [applyPlacementResults, loadPlacements]);

  const retryPlacements = useCallback(() => {
    setLoading(true);
    setError(null);
    loadPlacements().then(applyPlacementResults);
  }, [applyPlacementResults, loadPlacements]);

  const featureItems = managedPlacements.filter((item) => item.kind === "feature");
  const recruiterItems = managedPlacements.filter((item) => item.kind === "recruiter");
  const studentItems = managedPlacements.filter((item) => item.kind === "student");
  const realDatabasePlacements = databasePlacements.filter(isRealPlacement);
  const realStudentItems = studentItems.filter(isRealPlacement);
  const recruiterNames = [
    ...databasePlacements.map((student) => student.company),
    ...recruiterItems.map((item) => item.title || item.company),
  ]
    .filter((name) => typeof name === "string" && name.trim())
    .map((name) => name.trim());
  const displayedRecruiters = [
    ...new Map(
      recruiterNames
        .filter((name) => !placementPlaceholderValues.has(name.toLowerCase()))
        .map((name) => [name.toLowerCase(), name])
    ).values(),
  ];

  const displayedFeatures = featureItems;
  const displayedStudents = realDatabasePlacements.length > 0
    ? realDatabasePlacements
    : realStudentItems;

  const featureIcons = [BriefcaseBusiness, GraduationCap, Users, Building2];

  return (
    <main className="placements-page">
      {/* HERO */}
      <section className="site-hero placements-hero">
        <div className="placements-container">
          <span>CAREER & PLACEMENTS</span>
          <h1>
            Building Careers,
            <strong>Creating Opportunities</strong>
          </h1>
          <p>
            The Training & Placement Cell helps students develop
            professional skills and prepares them for opportunities
            in the industry.
          </p>
        </div>
      </section>

      {/* PLACEMENT HIGHLIGHT METRICS */}
      <section className="placement-metrics-section">
        <div className="placements-container">
          <div className="placement-stats-grid">
            <div className="placement-stat-card">
              <strong>85%+</strong>
              <span>Placement &amp; Higher Studies Transition</span>
            </div>
            <div className="placement-stat-card">
              <strong>50+</strong>
              <span>Visiting Core &amp; IT Recruiters</span>
            </div>
            <div className="placement-stat-card">
              <strong>₹ 4.8 LPA</strong>
              <span>Highest Package Offered</span>
            </div>
            <div className="placement-stat-card">
              <strong>200+</strong>
              <span>Placed Students in Recent Batches</span>
            </div>
          </div>
        </div>
      </section>

      {/* 1. TRAINING & PLACEMENT CELL */}
      <section className="placements-section">
        <div className="placements-container">
          <div className="placements-section-title">
            <span>01 • TRAINING & PLACEMENT</span>
            <h2>Training & Placement Cell</h2>
            <p>
              Our Training & Placement Cell supports students in
              developing technical knowledge, professional skills
              and career readiness.
            </p>
          </div>

          {displayedFeatures.length > 0 ? (
            <div className="placement-features">
              {displayedFeatures.map((feature, index) => {
                const Icon = featureIcons[index % featureIcons.length];
                return (
                  <article key={feature.id || feature.title || index}>
                    <div className="placement-feature-icon">
                      <Icon size={24} />
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="placements-empty">Placement training details will be published here.</p>
          )}
        </div>
      </section>

      {/* 2. OUR RECRUITERS */}
      <section className="recruiters-section" id="recruiters">
        <div className="placements-container">
          <div className="placements-section-title center">
            <span>02 • OUR RECRUITERS</span>
            <h2>Our Recruiters</h2>
            <p>
              Leading companies and organizations recruiting students from
              Government Polytechnic College.
            </p>
          </div>

          <div className="recruiters-grid">
            {displayedRecruiters.length > 0 ? (
              displayedRecruiters.map((company) => (
                <div className="recruiter-card" key={company}>
                  <div className="recruiter-logo">{company.charAt(0)}</div>
                  <span>{company}</span>
                </div>
              ))
            ) : (
              <p className="recruiters-empty">No recruiters are listed in the database yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* 3. OUR SELECTED STUDENTS */}
      <section className="students-section">
        <div className="placements-container">
          <div className="placements-section-title center">
            <span>03 • OUR SELECTED STUDENTS</span>
            <h2>Our Selected Students</h2>
            <p>
              Celebrating the achievements of our students who have
              successfully secured career opportunities.
            </p>
          </div>

          {loading && (
            <div className="placements-loading-state">
              <RefreshCw size={32} className="events-spinner" />
              <p>Loading placement records from database...</p>
            </div>
          )}

          {!loading && error && (
            <div className="students-empty">
              <AlertCircle size={40} style={{ color: "#9c1c20" }} />
              <h3>Unable to Refresh Placement Records</h3>
              <p>{error} Showing the placement information available on this page.</p>
              <button
                onClick={retryPlacements}
                className="placements-retry-btn"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && displayedStudents.length > 0 && (
            <div className="students-grid">
              {displayedStudents.map((student, index) => (
                <article
                  className="student-placement-card"
                  key={student.id || index}
                >
                  <div className="student-photo">
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = "block";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        display: student.photo ? "none" : "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Users size={38} />
                    </div>
                  </div>

                  <div className="student-info">
                    <span className="student-label">SELECTED STUDENT</span>
                    <h3>{student.name}</h3>
                    <p>{student.branch}</p>
                    <div className="student-company">
                      <Building2 size={16} />
                      <span>{student.company}</span>
                    </div>
                    <div className="student-package">
                      {student.package || student.description}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && displayedStudents.length === 0 && (
            <div className="students-empty">
              <p>
                {placementsApiUnavailable
                  ? "The database placement endpoint is not available yet. Redeploy the backend to load placement records."
                  : "No real student placement records were found in the database."}
              </p>
              {placementsApiUnavailable && (
                <button
                  onClick={retryPlacements}
                  className="placements-retry-btn"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Placements;
