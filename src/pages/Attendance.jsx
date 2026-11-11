import { useMemo, useState } from "react";
import "./Attendance.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
const API_URL = API_BASE_URL
  ? `${API_BASE_URL}/api/attendance`
  : null;

function Attendance() {
  const [pin, setPin] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // =========================================================
  // FETCH ATTENDANCE FROM BACKEND
  // =========================================================

  const fetchAttendance = async () => {
    const enteredPin = pin.trim();

    if (!enteredPin) {
      setError("Please enter your Student PIN.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!API_URL) {
        throw new Error(
          "VITE_API_BASE_URL is missing from this frontend build. Configure it in the frontend deployment settings and redeploy."
        );
      }

      const response = await fetch(
        `${API_URL}?pin=${encodeURIComponent(enteredPin)}`
      );

      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          `Attendance API returned a non-JSON response (HTTP ${response.status}). Check VITE_API_BASE_URL in the frontend deployment settings and redeploy.`
        );
      }

      if (!response.ok || !result?.success || !result?.data) {
        throw new Error(
          result?.message ||
            "We couldn't retrieve attendance from SBTET right now."
        );
      }

      setAttendance(result.data);
      setCurrentMonthIndex(0);
    } catch (err) {
      console.error("Attendance error:", err);

      setAttendance(null);
      setError(
        err.message ||
          "We couldn't retrieve attendance from SBTET right now."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORM SUBMIT
  // =========================================================

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAttendance();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchAttendance();
    }
  };

  // =========================================================
  // RESET
  // =========================================================

  const resetAttendance = () => {
    setAttendance(null);
    setError("");
    setPin("");
    setCurrentMonthIndex(0);
  };

  // =========================================================
  // DAILY ATTENDANCE
  //
  // IMPORTANT:
  // SBTET daily data uses "Date"
  // =========================================================

  const dailyAttendance = attendance?.dailyAttendance || [];

  // =========================================================
  // GET AVAILABLE MONTHS FROM REAL API DATA
  // =========================================================

  const months = useMemo(() => {
    const monthMap = new Map();

    dailyAttendance.forEach((item) => {
      if (!item?.Date) return;

      const date = new Date(item.Date);

      if (Number.isNaN(date.getTime())) return;

      const year = date.getFullYear();
      const month = date.getMonth();

      const key = `${year}-${String(month + 1).padStart(2, "0")}`;

      if (!monthMap.has(key)) {
        monthMap.set(key, {
          key,
          year,
          month,
          date,
        });
      }
    });

    return Array.from(monthMap.values()).sort(
      (a, b) => a.date - b.date
    );
  }, [dailyAttendance]);

  const selectedMonth = months[currentMonthIndex];

  // =========================================================
  // ATTENDANCE FOR CURRENT MONTH
  // =========================================================

  const monthAttendance = useMemo(() => {
    if (!selectedMonth) return [];

    return dailyAttendance.filter((item) => {
      if (!item?.Date) return false;

      const date = new Date(item.Date);

      return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === selectedMonth.year &&
        date.getMonth() === selectedMonth.month
      );
    });
  }, [dailyAttendance, selectedMonth]);

  // =========================================================
  // DATE -> ATTENDANCE MAP
  // =========================================================

  const attendanceMap = useMemo(() => {
    const map = new Map();

    monthAttendance.forEach((item) => {
      if (!item?.Date) return;

      const date = new Date(item.Date);

      if (!Number.isNaN(date.getTime())) {
        map.set(date.getDate(), item);
      }
    });

    return map;
  }, [monthAttendance]);

  // =========================================================
  // CREATE CALENDAR CELLS
  // MONDAY FIRST
  // =========================================================

  const calendarCells = useMemo(() => {
    if (!selectedMonth) return [];

    const firstDay = new Date(
      selectedMonth.year,
      selectedMonth.month,
      1
    );

    const daysInMonth = new Date(
      selectedMonth.year,
      selectedMonth.month + 1,
      0
    ).getDate();

    let firstDayIndex = firstDay.getDay();

    // Sunday = 0
    // Monday = 1
    //
    // Convert:
    // Monday = 0
    // Sunday = 6

    firstDayIndex =
      firstDayIndex === 0
        ? 6
        : firstDayIndex - 1;

    const cells = [];

    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(day);
    }

    return cells;
  }, [selectedMonth]);

  // =========================================================
  // STATUS INFORMATION
  // =========================================================

  const getStatusInfo = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "P":
        return {
          key: "present",
          label: "Present",
          short: "P",
          icon: "✓",
        };

      case "A":
        return {
          key: "absent",
          label: "Absent",
          short: "A",
          icon: "×",
        };

      case "H":
        return {
          key: "holiday",
          label: "Holiday",
          short: "H",
          icon: "H",
        };

      case "W":
        return {
          key: "weekoff",
          label: "Week Off",
          short: "W",
          icon: "W",
        };

      case "E":
        return {
          key: "errors",
          label: "Errors",
          short: "E",
          icon: "!",
        };

      case "-":
        return {
          key: "future",
          label: "Upcoming",
          short: "",
          icon: "○",
        };

      default:
        return {
          key: "nodata",
          label: "No Data",
          short: "",
          icon: "•",
        };
    }
  };

  // =========================================================
  // DATE INFORMATION
  // =========================================================

  const getDateInfo = (day) => {
    if (!selectedMonth || !day) return null;

    const date = new Date(
      selectedMonth.year,
      selectedMonth.month,
      day
    );

    const item = attendanceMap.get(day);

    const dayName = date
      .toLocaleDateString("en-US", {
        weekday: "short",
      })
      .toUpperCase();

    const monthName = date
      .toLocaleDateString("en-US", {
        month: "short",
      })
      .toUpperCase();

    let statusInfo;

    if (item) {
      statusInfo = getStatusInfo(item.Status);
    } else {
      const today = new Date();

      if (date > today) {
        statusInfo = getStatusInfo("-");
      } else {
        statusInfo = getStatusInfo("");
      }
    }

    return {
      dayName,
      monthName,
      statusInfo,
    };
  };

  // =========================================================
  // ACTUAL ATTENDANCE VALUES
  // =========================================================

  const absentDays = useMemo(() => {
    return dailyAttendance.filter(
      (item) =>
        String(item?.Status || "").toUpperCase() === "A"
    ).length;
  }, [dailyAttendance]);

  const presentDays = Number(
    attendance?.presentDays ??
      dailyAttendance.filter(
        (item) =>
          String(item?.Status || "").toUpperCase() === "P"
      ).length
  );

  const workingDays = Number(
    attendance?.workingDays ?? 0
  );

  const percentage = Number(
    attendance?.percentage ??
      attendance?.totalPercentage ??
      0
  );

  // =========================================================
  // EXAM CONSIDERED ATTENDANCE
  //
  // SBTET provides these separately.
  // =========================================================

  const examPercentage = Number(
    attendance?.examsPer ??
      attendance?.examPercentage ??
      attendance?.totalPercentage ??
      0
  );

  const examPresentDays = Number(
    attendance?.examsNDP ??
      attendance?.presentDays ??
      0
  );

  const examWorkingDays = Number(
    attendance?.examsWorkingDays ??
      attendance?.totalWorkingDays ??
      0
  );

  // =========================================================
  // FORMAT PERCENTAGE
  // =========================================================

  const formatPercentage = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return "0.00%";
    }

    return `${number.toFixed(2)}%`;
  };

  // =========================================================
  // FORMAT UPDATED DATE
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // ENTRY SCREEN
  // =========================================================

  if (!attendance && !loading) {
    return (
      <main className="attendance-page">

        <div className="attendance-entry-wrapper">

          <section className="attendance-entry-card">

            <div className="attendance-entry-icon">
              <span>✓</span>
            </div>

            <div className="attendance-entry-heading">

              <h1>
                Student Attendance
              </h1>

              <p>
                View your latest attendance from SBTET
              </p>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="attendance-form-group">

                <label htmlFor="student-pin">
                  Student PIN
                </label>

                <input
                  id="student-pin"
                  type="text"
                  value={pin}
                  onChange={(e) =>
                    setPin(
                      e.target.value.toUpperCase()
                    )
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your PIN"
                  autoComplete="off"
                  spellCheck="false"
                />

              </div>

              {error && (
                <div className="attendance-form-error">

                  <span>!</span>

                  <p>
                    {error}
                  </p>

                </div>
              )}

              <button
                type="submit"
                className="attendance-view-button"
                disabled={loading}
              >
                <span>
                  View Attendance
                </span>

                <span className="button-arrow">
                  →
                </span>
              </button>

            </form>

            <div className="attendance-entry-note">

              <span>🔒</span>

              <p>
                Attendance is retrieved directly from SBTET.
              </p>

            </div>

          </section>

        </div>

      </main>
    );
  }

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <main className="attendance-page">

        <div className="attendance-loading-wrapper">

          <section className="attendance-loading-card">

            <div className="attendance-spinner"></div>

            <h2>
              Loading attendance...
            </h2>

            <p>
              Retrieving your latest attendance from SBTET
            </p>

          </section>

        </div>

      </main>
    );
  }

  // =========================================================
  // MAIN DASHBOARD
  // =========================================================

  return (
    <main className="attendance-page">

      <div className="attendance-container">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="attendance-dashboard-header">

          <div>

            <div className="attendance-breadcrumb">
              Student Portal
              <span>›</span>
              Attendance
            </div>

            <h1>
              Student Attendance
            </h1>

            <p>
              View your daily attendance and monthly summary
            </p>

          </div>

          <button
            type="button"
            className="another-pin-button"
            onClick={resetAttendance}
          >
            <span>↻</span>
            Check Another PIN
          </button>

        </header>

        {/* ===================================================
            STUDENT INFORMATION
        =================================================== */}

        <section className="student-info-card">

          <div className="student-info-main">

            <div className="student-avatar">
              {attendance?.name
                ? attendance.name
                    .charAt(0)
                    .toUpperCase()
                : "S"}
            </div>

            <div>

              <span className="student-info-label">
                STUDENT
              </span>

              <h2>
                {attendance?.name || "Student"}
              </h2>

              <p>
                PIN:{" "}
                <strong>
                  {attendance?.pin || "—"}
                </strong>
              </p>

            </div>

          </div>

          <div className="student-info-details">

            <div>
              <span>
                Branch
              </span>

              <strong>
                {attendance?.branchCode || "—"}
              </strong>
            </div>

            <div>
              <span>
                Semester
              </span>

              <strong>
                {attendance?.semester || "—"}
              </strong>
            </div>

            <div>
              <span>
                Scheme
              </span>

              <strong>
                {attendance?.scheme || "—"}
              </strong>
            </div>

          </div>

        </section>

        {/* ===================================================
            SUMMARY CARDS
        =================================================== */}

        <section className="attendance-summary-grid">

          {/* ACTUAL ATTENDANCE */}

          <div className="summary-card percentage-card">

            <div className="summary-icon">
              %
            </div>

            <div>

              <span>
                Attendance
              </span>

              <strong>
                {formatPercentage(percentage)}
              </strong>

            </div>

          </div>

          {/* PRESENT DAYS */}

          <div className="summary-card present-card">

            <div className="summary-icon">
              ✓
            </div>

            <div>

              <span>
                Present Days
              </span>

              <strong>
                {presentDays}
              </strong>

            </div>

          </div>

          {/* ABSENT DAYS */}

          <div className="summary-card absent-card">

            <div className="summary-icon">
              ×
            </div>

            <div>

              <span>
                Absent Days
              </span>

              <strong>
                {absentDays}
              </strong>

            </div>

          </div>

          {/* WORKING DAYS */}

          <div className="summary-card working-card">

            <div className="summary-icon">
              ▣
            </div>

            <div>

              <span>
                Working Days
              </span>

              <strong>
                {workingDays}
              </strong>

            </div>

          </div>

          {/* EXAM CONSIDERED */}

          <div className="summary-card exam-considered-card">

            <div className="summary-icon">
              %
            </div>

            <div>

              <span>
                Exam Considered
              </span>

              <strong>
                {formatPercentage(examPercentage)}
              </strong>

              <small>
                {examPresentDays}/{examWorkingDays} days
              </small>

            </div>

          </div>

        </section>

        {/* ===================================================
            CALENDAR SECTION
        =================================================== */}

        <section className="attendance-calendar-section">

          <div className="calendar-section-header">

            <div>

              <h2>
                Monthly Attendance Calendar
              </h2>

              <p>
                View your daily attendance status month by month
              </p>

            </div>

            <button
              type="button"
              className="chart-button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent(
                    "attendance-chart-toggle"
                  )
                )
              }
            >
              <span>
                ▥
              </span>

              View Attendance Chart

            </button>

          </div>

          {/* =================================================
              MONTH NAVIGATION
          ================================================= */}

          {months.length > 0 && (

            <div className="month-navigation">

              <button
                type="button"
                disabled={
                  currentMonthIndex === 0
                }
                onClick={() =>
                  setCurrentMonthIndex(
                    (index) => index - 1
                  )
                }
              >
                ‹
              </button>

              <div className="month-navigation-title">

                <span>
                  {selectedMonth?.date.toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </span>

              </div>

              <button
                type="button"
                disabled={
                  currentMonthIndex ===
                  months.length - 1
                }
                onClick={() =>
                  setCurrentMonthIndex(
                    (index) => index + 1
                  )
                }
              >
                ›
              </button>

            </div>

          )}

          {/* =================================================
              NO DATA
          ================================================= */}

          {months.length === 0 ? (

            <div className="no-attendance-data">

              <div>
                📅
              </div>

              <h3>
                No attendance data available
              </h3>

              <p>
                No daily attendance information was received
                from SBTET.
              </p>

            </div>

          ) : (

            <div className="calendar-card">

              {/* WEEK DAYS */}

              <div className="calendar-week-header">

                {[
                  "MON",
                  "TUE",
                  "WED",
                  "THU",
                  "FRI",
                  "SAT",
                  "SUN",
                ].map((day) => (
                  <div key={day}>
                    {day}
                  </div>
                ))}

              </div>

              {/* CALENDAR */}

              <div className="attendance-calendar-grid">

                {calendarCells.map(
                  (day, index) => {

                    if (!day) {
                      return (
                        <div
                          className="calendar-empty-cell"
                          key={`empty-${index}`}
                        />
                      );
                    }

                    const info =
                      getDateInfo(day);

                    return (
                      <div
                        key={day}
                        className={`attendance-day-card ${info.statusInfo.key}`}
                      >

                        {/* DATE */}

                        <div className="day-card-date">

                          <span className="day-name">
                            {info.dayName}
                          </span>

                          <span className="date-number">
                            {String(day).padStart(
                              2,
                              "0"
                            )}{" "}
                            {info.monthName}
                          </span>

                        </div>

                        {/* STATUS */}

                        <div className="day-card-status">

                          <div className="status-symbol">
                            {info.statusInfo.icon}
                          </div>

                          <span className="status-label">
                            {info.statusInfo.label}
                          </span>

                          {info.statusInfo.short && (
                            <span className="status-code">
                              {info.statusInfo.short}
                            </span>
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          )}

          {/* =================================================
              LEGEND
          ================================================= */}

          <div className="attendance-legend">

            <span className="legend-title">
              Attendance Status
            </span>

            <span className="legend-item">

              <i className="legend-dot present-dot">
                ✓
              </i>

              Present

            </span>

            <span className="legend-item">

              <i className="legend-dot absent-dot">
                ×
              </i>

              Absent

            </span>

            <span className="legend-item">

              <i className="legend-dot holiday-dot">
                H
              </i>

              Holiday

            </span>

            <span className="legend-item">

              <i className="legend-dot weekoff-dot">
                W
              </i>

              Week Off

            </span>

            <span className="legend-item">

              <i className="legend-dot errors-dot">
                E
              </i>

              Errors

            </span>

          </div>

        </section>

        {/* ===================================================
            LAST UPDATED
        =================================================== */}

        <div className="attendance-updated">

          Last updated:{" "}

          <strong>
            {formatDate(
              attendance?.updatedDate
            )}
          </strong>

        </div>

      </div>

    </main>
  );
}

export default Attendance;