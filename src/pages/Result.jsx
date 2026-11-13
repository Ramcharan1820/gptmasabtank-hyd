import { useState } from "react";
import API_BASE_URL from "../apiConfig";
import "./Result.css";
import MidResult from "./MidResult";
import SemesterResult from "./SemesterResult";

function Result() {
  const [pin, setPin] = useState("");
  const [scheme, setScheme] = useState("C24");
  const [semester, setSemester] = useState("5SEM");
  const [examType, setExamType] = useState("Mid-1");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const schemes = [
    "C26",
    "C24",
    "ER2020",
    "C21",
    "C09",
    "C08",
    "C05",
    "C18",
    "C16S",
    "C16",
    "ER91",
    "C14",
  ];

  const semesters = [
    "1SEM",
    "2SEM",
    "3SEM",
    "4SEM",
    "5SEM",
    "6SEM",
  ];

  const examTypes = [
    "Mid-1",
    "Mid-2",
    "Semester",
  ];

  const clearResult = () => {
    setResult(null);
    setError("");
  };

  const handleViewResult = async (e) => {
    e.preventDefault();

    setResult(null);
    setError("");

    const enteredPin = pin.trim().toUpperCase();

    if (!enteredPin) {
      setError("Please enter your PIN.");
      return;
    }

    if (!/^[A-Z0-9-]+$/.test(enteredPin)) {
      setError("PIN can contain only letters, numbers, and hyphens.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();

      params.append(
        "pin",
        enteredPin
      );

      params.append("scheme", scheme);
      params.append("semester", semester);
      params.append("examType", examType);

      /*
        SECURITY:
        Do not print the complete query string here
        because it contains the student's PIN.
      */

      console.log(
        `Requesting ${examType} result for ${semester}`
      );

      const response = await fetch(
        `${API_BASE_URL}/api/result?${params.toString()}`
      );

      const data = await response.json();

      console.log(
        "Result response received:",
        {
          success: data?.success,
          message: data?.message || null,
        }
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to fetch result from SBTET."
        );
      }

      setResult(data);

    } catch (err) {
      console.error(
        "Result error:",
        err.message
      );

      setError(
        err.message ||
          "Unable to fetch result."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="result-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="site-hero result-hero">

        <div className="result-hero-content">

          <span className="result-badge">
            STUDENT PORTAL
          </span>

          <h1>
            Student Result
          </h1>

          <p>
            View your examination result directly
            from SBTET.
          </p>

        </div>

      </section>


      {/* =================================================
          SEARCH
      ================================================= */}

      <section className="result-container">

        <div className="result-search-card">

          <div className="search-heading">

            <div className="search-icon">
              ✓
            </div>

            <div>

              <h2>
                Check Result
              </h2>

              <p>
                Enter your details to view your
                result.
              </p>

            </div>

          </div>


          <form
            onSubmit={handleViewResult}
          >

            <div className="result-form-grid">

              {/* =================================================
                  PIN
              ================================================= */}

              <div className="form-group">

                <label htmlFor="pin">
                  Student PIN
                </label>

                <input
                  id="pin"
                  type="text"
                  placeholder="Example: 24001-CS-127"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    clearResult();
                  }}
                  autoComplete="off"
                  spellCheck="false"
                />

              </div>


              {/* =================================================
                  SCHEME
              ================================================= */}

              <div className="form-group">

                <label htmlFor="scheme">
                  Scheme
                </label>

                <select
                  id="scheme"
                  value={scheme}
                  onChange={(e) => {
                    setScheme(e.target.value);
                    clearResult();
                  }}
                >

                  {schemes.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* =================================================
                  SEMESTER
              ================================================= */}

              <div className="form-group">

                <label htmlFor="semester">
                  Semester
                </label>

                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => {
                    setSemester(e.target.value);
                    clearResult();
                  }}
                >

                  {semesters.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* =================================================
                  EXAM TYPE
              ================================================= */}

              <div className="form-group">

                <label htmlFor="examType">
                  Exam Type
                </label>

                <select
                  id="examType"
                  value={examType}
                  onChange={(e) => {
                    setExamType(e.target.value);
                    clearResult();
                  }}
                >

                  {examTypes.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>


            {/* =================================================
                VIEW RESULT BUTTON
            ================================================= */}

            <button
              type="submit"
              className="view-result-btn"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="result-spinner"></span>

                  Fetching Result...
                </>
              ) : (
                <>
                  <span>
                    View Result
                  </span>

                  <span className="arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="result-error">

              <strong>
                Unable to fetch result
              </strong>

              <p>
                {error}
              </p>

            </div>
          )}

        </div>


        {/* =================================================
            RESULT OUTPUT
        ================================================= */}

        {result && (
          <div className="result-output">

            {examType === "Semester" ? (
              <SemesterResult
                result={result}
              />
            ) : (
              <MidResult
                result={result}
                examType={examType}
              />
            )}

          </div>
        )}

      </section>

    </div>
  );
}

export default Result;