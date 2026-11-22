import { Printer } from "lucide-react";
import "./SemesterResult.css";

function SemesterResult({ result }) {
  const data = result?.data || {};

  const student = data?.student || {};

  const subjects = Array.isArray(
    data?.subjects
  )
    ? data.subjects
    : [];

  const summary = data?.summary || {};

  const totalMarksFromSubjects =
    subjects.reduce(
      (total, subject) => {
        const value = Number(
          subject?.SubjectTotal
        );

        return total +
          (Number.isFinite(value)
            ? value
            : 0);
      },
      0
    );

  const totalMarks =
    summary?.totalMarks ??
    totalMarksFromSubjects;

  const totalCredits =
    summary?.totalCredits ??
    data?.studentSubjectTotal?.[0]
      ?.TotalCredits ??
    "-";

  const creditsEarned =
    summary?.totalCreditsEarned ??
    data?.studentSubjectTotal?.[0]
      ?.TotalCreditsEarned ??
    "-";

  const resultStatus =
    summary?.result ??
    data?.studentSubjectTotal?.[0]
      ?.Result ??
    "-";

  const sgpa =
    summary?.sgpa ??
    data?.studentSGPACGPAInfo?.[0]
      ?.SGPA ??
    "-";

  const cgpa =
    summary?.cgpa ??
    data?.studentSGPACGPAInfo?.[0]
      ?.CGPA ??
    "-";

  const academicYear =
    summary?.academicYear ??
    data?.studentSubjectTotal?.[0]
      ?.AcadamicYear ??
    "-";

  return (
    <div className="semester-result-card">

      {/* HEADER */}
      <div className="semester-result-header">

        <div>
          <span className="semester-result-label">
            SBTET RESULT
          </span>

          <h2>
            Semester Result
          </h2>

          <p>
            {student?.semester ||
              "Semester"}
          </p>
        </div>

        <div className="semester-result-actions">
          <button
            type="button"
            className="semester-print-btn"
            onClick={() => window.print()}
            title="Print or Save Semester Memo"
          >
            <Printer size={15} />
            <span>Print Memo</span>
          </button>
          <div
            className={`semester-status ${
              String(resultStatus)
                .toLowerCase() === "pass"
                ? "pass"
                : ""
            }`}
          >
            {resultStatus}
          </div>
        </div>

      </div>

      {/* STUDENT INFORMATION */}
      <div className="semester-student-details">

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
      <div className="semester-table-wrapper">

        <table className="semester-result-table">

          <thead>

            <tr>
              <th>S.No</th>
              <th>Code</th>
              <th>Subject</th>
              <th>Internal</th>
              <th>End Sem</th>
              <th>Total</th>
              <th>Grade</th>
              <th>Result</th>
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

                    <td className="semester-subject-name">
                      {subject?.SubjectName ||
                        "-"}
                    </td>

                    <td>
                      {subject?.Internal_MARKS ??
                        "-"}
                    </td>

                    <td>
                      {subject?.EndSemMarks ??
                        "-"}
                    </td>

                    <td className="semester-total">
                      {subject?.SubjectTotal ??
                        "-"}
                    </td>

                    <td>
                      {subject?.HybridGrade ||
                        "-"}
                    </td>

                    <td>
                      {subject?.Result ||
                        "-"}
                    </td>

                  </tr>
                )
              )
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="semester-empty"
                >
                  No semester records found.
                </td>
              </tr>
            )}

          </tbody>

          <tfoot>

            <tr>

              <td
                colSpan="5"
                className="semester-total-label"
              >
                Total Marks
              </td>

              <td
                className="semester-grand-total"
              >
                {totalMarks}
              </td>

              <td colSpan="2"></td>

            </tr>

          </tfoot>

        </table>

      </div>

      {/* SUMMARY */}
      <div className="semester-summary">

        <div className="semester-summary-title">
          Result Summary
        </div>

        <div className="semester-summary-grid">

          <div className="semester-summary-item">
            <span>
              Total Subjects
            </span>

            <strong>
              {subjects.length}
            </strong>
          </div>

          <div className="semester-summary-item">
            <span>
              Total Marks
            </span>

            <strong>
              {totalMarks}
            </strong>
          </div>

          <div className="semester-summary-item">
            <span>
              Total Credits
            </span>

            <strong>
              {totalCredits}
            </strong>
          </div>

          <div className="semester-summary-item">
            <span>
              Credits Earned
            </span>

            <strong>
              {creditsEarned}
            </strong>
          </div>

          <div className="semester-summary-item">
            <span>
              Result
            </span>

            <strong>
              {resultStatus}
            </strong>
          </div>

          <div className="semester-summary-item">
            <span>
              SGPA
            </span>

            <strong>
              {sgpa}
            </strong>
          </div>

          <div className="semester-summary-item">
            <span>
              CGPA
            </span>

            <strong>
              {cgpa}
            </strong>
          </div>

          <div className="semester-summary-item">
            <span>
              Academic Year
            </span>

            <strong>
              {academicYear}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default SemesterResult;