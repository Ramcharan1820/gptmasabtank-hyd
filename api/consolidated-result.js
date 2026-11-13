import https from "https";

export const config = {
  runtime: "nodejs",
};

const SBTET_CONSOLIDATED_RESULT_URL = "https://www.sbtet.telangana.gov.in/api/api/Results/";
const SBTET_CONSOLIDATED_RESULT_ENDPOINTS = {
  C09: "GetC09ConsolidatedResult",
  C14: "GetC14ConsolidatedResult",
  C16: "GetC16ConsolidatedResult",
  C16S: "GetC16SConsolidatedResult",
  ER91: "GetER91ConsolidatedResult",
  ER2020: "GetER91ConsolidatedResult",
  C05: "GetC05ConsolidatedResult",
  C08: "GetC08ConsolidatedResult",
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
    const { pin, scheme } = req.query;

    if (typeof pin !== "string" || typeof scheme !== "string") {
      return res.status(400).json({
        success: false,
        message: "PIN and Scheme are required.",
      });
    }

    const cleanPin = pin.trim().toUpperCase();
    const cleanScheme = scheme.trim().toUpperCase();

    if (!/^[A-Z0-9-]+$/.test(cleanPin)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PIN format.",
      });
    }

    const supportedSchemes = [
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

    if (!supportedSchemes.includes(cleanScheme)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported scheme.",
      });
    }

    const endpoint =
      SBTET_CONSOLIDATED_RESULT_ENDPOINTS[cleanScheme] ||
      "GetConsolidatedResults";
    const url =
      `${SBTET_CONSOLIDATED_RESULT_URL}${endpoint}` +
      `?Pin=${encodeURIComponent(cleanPin)}`;
    const result = await fetchSBTET(url);

    if (!result.ok) {
      return res.status(result.status || 500).json({
        success: false,
        message: "SBTET consolidated result request failed.",
      });
    }

    const report = parseSBTETResponse(result.data);

    if (!report || typeof report !== "object" || Array.isArray(report)) {
      return res.status(502).json({
        success: false,
        message: "SBTET returned an unexpected consolidated result.",
      });
    }

    const table = Array.isArray(report.Table) ? report.Table : [];
    const summaryTable = Array.isArray(report.Table1) ? report.Table1 : [];
    const subjects = Array.isArray(report.Table2) ? report.Table2 : [];
    const semesterResults = Array.isArray(report.Table3) ? report.Table3 : [];
    const student =
      [...table, ...summaryTable].find(
        (row) =>
          row &&
          typeof row === "object" &&
          Object.keys(row).some((key) => /^pin$/i.test(key))
      ) ||
      table[0] ||
      summaryTable[0] ||
      null;
    const responseCode = String(
      [...table, ...summaryTable].find(
        (row) => row && row.ResponceCode !== undefined
      )?.ResponceCode || ""
    );

    if (responseCode === "400" || subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No consolidated result was found for this PIN and scheme.",
      });
    }

    return res.json({
      success: true,
      source: "SBTET",
      data: {
        student,
        summary: summaryTable[0] || {},
        subjects,
        semesters: semesterResults,
      },
    });
  } catch (error) {
    console.error("Consolidated result error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message && error.message.includes("timed out")
        ? "The SBTET server took too long to respond. Please try again."
        : "Failed to fetch consolidated result from SBTET.",
    });
  }
}

