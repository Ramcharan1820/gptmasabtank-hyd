import https from "https";

export const config = {
  runtime: "nodejs",
};

const SBTET_MID_RESULT_URL =
  "https://www.sbtet.telangana.gov.in/api/api/Results/GetC18MidStudentWiseReport";
const SBTET_SEM_RESULT_URL =
  "https://www.sbtet.telangana.gov.in/api/api/Results/GetStudentWiseReport";

const DEFAULT_EXAM_MONTH_YEAR_IDS = [
  "103","102","101","100","99","98","97","96","95","94","93","92","91","90","89","88","87","86","85","84","82","80","79","78","77","76","75","74","73","72","71","70","69","68","67","66","65","64","63","62","61","60","59","58","57","56","55","53","52","51","50","49","48","45","44","43","41","5","4","6","3","2","1"
];

function sbtetHeaders() {
  return {
    Accept: "application/json, text/plain, */*",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Referer: "https://www.sbtet.telangana.gov.in/",
    Origin: "https://www.sbtet.telangana.gov.in",
  };
}

function parseSBTETResponse(data) {
  let parsed = data;
  for (let i = 0; i < 3 && typeof parsed === "string"; i++) {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      break;
    }
  }
  return parsed;
}

function fetchSBTET(url) {
  return new Promise((resolve, reject) => {
    try {
      const req = https.get(
        url,
        {
          family: 4,
          rejectUnauthorized: false,
          timeout: 15000,
          headers: sbtetHeaders(),
        },
        (res) => {
          let rawData = "";
          res.setEncoding("utf8");
          res.on("data", (chunk) => {
            rawData += chunk;
          });
          res.on("end", () => {
            let data;
            try {
              data = JSON.parse(rawData);
            } catch {
              data = rawData;
            }
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              data,
            });
          });
        }
      );

      req.on("error", (err) => reject(err));
      req.on("timeout", () => {
        req.destroy(new Error(`SBTET request timed out for ${url}`));
      });
    } catch (err) {
      reject(err);
    }
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  try {
    const { pin, scheme, semester, examType } = req.query;

    if (
      typeof pin !== "string" ||
      typeof scheme !== "string" ||
      typeof semester !== "string" ||
      typeof examType !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "PIN, Scheme, Semester and Exam Type are required.",
      });
    }

    const cleanPin = pin.trim().toUpperCase();
    const cleanScheme = scheme.trim().toUpperCase();
    const cleanSemester = semester.trim().toUpperCase();
    const cleanExamType = examType.trim();

    if (!/^[A-Z0-9-]+$/.test(cleanPin)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PIN format.",
      });
    }

    const schemeMap = {
      C24: process.env.SBTET_C24_SCHEME_ID || "11",
      C26: process.env.SBTET_C26_SCHEME_ID || "12",
      ER2020: process.env.SBTET_ER2020_SCHEME_ID,
      C21: process.env.SBTET_C21_SCHEME_ID,
      C09: process.env.SBTET_C09_SCHEME_ID,
      C08: process.env.SBTET_C08_SCHEME_ID,
      C05: process.env.SBTET_C05_SCHEME_ID,
      C18: process.env.SBTET_C18_SCHEME_ID || "8",
      C16S: process.env.SBTET_C16S_SCHEME_ID,
      C16: process.env.SBTET_C16_SCHEME_ID || "6",
      ER91: process.env.SBTET_ER91_SCHEME_ID,
      C14: process.env.SBTET_C14_SCHEME_ID,
    };

    const schemeId = schemeMap[cleanScheme];

    if (!schemeId) {
      return res.status(400).json({
        success: false,
        message: `Scheme ID for ${cleanScheme} is not configured.`,
      });
    }

    const semesterMatch = cleanSemester.match(/^([1-6])SEM$/);

    if (!semesterMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid semester.",
      });
    }

    const semYearId = Number(semesterMatch[1]);

    if (["Mid-1", "Mid-2"].includes(cleanExamType)) {
      const examTypeId = cleanExamType === "Mid-1" ? 1 : 2;

      const url =
        `${SBTET_MID_RESULT_URL}` +
        `?ExamTypeId=${examTypeId}` +
        `&Pin=${encodeURIComponent(cleanPin)}` +
        `&SchemeId=${schemeId}` +
        `&SemYearId=${semYearId}`;

      const result = await fetchSBTET(url);

      if (!result.ok) {
        return res.status(result.status || 500).json({
          success: false,
          message: "SBTET mid result request failed.",
        });
      }

      const reports = parseSBTETResponse(result.data);
      const reportList = Array.isArray(reports) ? reports : [reports];
      const report = reportList.find(
        (item) =>
          item &&
          typeof item === "object" &&
          (Array.isArray(item.studentWiseReport) ||
            Array.isArray(item.studentInfo))
      );
      const subjects = Array.isArray(report?.studentWiseReport)
        ? report.studentWiseReport
        : [];
      const student = Array.isArray(report?.studentInfo)
        ? report.studentInfo[0]
        : null;

      if (!student && subjects.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No mid result was found for the selected details.",
        });
      }

      return res.json({
        success: true,
        source: "SBTET",
        data: {
          student: {
            pin: student?.Pin || cleanPin,
            name: student?.StudentName || student?.Name || null,
            branchName: student?.BranchName || student?.Branch || null,
            branchCode: student?.BranchCode || null,
            semester: student?.Sem || student?.Semester || cleanSemester,
            collegeCode: student?.CollegeCode || null,
            collegeName: student?.CollegeName || null,
            examination: student?.ExamType || cleanExamType,
            examMonthYear: student?.ExamMonthYear || null,
          },
          subjects,
        },
      });
    }

    if (cleanExamType === "Semester") {
      const examMonthYearIds = process.env.SBTET_EXAM_MONTH_YEAR_IDS
        ? String(process.env.SBTET_EXAM_MONTH_YEAR_IDS)
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : DEFAULT_EXAM_MONTH_YEAR_IDS;

      let foundReport = null;
      let lastStatus = null;

      for (const examMonthYearId of examMonthYearIds) {
        const url =
          `${SBTET_SEM_RESULT_URL}` +
          `?ExamMonthYearId=${encodeURIComponent(examMonthYearId)}` +
          `&ExamTypeId=5` +
          `&Pin=${encodeURIComponent(cleanPin)}` +
          `&SchemeId=${encodeURIComponent(schemeId)}` +
          `&SemYearId=${semYearId}` +
          `&StudentTypeId=${Number(process.env.SBTET_STUDENT_TYPE_ID) || 1}`;

        const result = await fetchSBTET(url);
        lastStatus = result.status;

        if (!result.ok) {
          continue;
        }

        const reports = parseSBTETResponse(result.data);
        const reportList = Array.isArray(reports) ? reports : [reports];
        foundReport = reportList.find((item) => {
          if (!item || typeof item !== "object") {
            return false;
          }

          const subjects = Array.isArray(item.studentWiseReport)
            ? item.studentWiseReport
            : [];
          const studentInfo = Array.isArray(item.studentInfo)
            ? item.studentInfo[0]
            : null;
          const returnedSemester = String(
            studentInfo?.Sem || studentInfo?.Semester || ""
          )
            .trim()
            .toUpperCase();

          return (
            subjects.length > 0 &&
            (!returnedSemester || returnedSemester === cleanSemester)
          );
        });

        if (foundReport) {
          break;
        }
      }

      if (!foundReport) {
        return res.status(lastStatus && lastStatus >= 500 ? lastStatus : 404).json({
          success: false,
          message: `No ${cleanSemester} semester result was found for the selected details.`,
        });
      }

      const student = Array.isArray(foundReport.studentInfo)
        ? foundReport.studentInfo[0]
        : null;
      const subjects = foundReport.studentWiseReport;
      const subjectTotals = Array.isArray(foundReport.studentSubjectTotal)
        ? foundReport.studentSubjectTotal
        : [];
      const gradeSummary = Array.isArray(foundReport.studentSGPACGPAInfo)
        ? foundReport.studentSGPACGPAInfo
        : [];
      const totalMarks = subjects.reduce((total, subject) => {
        const marks = Number(subject?.SubjectTotal);
        return Number.isFinite(marks) ? total + marks : total;
      }, 0);
      const totalMaxMarks = subjects.reduce((total, subject) => {
        const maxMarks = Number(subject?.MaxMarks);
        return Number.isFinite(maxMarks) ? total + maxMarks : total;
      }, 0);
      const hasFailedSubject = subjects.some((subject) => {
        const resultText = String(
          subject?.Result || subject?.SubjectResult || ""
        )
          .trim()
          .toUpperCase();
        return resultText.includes("FAIL") || resultText === "F";
      });

      return res.json({
        success: true,
        source: "SBTET",
        data: {
          student: {
            pin: student?.Pin || cleanPin,
            name: student?.StudentName || student?.Name || null,
            branchName: student?.BranchName || student?.Branch || null,
            branchCode: student?.BranchCode || null,
            semester: student?.Sem || student?.Semester || cleanSemester,
            collegeCode: student?.CollegeCode || null,
            collegeName: student?.CollegeName || null,
            examination: student?.ExamType || cleanExamType,
            examMonthYear: student?.ExamMonthYear || null,
          },
          subjects,
          subjectTotals,
          gradeSummary,
          summary: {
            totalMarks,
            totalMaxMarks,
            result: hasFailedSubject ? "FAIL" : "PASSED",
          },
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: "Unsupported exam type.",
    });
  } catch (error) {
    console.error("Result error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message && error.message.includes("timed out")
        ? "The SBTET server took too long to respond. Please try again."
        : "Failed to fetch result from SBTET.",
    });
  }
}

