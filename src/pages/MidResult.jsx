import { Printer } from "lucide-react";
import "./MidResult.css";

function MidResult({ result, examType }) {
  const data = result?.data || {};
  const student = data?.student || {};
  const subjects = Array.isArray(data?.subjects)
    ? data.subjects
    : [];

  const isMid1 = examType === "Mid-1";

  const getMarks = (subject) => {
    const value = isMid1
      ? subject?.MID1_MARKS
      : subject?.MID2_MARKS;

    return value === null ||
      value === undefined ||
      value === ""
      ? "-"
      : value;
  };

  const totalMarks = subjects.reduce(
    (total, subject) => {
      const value = Number(
        isMid1
          ? subject?.MID1_MARKS
          : subject?.MID2_MARKS
      );

      return total +
        (Number.isFinite(value)
          ? value
          : 0);
    },
    0
  );

  return (
    <div className="mid-result-card">

      {/* HEADER */}
      <div className="mid-result-header">

        <div>
          <span className="mid-result-label">
            SBTET RESULT
          </span>

          <h2>
            {examType} Result
          </h2>

          <p>
            {student?.semester ||
              "Semester"}
          </p>
        </div>

        <div className="mid-result-actions">
          <button
            type="button"
            className="mid-print-btn"
            onClick={() => window.print()}
            title="Print or Save Marksheet"
          >
            <Printer size={15} />
            <span>Print Marksheet</span>
          </button>
          <div className="mid-result-badge">
            {examType}
          </div>
        </div>

      </div>

      {/* STUDENT DETAILS */}
      <div className="mid-student-details">

        <div>
          <span>Student Name</span>

          <strong>
            {student?.name || "-"}
          </strong>
        </div>

        <div>
          <span>PIN</span>

          <strong>
            {student?.pin || "-"}
          </strong>
        </div>

        <div>
          <span>Branch</span>

          <strong>
            {student?.branchName ||
              student?.branchCode ||
              "-"}
          </strong>
        </div>

        <div>
          <span>Semester</span>

          <strong>
            {student?.semester || "-"}
          </strong>
        </div>

      </div>

      {/* SUBJECT TABLE */}
      <div className="mid-table-wrapper">

        <table className="mid-result-table">

          <thead>
            <tr>
              <th>S.No</th>
              <th>Code</th>
              <th>Subject</th>
              <th>Marks</th>
            </tr>
          </thead>

          <tbody>

            {subjects.length > 0 ? (
              subjects.map(
                (subject, index) => (
                  <tr
                    key={
                      subject?.Subject_Code ||
                      index
                    }
                  >

                    <td>
                      {index + 1}
                    </td>

                    <td>
                      {subject?.Subject_Code ||
                        "-"}
                    </td>

                    <td className="mid-subject-name">
                      {subject?.SubjectName ||
                        "-"}
                    </td>

                    <td className="mid-marks">
                      {getMarks(subject)}
                    </td>

                  </tr>
                )
              )
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="mid-empty"
                >
                  No subject records found.
                </td>
              </tr>
            )}

          </tbody>

          <tfoot>
            <tr>
              <td
                colSpan="3"
                className="mid-total-label"
              >
                Total Marks
              </td>

              <td className="mid-total-value">
                {totalMarks}
              </td>
            </tr>
          </tfoot>

        </table>

      </div>

      {/* SUMMARY */}
      <div className="mid-summary">

        <div className="mid-summary-title">
          Result Summary
        </div>

        <div className="mid-summary-grid">

          <div className="mid-summary-item">
            <span>Total Subjects</span>

            <strong>
              {subjects.length}
            </strong>
          </div>

          <div className="mid-summary-item">
            <span>Total Marks</span>

            <strong>
              {totalMarks}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default MidResult;