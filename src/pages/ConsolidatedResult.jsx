import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  GraduationCap,
  Printer,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./ConsolidatedResult.css";

const SCHEMES = [
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

const FIELD_ALIASES = {
  semester: ["Semester", "SemesterName", "SemName", "Sem", "SemYear"],
  code: ["SubjectCode", "Subject_Code", "CourseCode", "Course_Code", "SubCode"],
  subject: ["SubjectName", "Subject_Name", "CourseName", "Course_Name", "Subject"],
  credits: ["Credits", "Credit", "CourseCredits", "SubjectCredits"],
  marks: [
    "SubjectTotal",
    "TotalMarks",
    "TotalMark",
    "MarksObtained",
    "ObtainedMarks",
    "Total",
    "Marks",
    "EndSemMarks",
  ],
  grade: ["HybridGrade", "Grade", "GradePoint"],
  result: ["Result", "Status", "PassFail"],
};

function getValue(record, aliases, pattern) {
  if (!record || typeof record !== "object") {
    return "";
  }

  for (const alias of aliases) {
    const key = Object.keys(record).find(
      (candidate) => candidate.toLowerCase() === alias.toLowerCase()
    );

    if (key && record[key] !== null && record[key] !== undefined) {
      return record[key];
    }
  }

  if (pattern) {
    const match = Object.entries(record).find(
      ([key, value]) => pattern.test(key) && value !== null && value !== undefined
    );

    if (match) {
      return match[1];
    }
  }

  return "";
}

function formatValue(value) {
  return value === null || value === undefined || value === "" ? "—" : value;
}

function ConsolidatedResult() {
  const [pin, setPin] = useState("");
  const [scheme, setScheme] = useState("C24");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");

  const data = result?.data || {};
  const student = data.student || {};
  const summary = data.summary || {};
  const subjects = useMemo(
    () => (Array.isArray(data.subjects) ? data.subjects : []),
    [data.subjects]
  );
  const semesters = useMemo(
    () =>
      [
        ...new Set(
          subjects
            .map((subject) =>
              String(
                getValue(subject, FIELD_ALIASES.semester, /\bsem(ester)?\b/i)
              ).trim()
            )
            .filter(Boolean)
        ),
      ],
    [subjects]
  );
  const filteredSubjects = useMemo(
    () =>
      subjects.filter((subject) => {
        const subjectSemester = String(
          getValue(subject, FIELD_ALIASES.semester, /\bsem(ester)?\b/i)
        ).trim();
        const matchesSemester =
          semesterFilter === "all" || subjectSemester === semesterFilter;
        const matchesSearch =
          !search.trim() ||
          Object.values(subject).some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(search.trim().toLowerCase())
          );

        return matchesSemester && matchesSearch;
      }),
    [subjects, semesterFilter, search]
  );
  const studentDetails = Object.entries(student).filter(
    ([key, value]) =>
      /pin|name|branch|college|scheme|semester/i.test(key) &&
      value !== null &&
      value !== undefined &&
      value !== ""
  );
  const summaryDetails = Object.entries(summary).filter(
    ([key, value]) =>
      /cgpa|sgpa|credit|result|total|percentage/i.test(key) &&
      value !== null &&
      value !== undefined &&
      value !== ""
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResult(null);
    setError("");
    setSearch("");
    setSemesterFilter("all");

    const enteredPin = pin.trim().toUpperCase();

    if (!enteredPin) {
      setError("Enter your student PIN to continue.");
      return;
    }

    if (!/^[A-Z0-9-]+$/.test(enteredPin)) {
      setError("PIN can contain only letters, numbers, and hyphens.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({ pin: enteredPin, scheme });
      const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";
      const response = await fetch(
        `${apiBase}/api/consolidated-result?${params.toString()}`
      );
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.message || "Unable to fetch your consolidated result."
        );
      }

      setResult(payload);
    } catch (requestError) {
      setError(
        requestError.message || "Unable to fetch your consolidated result."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!filteredSubjects.length) {
      return;
    }

    const columns = [...new Set(filteredSubjects.flatMap(Object.keys))];
    const escapeCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      columns.map(escapeCell).join(","),
      ...filteredSubjects.map((subject) =>
        columns.map((column) => escapeCell(subject[column])).join(",")
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" })
    );
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "consolidated-result.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="consolidated-page">
      <section className="consolidated-hero">
        <div className="consolidated-hero-inner">
          <Link className="consolidated-back-link" to="/student-portal">
            <ArrowLeft size={17} />
            Student Portal
          </Link>
          <span className="consolidated-eyebrow">SBTET STUDENT SERVICES</span>
          <h1>Consolidated Result</h1>
          <p>Review your semester-wise academic record in one place.</p>
        </div>
      </section>

      <section className="consolidated-content">
        <div className="consolidated-search-card">
          <div className="consolidated-card-heading">
            <span className="consolidated-heading-icon">
              <GraduationCap size={22} />
            </span>
            <div>
              <h2>Find your consolidated result</h2>
              <p>Your PIN is sent securely to the college result service.</p>
            </div>
          </div>

          <form className="consolidated-form" onSubmit={handleSubmit}>
            <div className="consolidated-field">
              <label htmlFor="consolidated-pin">Student PIN</label>
              <input
                autoComplete="off"
                id="consolidated-pin"
                onChange={(event) => setPin(event.target.value)}
                placeholder="Example: 24001-CS-127"
                spellCheck="false"
                value={pin}
              />
            </div>
            <div className="consolidated-field">
              <label htmlFor="consolidated-scheme">Scheme</label>
              <select
                id="consolidated-scheme"
                onChange={(event) => setScheme(event.target.value)}
                value={scheme}
              >
                {SCHEMES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <button className="consolidated-submit" disabled={loading} type="submit">
              {loading ? "Fetching result..." : "View Consolidated Result"}
            </button>
          </form>

          {error && (
            <div className="consolidated-error" role="alert">
              <strong>Could not load result</strong>
              <p>{error}</p>
            </div>
          )}
        </div>

        {result && (
          <section aria-label="Consolidated result details" className="consolidated-report">
            <div className="consolidated-report-heading">
              <div className="consolidated-report-title">
                <span className="consolidated-report-icon">
                  <FileText size={21} />
                </span>
                <div>
                  <span className="consolidated-eyebrow">OFFICIAL RESULT DATA</span>
                  <h2>Academic Transcript</h2>
                </div>
              </div>
              <div className="consolidated-report-actions">
                <button
                  className="consolidated-action"
                  disabled={!filteredSubjects.length}
                  onClick={downloadCsv}
                  type="button"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                <button
                  className="consolidated-action"
                  onClick={() => window.print()}
                  type="button"
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>

            {studentDetails.length > 0 && (
              <div className="consolidated-student-grid">
                {studentDetails.slice(0, 8).map(([label, value]) => (
                  <div className="consolidated-detail" key={label}>
                    <span>{label.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
                    <strong>{formatValue(value)}</strong>
                  </div>
                ))}
              </div>
            )}

            {summaryDetails.length > 0 && (
              <div className="consolidated-summary-grid">
                {summaryDetails.slice(0, 8).map(([label, value]) => (
                  <div className="consolidated-summary-item" key={label}>
                    <span>{label.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
                    <strong>{formatValue(value)}</strong>
                  </div>
                ))}
              </div>
            )}

            <div className="consolidated-table-toolbar">
              <div>
                <h3>Subject results</h3>
                <span>
                  {filteredSubjects.length} of {subjects.length} records
                </span>
              </div>
              <div className="consolidated-filters">
                {semesters.length > 0 && (
                  <label className="consolidated-semester-filter">
                    <span className="visually-hidden">Filter by semester</span>
                    <select
                      onChange={(event) => setSemesterFilter(event.target.value)}
                      value={semesterFilter}
                    >
                      <option value="all">All semesters</option>
                      {semesters.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="consolidated-search">
                  <Search aria-hidden="true" size={16} />
                  <span className="visually-hidden">Search subjects</span>
                  <input
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search subjects"
                    value={search}
                  />
                </label>
              </div>
            </div>

            <div className="consolidated-table-wrap">
              <table className="consolidated-table">
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Subject Code</th>
                    <th>Subject</th>
                    <th>Credits</th>
                    <th>Marks</th>
                    <th>Grade</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((subject, index) => (
                    <tr
                      key={`${getValue(subject, FIELD_ALIASES.code, /subject.*code|course.*code/i)}-${index}`}
                    >
                      <td>
                        {formatValue(
                          getValue(
                            subject,
                            FIELD_ALIASES.semester,
                            /\bsem(ester)?\b/i
                          )
                        )}
                      </td>
                      <td>
                        {formatValue(
                          getValue(subject, FIELD_ALIASES.code, /subject.*code|course.*code/i)
                        )}
                      </td>
                      <td className="consolidated-subject-name">
                        {formatValue(
                          getValue(subject, FIELD_ALIASES.subject, /subject.*name|course.*name/i)
                        )}
                      </td>
                      <td>
                        {formatValue(
                          getValue(subject, FIELD_ALIASES.credits, /credit/i)
                        )}
                      </td>
                      <td>
                        {formatValue(
                          getValue(subject, FIELD_ALIASES.marks, /total.*mark|mark.*total|mark/i)
                        )}
                      </td>
                      <td>
                        {formatValue(
                          getValue(subject, FIELD_ALIASES.grade, /grade/i)
                        )}
                      </td>
                      <td>
                        {formatValue(
                          getValue(subject, FIELD_ALIASES.result, /result|status/i)
                        )}
                      </td>
                    </tr>
                  ))}
                  {!filteredSubjects.length && (
                    <tr>
                      <td className="consolidated-empty" colSpan="7">
                        No subject records match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export default ConsolidatedResult;
