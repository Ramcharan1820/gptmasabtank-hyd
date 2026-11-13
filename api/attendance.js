import https from "https";

export const config = {
  runtime: "nodejs",
};

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
      const parsedUrl = new URL(url);
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
    let { pin } = req.query;

    if (typeof pin !== "string" || !pin.trim()) {
      return res.status(400).json({
        success: false,
        message: "PIN is required.",
      });
    }

    pin = pin.trim().toUpperCase();

    if (!/^[A-Z0-9-]+$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PIN format.",
      });
    }

    const url = `https://www.sbtet.telangana.gov.in/api/api/PreExamination/getAttendanceReport?Pin=${encodeURIComponent(pin)}`;
    const result = await fetchSBTET(url);

    if (!result.ok) {
      return res.status(result.status || 500).json({
        success: false,
        message: "SBTET attendance request failed.",
      });
    }

    const report = parseSBTETResponse(result.data);
    const summary = Array.isArray(report?.Table) ? report.Table[0] : null;
    const dailyAttendance = Array.isArray(report?.Table1) ? report.Table1 : null;

    if (!summary || !dailyAttendance) {
      return res.status(404).json({
        success: false,
        message: "No attendance record was found for this PIN.",
      });
    }

    return res.json({
      success: true,
      data: {
        name: summary.Name || "",
        pin: summary.Pin || pin,
        branchCode: summary.BranchCode || "",
        semester: summary.Semester || "",
        scheme: summary.Scheme || "",
        updatedDate: summary.UpdatedDate || null,
        presentDays: Number(summary.NumberOfDaysPresent) || 0,
        workingDays: Number(summary.WorkingDays ?? summary.ActualWorkingDays) || 0,
        percentage: Number(summary.Percentage ?? summary.TotalPercentage) || 0,
        totalPercentage: Number(summary.TotalPercentage) || 0,
        examsNDP: Number(summary.ExamsNDP) || 0,
        examsPer: Number(summary.ExamsPer) || 0,
        examsWorkingDays: Number(summary.ExamsWorkingDays) || 0,
        dailyAttendance,
      },
    });
  } catch (error) {
    console.error("Attendance API error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message && error.message.includes("timed out")
        ? "The SBTET server took too long to respond. Please try again."
        : "Failed to fetch attendance from SBTET.",
      detail: error.message,
    });
  }
}
