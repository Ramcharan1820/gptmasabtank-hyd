import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Filter,
  GraduationCap,
  Printer,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import API_BASE_URL, { safeFetchJson } from "../apiConfig";
import "./ConsolidatedResult.css";

const SCHEMES = [
  "C26",
  "C24",
  "C21",
  "C18",
  "C16S",
  "C16",
  "C14",
  "C09",
  "C08",
  "C05",
  "ER2020",
  "ER91",
];

const FIELD_ALIASES = {
  semester: ["Semester", "SemesterName", "SemName", "Sem", "SemYear"],
  code: ["Subject_Code", "SubjectCode", "CourseCode", "Course_Code", "SubCode"],
  subject: ["SubjectName", "Subject_Name", "CourseName", "Course_Name", "Subject"],
  credits: ["CreditsGained", "MaxCredits", "Credits", "Credit", "CourseCredits", "SubjectCredits"],
  marks: [
    "SubjectTotal",
    "TotalMarks",
    "TotalMark",
    "MarksObtained",
    "ObtainedMarks",
    "Total",
    "Marks",
  ],
  grade: ["HybridGrade", "Grade", "GradePoint"],
  result: ["ExamStatus", "Result", "Status", "PassFail"],
  mid1: ["Mid1Marks", "MID1_MARKS", "Mid1"],
  mid2: ["Mid2Marks", "MID2_MARKS", "Mid2"],
  internal: ["InternalMarks", "Internal_MARKS", "Internal"],
  endExam: ["EndExamMarks", "EndSemMarks", "EndExamMarksSecured", "EndExam"],
  monthYear: ["ExamMonthYear", "ExamYearMonth", "MonthYear"],
};

function getValue(record, aliases, pattern) {
  if (!record || typeof record !== "object") return "";

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
    if (match) return match[1];
  }

  return "";
}

function formatValue(value) {
  return value === null || value === undefined || value === "" ? "—" : value;
}

function getSemNumber(item) {
  if (!item || typeof item !== "object") return 0;
  if (item.SemId !== undefined && item.SemId !== null && !isNaN(Number(item.SemId))) {
    return Number(item.SemId);
  }
  const raw = String(item.Semester || item.Sem || item.SemYear || item.SemesterName || "");
  const match = raw.match(/([1-8])/);
  if (match) return Number(match[1]);

  const romanMap = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8 };
  for (const [r, n] of Object.entries(romanMap)) {
    if (raw.toUpperCase().includes(r)) return n;
  }
  return 0;
}

function isSubjectPassed(sub) {
  const status = String(getValue(sub, FIELD_ALIASES.result, /status|result/i)).trim().toUpperCase();
  const grade = String(getValue(sub, FIELD_ALIASES.grade, /grade/i)).trim().toUpperCase();
  if (status === "P" || status === "PASS" || status === "PASSED") return true;
  if (status === "F" || status === "FAIL" || status === "FAILED" || grade === "F") return false;
  const marks = Number(getValue(sub, FIELD_ALIASES.marks, /mark|total/i));
  if (Number.isFinite(marks) && marks >= 35) return true;
  return true;
}

function getGradeBadgeClass(grade) {
  const g = String(grade || "").trim().toUpperCase();
  if (g.includes("A+") || g === "O" || g === "10" || g === "DISTINCTION") return "grade-badge grade-o";
  if (g.startsWith("A") || g === "9") return "grade-badge grade-a";
  if (g.startsWith("B") || g === "8") return "grade-badge grade-b";
  if (g.startsWith("C") || g === "7") return "grade-badge grade-c";
  if (g.startsWith("D") || g === "6") return "grade-badge grade-d";
  if (g === "F" || g.includes("FAIL")) return "grade-badge grade-f";
  return "grade-badge grade-default";
}

function ConsolidatedResult() {
  const [pin, setPin] = useState("");
  const [scheme, setScheme] = useState("C21");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeSemTab, setActiveSemTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const data = result?.data || {};
  const student = data.student || {};
  const summary = data.summary || {};
  const subjects = useMemo(
    () => (Array.isArray(data.subjects) ? data.subjects : []),
    [data.subjects]
  );
  const serverSemesters = useMemo(
    () => (Array.isArray(data.semesters) ? data.semesters : []),
    [data.semesters]
  );

  // Group subjects by Semester strictly in chronological order (1SEM -> 6SEM)
  const semesterGroups = useMemo(() => {
    if (!subjects.length) return [];

    const map = new Map();

    for (const sub of subjects) {
      const semNum = getSemNumber(sub) || 1;
      const semKey = String(getValue(sub, FIELD_ALIASES.semester, /\bsem\b/i) || `${semNum}SEM`).trim().toUpperCase();

      if (!map.has(semNum)) {
        map.set(semNum, {
          semNum,
          semKey,
          semTitle: `Semester ${semNum}`,
          subjects: [],
        });
      }
      map.get(semNum).subjects.push(sub);
    }

    const sortedSemNums = Array.from(map.keys()).sort((a, b) => a - b);

    return sortedSemNums.map((semNum) => {
      const group = map.get(semNum);

      // Sort subjects within semester by SubjectOrder
      const sortedSubs = [...group.subjects].sort((a, b) => {
        const orderA = Number(a.SubjectOrder ?? a.SequenceId ?? 0);
        const orderB = Number(b.SubjectOrder ?? b.SequenceId ?? 0);
        if (orderA !== orderB) return orderA - orderB;
        const codeA = String(getValue(a, FIELD_ALIASES.code, /code/i));
        const codeB = String(getValue(b, FIELD_ALIASES.code, /code/i));
        return codeA.localeCompare(codeB);
      });

      // Match server semester summary
      const semSummary = serverSemesters.find((s) => getSemNumber(s) === semNum) || {};
      const credits = semSummary.Credits ?? semSummary.MaxCredits ?? sortedSubs.reduce((acc, s) => {
        const c = Number(getValue(s, FIELD_ALIASES.credits, /credit/i));
        return acc + (Number.isFinite(c) ? c : 0);
      }, 0);

      const gradePoints = semSummary.TotalGradePoints ?? semSummary.GradePoints ?? null;
      let sgpa = semSummary.SGPA ?? null;
      if (!sgpa && gradePoints && credits && Number(credits) > 0) {
        sgpa = (Number(gradePoints) / Number(credits)).toFixed(2);
      }

      const passedCount = sortedSubs.filter(isSubjectPassed).length;
      const failedCount = sortedSubs.length - passedCount;
      const allPassed = failedCount === 0;

      const hasMidMarks = sortedSubs.some((s) => {
        const m1 = getValue(s, FIELD_ALIASES.mid1, /mid.*1/i);
        const m2 = getValue(s, FIELD_ALIASES.mid2, /mid.*2/i);
        return m1 !== "" || m2 !== "";
      });

      const hasEndExamMarks = sortedSubs.some((s) => {
        const end = getValue(s, FIELD_ALIASES.endExam, /end/i);
        return end !== "";
      });

      return {
        semNum,
        semKey: group.semKey,
        semTitle: group.semTitle,
        subjects: sortedSubs,
        semSummary,
        credits: Number(credits) || 0,
        gradePoints: Number(gradePoints) || 0,
        sgpa,
        passedCount,
        failedCount,
        allPassed,
        hasMidMarks,
        hasEndExamMarks,
      };
    });
  }, [subjects, serverSemesters]);

  // Overall student statistics
  const overallStats = useMemo(() => {
    const totalSubjects = subjects.length;
    const passedCount = subjects.filter(isSubjectPassed).length;
    const backlogCount = totalSubjects - passedCount;

    let cgpa = summary.CGPA ?? summary.Cgpa ?? null;
    if (!cgpa && summary.CgpaTotalGained && summary.CgpaTotalCredits) {
      cgpa = (Number(summary.CgpaTotalGained) / Number(summary.CgpaTotalCredits)).toFixed(2);
    }

    const creditsGained = summary.CreditsGained ?? summary.TotalCreditsGained ?? null;
    const totalMaxCredits = summary.TotalMaxCredits ?? summary.MaxCredits ?? null;
    const gradePointsTotal = summary.CgpaTotalGained ?? summary.TotalGradePoints ?? null;

    return {
      totalSubjects,
      passedCount,
      backlogCount,
      allCleared: backlogCount === 0 && totalSubjects > 0,
      cgpa: cgpa ? Number(cgpa).toFixed(2) : null,
      creditsGained,
      totalMaxCredits,
      gradePointsTotal,
    };
  }, [subjects, summary]);

  // Filtered Semesters according to active tab, search, and status
  const visibleSemesterGroups = useMemo(() => {
    return semesterGroups
      .filter((group) => {
        if (activeSemTab === "all") return true;
        return String(group.semNum) === String(activeSemTab);
      })
      .map((group) => {
        const filteredSubs = group.subjects.filter((sub) => {
          const pass = isSubjectPassed(sub);
          if (statusFilter === "passed" && !pass) return false;
          if (statusFilter === "backlogs" && pass) return false;

          if (search.trim()) {
            const query = search.trim().toLowerCase();
            const code = String(getValue(sub, FIELD_ALIASES.code, /code/i)).toLowerCase();
            const name = String(getValue(sub, FIELD_ALIASES.subject, /name|subject/i)).toLowerCase();
            return code.includes(query) || name.includes(query);
          }

          return true;
        });

        return {
          ...group,
          subjects: filteredSubs,
        };
      })
      .filter((group) => group.subjects.length > 0 || search.trim() === "");
  }, [semesterGroups, activeSemTab, statusFilter, search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResult(null);
    setError("");
    setSearch("");
    setActiveSemTab("all");
    setStatusFilter("all");

    const enteredPin = pin.trim().toUpperCase();

    if (!enteredPin) {
      setError("Please enter your student PIN.");
      return;
    }

    if (!/^[A-Z0-9-]+$/.test(enteredPin)) {
      setError("PIN can contain only letters, numbers, and hyphens.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({ pin: enteredPin, scheme });
      const { ok, data: payload } = await safeFetchJson(
        `/api/consolidated-result?${params.toString()}`
      );

      if (!ok || !payload?.success) {
        throw new Error(
          payload?.message || "Unable to fetch your consolidated result from SBTET."
        );
      }

      setResult(payload);
    } catch (requestError) {
      setError(
        requestError.message || "Unable to fetch your consolidated result from SBTET."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!subjects.length) return;

    const headers = [
      "Semester",
      "S.No",
      "Subject Code",
      "Subject Name",
      "Mid 1",
      "Mid 2",
      "Internal",
      "End Exam",
      "Total Marks",
      "Credits",
      "Grade",
      "Status",
      "Exam Session",
    ];

    const rows = [];
    for (const group of semesterGroups) {
      group.subjects.forEach((sub, idx) => {
        rows.push([
          group.semTitle,
          idx + 1,
          getValue(sub, FIELD_ALIASES.code, /code/i),
          getValue(sub, FIELD_ALIASES.subject, /name|subject/i),
          getValue(sub, FIELD_ALIASES.mid1, /mid.*1/i),
          getValue(sub, FIELD_ALIASES.mid2, /mid.*2/i),
          getValue(sub, FIELD_ALIASES.internal, /internal/i),
          getValue(sub, FIELD_ALIASES.endExam, /end/i),
          getValue(sub, FIELD_ALIASES.marks, /mark|total/i),
          getValue(sub, FIELD_ALIASES.credits, /credit/i),
          getValue(sub, FIELD_ALIASES.grade, /grade/i),
          isSubjectPassed(sub) ? "PASSED" : "FAILED",
          getValue(sub, FIELD_ALIASES.monthYear, /month|year/i),
        ]);
      });
    }

    const escapeCell = (val) => `"${String(val ?? "").replaceAll('"', '""')}"`;
    const csvContent = [
      headers.map(escapeCell).join(","),
      ...rows.map((row) => row.map(escapeCell).join(",")),
    ].join("\r\n");

    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Consolidated_Result_${pin || "Student"}_${scheme}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="consolidated-page">
      <section className="site-hero consolidated-hero">
        <div className="consolidated-hero-inner">
          <Link className="consolidated-back-link" to="/student-portal">
            <ArrowLeft size={16} />
            Back to Student Portal
          </Link>
          <span className="consolidated-eyebrow">TELANGANA SBTET OFFICIAL SERVICE</span>
          <h1>Consolidated Result</h1>
          <p>Complete semester-by-semester academic transcript and credit record.</p>
        </div>
      </section>

      <section className="consolidated-content">
        <div className="consolidated-search-card">
          <div className="consolidated-card-heading">
            <span className="consolidated-heading-icon">
              <GraduationCap size={24} />
            </span>
            <div>
              <h2>View Consolidated Academic Record</h2>
              <p>Enter your State Board Diploma PIN and Scheme to fetch your full transcript.</p>
            </div>
          </div>

          <form className="consolidated-form" onSubmit={handleSubmit}>
            <div className="consolidated-field">
              <label htmlFor="consolidated-pin">Student PIN</label>
              <input
                autoComplete="off"
                id="consolidated-pin"
                onChange={(e) => setPin(e.target.value)}
                placeholder="Example: 21001-CS-001 or 24001-CS-074"
                spellCheck="false"
                value={pin}
              />
            </div>
            <div className="consolidated-field">
              <label htmlFor="consolidated-scheme">Curriculum Scheme</label>
              <select
                id="consolidated-scheme"
                onChange={(e) => setScheme(e.target.value)}
                value={scheme}
              >
                {SCHEMES.map((item) => (
                  <option key={item} value={item}>
                    {item} Scheme
                  </option>
                ))}
              </select>
            </div>
            <button className="consolidated-submit" disabled={loading} type="submit">
              {loading ? (
                <>
                  <span className="consolidated-spinner" /> Fetching Transcript...
                </>
              ) : (
                "View Consolidated Result"
              )}
            </button>
          </form>

          {error && (
            <div className="consolidated-error" role="alert">
              <AlertCircle size={18} className="consolidated-error-icon" />
              <div>
                <strong>Unable to retrieve consolidated result</strong>
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>

        {result && (
          <section aria-label="Official Transcript" className="consolidated-report">
            {/* Action Bar */}
            <div className="consolidated-report-heading">
              <div className="consolidated-report-title">
                <span className="consolidated-report-icon">
                  <Award size={22} />
                </span>
                <div>
                  <span className="consolidated-eyebrow">STATE BOARD OF TECHNICAL EDUCATION &amp; TRAINING</span>
                  <h2>Official Consolidated Transcript</h2>
                </div>
              </div>
              <div className="consolidated-report-actions">
                <button
                  className="consolidated-action"
                  onClick={downloadCsv}
                  title="Download complete transcript spreadsheet"
                  type="button"
                >
                  <Download size={15} />
                  Export CSV
                </button>
                <button
                  className="consolidated-action consolidated-action-primary"
                  onClick={() => window.print()}
                  title="Print official transcript document"
                  type="button"
                >
                  <Printer size={15} />
                  Print Transcript
                </button>
              </div>
            </div>

            {/* Print Letterhead (visible only when printing) */}
            <div className="consolidated-print-letterhead">
              <img src="/college-logo.jpg" alt="College Logo" className="print-logo" />
              <div className="print-header-text">
                <h2>GOVERNMENT POLYTECHNIC COLLEGE, MASAB TANK</h2>
                <p>Affiliated to State Board of Technical Education and Training, Telangana</p>
                <h3>CONSOLIDATED STATEMENT OF MARKS &amp; CREDITS</h3>
              </div>
            </div>

            {/* Student Profile Card */}
            <div className="consolidated-student-card">
              <div className="student-profile-header">
                <div className="student-avatar-box">
                  <GraduationCap size={28} />
                </div>
                <div className="student-title-wrap">
                  <span className="student-scheme-tag">{student.Scheme || scheme} Scheme</span>
                  <h3>{student.StudentName || student.Name || "Student Transcript"}</h3>
                  <p className="student-center-text">
                    {student.CenterName || "Govt. Polytechnic, Masab Tank"} {student.CenterCode ? `(${student.CenterCode})` : ""}
                  </p>
                </div>
              </div>

              <div className="student-meta-grid">
                <div className="student-meta-item">
                  <span className="meta-label">Student PIN</span>
                  <strong className="meta-value meta-pin">{student.Pin || pin}</strong>
                </div>
                <div className="student-meta-item">
                  <span className="meta-label">Branch</span>
                  <strong className="meta-value">{student.BranchCode || student.Branch || "CSE"}</strong>
                </div>
                <div className="student-meta-item">
                  <span className="meta-label">Total Semesters</span>
                  <strong className="meta-value">{semesterGroups.length} Completed</strong>
                </div>
                <div className="student-meta-item">
                  <span className="meta-label">Total Subjects</span>
                  <strong className="meta-value">{overallStats.totalSubjects} Subjects</strong>
                </div>
              </div>
            </div>

            {/* Overall Academic Performance Cards */}
            <div className="consolidated-kpi-grid">
              {overallStats.cgpa && (
                <div className="kpi-card kpi-card-gold">
                  <div className="kpi-top">
                    <span className="kpi-label">Cumulative GPA</span>
                    <Sparkles size={18} className="kpi-icon" />
                  </div>
                  <div className="kpi-value-row">
                    <span className="kpi-number">{overallStats.cgpa}</span>
                    <span className="kpi-scale">/ 10.0</span>
                  </div>
                  <span className="kpi-sub">Official SBTET CGPA</span>
                </div>
              )}

              {overallStats.creditsGained !== null && (
                <div className="kpi-card">
                  <div className="kpi-top">
                    <span className="kpi-label">Credits Earned</span>
                    <Award size={18} className="kpi-icon" />
                  </div>
                  <div className="kpi-value-row">
                    <span className="kpi-number">{overallStats.creditsGained}</span>
                    {overallStats.totalMaxCredits && (
                      <span className="kpi-scale">/ {overallStats.totalMaxCredits}</span>
                    )}
                  </div>
                  <span className="kpi-sub">Total Credits Completed</span>
                </div>
              )}

              {overallStats.gradePointsTotal !== null && (
                <div className="kpi-card">
                  <div className="kpi-top">
                    <span className="kpi-label">Total Grade Points</span>
                    <FileText size={18} className="kpi-icon" />
                  </div>
                  <div className="kpi-value-row">
                    <span className="kpi-number">{overallStats.gradePointsTotal}</span>
                  </div>
                  <span className="kpi-sub">Cumulative Weightage</span>
                </div>
              )}

              <div className={`kpi-card ${overallStats.allCleared ? "kpi-card-success" : "kpi-card-warning"}`}>
                <div className="kpi-top">
                  <span className="kpi-label">Transcript Status</span>
                  {overallStats.allCleared ? (
                    <CheckCircle2 size={18} className="kpi-icon text-green" />
                  ) : (
                    <AlertCircle size={18} className="kpi-icon text-amber" />
                  )}
                </div>
                <div className="kpi-value-row">
                  <span className="kpi-status-text">
                    {overallStats.allCleared ? "ALL CLEARED" : `${overallStats.backlogCount} BACKLOG${overallStats.backlogCount > 1 ? "S" : ""}`}
                  </span>
                </div>
                <span className="kpi-sub">
                  {overallStats.allCleared
                    ? `${overallStats.passedCount} of ${overallStats.totalSubjects} Subjects Passed`
                    : `${overallStats.passedCount} Passed, ${overallStats.backlogCount} Pending`}
                </span>
              </div>
            </div>

            {/* Semester Navigation Tabs */}
            <div className="consolidated-tab-bar">
              <div className="consolidated-tabs">
                <button
                  type="button"
                  className={`sem-tab ${activeSemTab === "all" ? "active" : ""}`}
                  onClick={() => setActiveSemTab("all")}
                >
                  <BookOpen size={14} />
                  <span>All Semesters</span>
                  <span className="tab-pill">{semesterGroups.length}</span>
                </button>
                {semesterGroups.map((group) => (
                  <button
                    key={group.semNum}
                    type="button"
                    className={`sem-tab ${String(activeSemTab) === String(group.semNum) ? "active" : ""}`}
                    onClick={() => setActiveSemTab(String(group.semNum))}
                  >
                    <span>Sem {group.semNum}</span>
                    <span className={`tab-dot ${group.allPassed ? "dot-pass" : "dot-fail"}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Toolbar for Search & Status Filter */}
            <div className="consolidated-toolbar">
              <div className="toolbar-info">
                <h4>
                  {activeSemTab === "all"
                    ? "Complete Semester-wise Breakdown"
                    : `Semester ${activeSemTab} Detailed Results`}
                </h4>
                <p>
                  Showing {visibleSemesterGroups.reduce((acc, g) => acc + g.subjects.length, 0)} subject records
                </p>
              </div>

              <div className="toolbar-controls">
                <div className="toolbar-status-filter">
                  <Filter size={14} className="toolbar-filter-icon" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by result status"
                  >
                    <option value="all">All Results</option>
                    <option value="passed">Passed Only</option>
                    <option value="backlogs">Backlogs Only</option>
                  </select>
                </div>

                <div className="toolbar-search">
                  <Search size={14} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search subject or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Semester Groups (Rendered Sequentially 1 -> 6) */}
            <div className="consolidated-semesters-list">
              {visibleSemesterGroups.map((group) => (
                <div key={group.semNum} className="semester-group-card">
                  {/* Semester Header */}
                  <div className="semester-group-header">
                    <div className="sem-header-left">
                      <div className="sem-badge-box">
                        <span className="sem-badge-roman">{group.semNum}</span>
                      </div>
                      <div>
                        <div className="sem-header-title-row">
                          <h3>{group.semTitle}</h3>
                          <span className="sem-key-tag">{group.semKey}</span>
                          <span className={`sem-result-pill ${group.allPassed ? "pill-pass" : "pill-fail"}`}>
                            {group.allPassed ? "PASSED" : `${group.failedCount} BACKLOG${group.failedCount > 1 ? "S" : ""}`}
                          </span>
                        </div>
                        <p className="sem-header-stats-text">
                          {group.subjects.length} Subjects &bull; {group.passedCount} Passed
                          {group.failedCount > 0 ? `, ${group.failedCount} Backlog` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="sem-header-right">
                      {group.sgpa && (
                        <div className="sem-mini-stat">
                          <span className="mini-stat-label">Semester SGPA</span>
                          <strong className="mini-stat-val text-gold">{group.sgpa}</strong>
                        </div>
                      )}
                      {group.credits > 0 && (
                        <div className="sem-mini-stat">
                          <span className="mini-stat-label">Credits</span>
                          <strong className="mini-stat-val">{group.credits}</strong>
                        </div>
                      )}
                      {group.gradePoints > 0 && (
                        <div className="sem-mini-stat">
                          <span className="mini-stat-label">Grade Points</span>
                          <strong className="mini-stat-val">{group.gradePoints}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subject Table for this Semester */}
                  <div className="consolidated-table-wrap">
                    <table className="consolidated-table">
                      <thead>
                        <tr>
                          <th className="col-sno">#</th>
                          <th className="col-code">Subject Code</th>
                          <th className="col-name">Subject Title</th>
                          {group.hasMidMarks && <th className="col-mid">Mid 1</th>}
                          {group.hasMidMarks && <th className="col-mid">Mid 2</th>}
                          {group.hasMidMarks && <th className="col-int">Internal</th>}
                          {group.hasEndExamMarks && <th className="col-end">End Sem</th>}
                          <th className="col-total">Total</th>
                          <th className="col-credits">Credits</th>
                          <th className="col-grade">Grade</th>
                          <th className="col-status">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.subjects.map((sub, idx) => {
                          const passed = isSubjectPassed(sub);
                          const grade = getValue(sub, FIELD_ALIASES.grade, /grade/i);
                          const code = getValue(sub, FIELD_ALIASES.code, /code/i);
                          const name = getValue(sub, FIELD_ALIASES.subject, /name|subject/i);
                          const mid1 = getValue(sub, FIELD_ALIASES.mid1, /mid.*1/i);
                          const mid2 = getValue(sub, FIELD_ALIASES.mid2, /mid.*2/i);
                          const internal = getValue(sub, FIELD_ALIASES.internal, /internal/i);
                          const endExam = getValue(sub, FIELD_ALIASES.endExam, /end/i);
                          const marks = getValue(sub, FIELD_ALIASES.marks, /mark|total/i);
                          const credits = getValue(sub, FIELD_ALIASES.credits, /credit/i);
                          const monthYear = getValue(sub, FIELD_ALIASES.monthYear, /month|year/i);

                          return (
                            <tr key={`${code}-${idx}`} className={passed ? "row-pass" : "row-fail"}>
                              <td className="col-sno text-muted">{idx + 1}</td>
                              <td className="col-code">
                                <span className="subject-code-badge">{formatValue(code)}</span>
                              </td>
                              <td className="col-name">
                                <span className="subject-name-text">{formatValue(name)}</span>
                                {monthYear && (
                                  <span className="subject-session-sub">
                                    <Calendar size={11} /> {monthYear}
                                  </span>
                                )}
                              </td>
                              {group.hasMidMarks && (
                                <td className="col-mid text-center">{formatValue(mid1)}</td>
                              )}
                              {group.hasMidMarks && (
                                <td className="col-mid text-center">{formatValue(mid2)}</td>
                              )}
                              {group.hasMidMarks && (
                                <td className="col-int text-center">{formatValue(internal)}</td>
                              )}
                              {group.hasEndExamMarks && (
                                <td className="col-end text-center">{formatValue(endExam)}</td>
                              )}
                              <td className="col-total text-center font-bold">
                                {formatValue(marks)}
                              </td>
                              <td className="col-credits text-center">
                                <span className="credit-pill">{formatValue(credits)}</span>
                              </td>
                              <td className="col-grade text-center">
                                <span className={getGradeBadgeClass(grade)}>
                                  {formatValue(grade)}
                                </span>
                              </td>
                              <td className="col-status text-center">
                                <span className={`status-pill ${passed ? "status-pass" : "status-fail"}`}>
                                  {passed ? (
                                    <>
                                      <CheckCircle2 size={12} /> Passed
                                    </>
                                  ) : (
                                    <>
                                      <XCircle size={12} /> Failed
                                    </>
                                  )}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {visibleSemesterGroups.length === 0 && (
                <div className="consolidated-empty-state">
                  <AlertCircle size={36} />
                  <h3>No subjects match your filter</h3>
                  <p>Try searching with another keyword or resetting the filters.</p>
                  <button
                    type="button"
                    className="consolidated-action"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                      setActiveSemTab("all");
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* Print Signatures Block */}
            <div className="consolidated-print-footer">
              <div className="signature-box">
                <span className="signature-line" />
                <p>Checked By</p>
              </div>
              <div className="signature-box">
                <span className="signature-line" />
                <p>Head of Department</p>
              </div>
              <div className="signature-box">
                <span className="signature-line" />
                <p>Principal / Controller of Examinations</p>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export default ConsolidatedResult;
