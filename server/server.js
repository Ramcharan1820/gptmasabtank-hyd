const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bcrypt = require("bcryptjs");

// =========================================================
// ENVIRONMENT CONFIGURATION
// =========================================================

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const db = require("./db");
const app = express();
const PORT = Number(process.env.PORT) || 5000;
const PASSWORD_RESET_TTL_MINUTES = 30;
const PASSWORD_RESET_GENERIC_MESSAGE =
  "If an active admin account matches that email, reset instructions will be sent.";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason?.message || reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err?.message || err);
});

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing from server/.env");
}

// =========================================================
// MIDDLEWARE
// =========================================================

app.set("trust proxy", 1);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://gptmasabtank-hyd.vercel.app",
  "https://gptmasabtank.in",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/+$/, "")] : []),
  ...(process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
]);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const cleanOrigin = origin.replace(/\/+$/, "");
  if (allowedOrigins.has(cleanOrigin)) return true;
  if (/^https:\/\/gptmasabtank-hyd.*\.vercel\.app$/.test(cleanOrigin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(cleanOrigin)) return true;
  return false;
};

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "X-Admin-Token"],
};

app.use(cors(corsOptions));

app.use(
  express.json({
    limit: "1mb",
    verify(req, res, buffer) {
      if (req.originalUrl.startsWith("/api/media/cloudinary/webhook")) {
        req.rawBody = Buffer.from(buffer);
      }
    },
  })
);

// =========================================================
// MYSQL SESSION STORE
// =========================================================

const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 2 * 60 * 60 * 1000,
}, db.pool);

sessionStore.on("error", (error) => {
  console.error("MySQL session store error:", error.message);
});

app.use(
  session({
    name: "college_admin_sid",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,

    proxy: process.env.NODE_ENV === "production",

    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 2 * 60 * 60 * 1000,
    },
  })
);

// =========================================================
// DUAL AUTHENTICATION SUPPORT (SESSION COOKIE + BEARER TOKEN)
// =========================================================
// If express-session cookie was blocked by the browser (common in cross-port localhost,
// 127.0.0.1, or strict SameSite policies), resolve session via Authorization: Bearer <token>
// or X-Admin-Token header.
app.use((req, res, next) => {
  if (req.session && req.session.admin) {
    return next();
  }

  const rawAuth = req.headers.authorization || req.headers["x-admin-token"];
  if (!rawAuth || typeof rawAuth !== "string") {
    return next();
  }

  const token = rawAuth.startsWith("Bearer ")
    ? rawAuth.slice(7).trim()
    : rawAuth.trim();

  if (!token) {
    return next();
  }

  sessionStore.get(token, (err, sess) => {
    if (!err && sess && sess.admin) {
      if (!req.session) {
        req.session = {};
      }
      req.session.admin = sess.admin;
      req.sessionID = token;
    }
    return next();
  });
});

// =========================================================
// ADMIN AUTHENTICATION MIDDLEWARE
// =========================================================

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      message: "Please log in as an administrator.",
    });
  }

  if (
    req.session.admin.role !== "admin" &&
    req.session.admin.role !== "superadmin"
  ) {
    return res.status(403).json({
      success: false,
      authenticated: false,
      message: "Administrator access is required.",
    });
  }

  return next();
}

function requireSuperAdmin(req, res, next) {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      message: "Please log in as an administrator.",
    });
  }

  if (req.session.admin.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      authenticated: false,
      message: "Main Administrator access is required.",
    });
  }

  return next();
}

function hashResetValue(value) {
  return crypto
    .createHmac("sha256", process.env.SESSION_SECRET)
    .update(value)
    .digest("hex");
}

function getBrevoEmailConfig() {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName =
    process.env.BREVO_SENDER_NAME || "Government Polytechnic College";

  if (
    !apiKey ||
    !senderEmail ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)
  ) {
    return null;
  }

  return { apiKey, senderEmail, senderName };
}

async function sendBrevoEmail(config, { to, subject, textContent, htmlContent }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": config.apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: config.senderName,
          email: config.senderEmail,
        },
        to: [{ email: to }],
        subject,
        textContent,
        htmlContent,
      }),
      signal: controller.signal,
    });

    await response.text();
    if (!response.ok) {
      throw new Error(`Brevo email API returned HTTP ${response.status}.`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

app.use(
  "/api/media",
  require("./mediaRoutes")({
    db,
    requireAdmin,
  })
);

// =========================================================
// SBTET API URLS
// =========================================================

const SBTET_ATTENDANCE_URL =
  "https://www.sbtet.telangana.gov.in/api/api/PreExamination/getAttendanceReport";

const SBTET_MID_RESULT_URL =
  "https://www.sbtet.telangana.gov.in/api/api/Results/GetC18MidStudentWiseReport";

const SBTET_SEM_RESULT_URL =
  "https://www.sbtet.telangana.gov.in/api/api/Results/GetStudentWiseReport";

const SBTET_CONSOLIDATED_RESULT_URL =
  "https://www.sbtet.telangana.gov.in/api/api/Results/";

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

// =========================================================
// HELPER FUNCTIONS
// =========================================================

function parseSBTETResponse(data) {
  // Some SBTET responses contain JSON encoded inside a string.
  // Parse it more than once when necessary.
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

function isValidDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const https = require("https");
const http = require("http");

function sbtetHeaders() {
  return {
    Accept: "application/json, text/plain, */*",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Referer: "https://www.sbtet.telangana.gov.in/",
    Origin: "https://www.sbtet.telangana.gov.in",
  };
}

function fetchSBTET(url, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === "https:";
      const transport = isHttps ? https : http;

      const reqOptions = {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: options.method || "GET",
        family: 4,
        rejectUnauthorized: false,
        timeout: 20000,
        headers: {
          ...sbtetHeaders(),
          ...(options.headers || {}),
        },
      };

      const req = transport.request(reqOptions, (res) => {
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
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.on("timeout", () => {
        req.destroy(new Error("SBTET request timed out."));
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

function fetchViaVercelProxy(apiPath) {
  return new Promise((resolve, reject) => {
    try {
      const cleanPath = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
      const options = {
        hostname: "cname.vercel-dns.com",
        port: 443,
        path: cleanPath,
        headers: {
          Host: "gptmasabtank.in",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
        },
        servername: "gptmasabtank.in",
        timeout: 15000,
        rejectUnauthorized: false,
      };

      const req = https.get(options, (res) => {
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
      });

      req.on("error", (err) => reject(err));
      req.on("timeout", () => {
        req.destroy(new Error(`Vercel India proxy request timed out for ${cleanPath}`));
      });
    } catch (err) {
      reject(err);
    }
  });
}

// =========================================================
// HOME ROUTE
// =========================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Government Polytechnic College backend is running",
  });
});

// =========================================================
// DATABASE TEST
// =========================================================

app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS test");

    return res.json({
      success: true,
      message: "Node.js is connected to TiDB",
      data: rows,
    });
  } catch (error) {
    console.error("Database test error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// =========================================================
// ADMIN LOGIN
// =========================================================

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, username, identifier: rawId, password } = req.body || {};

    const rawIdentifier = (rawId || email || username || "").trim().toLowerCase();

    if (
      !rawIdentifier ||
      typeof password !== "string" ||
      password.length === 0 ||
      password.length > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email/username and password.",
      });
    }

    const [admins] = await db.execute(
      `SELECT
        id,
        name,
        username,
        email,
        password_hash,
        role,
        status,
        is_active,
        department,
        designation,
        avatar_url,
        auth_provider,
        rejection_reason
       FROM admins
       WHERE LOWER(email) = ? OR LOWER(username) = ?
       LIMIT 1`,
      [rawIdentifier, rawIdentifier]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/username or password.",
      });
    }

    const admin = admins[0];

    // Status & Approval checks
    if (admin.status === "pending") {
      return res.status(403).json({
        success: false,
        status: "pending",
        message:
          "Your administrator registration is currently pending approval by the Main Administrator. Please check back later.",
      });
    }

    if (admin.status === "rejected") {
      return res.status(403).json({
        success: false,
        status: "rejected",
        message: `Your administrator registration was declined.${admin.rejection_reason ? " Reason: " + admin.rejection_reason : ""
          }`,
      });
    }

    if (admin.status === "suspended" || Number(admin.is_active) !== 1) {
      return res.status(403).json({
        success: false,
        status: "suspended",
        message:
          "This administrator account is currently inactive or suspended. Please contact the Main Administrator.",
      });
    }

    if (admin.role !== "admin" && admin.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "This account does not have administrator authorization.",
      });
    }

    if (!admin.password_hash) {
      return res.status(400).json({
        success: false,
        message:
          "This account was registered using Google OAuth. Please sign in using 'Continue with Google'.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/username or password.",
      });
    }

    // Update last_login_at
    await db.execute(
      "UPDATE admins SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?",
      [admin.id]
    );

    // Regenerate session
    req.session.regenerate((error) => {
      if (error) {
        console.error("Session regeneration error:", error.message);
        return res.status(500).json({
          success: false,
          message: "Unable to create an administrator session.",
        });
      }

      req.session.admin = {
        id: admin.id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        department: admin.department,
        designation: admin.designation,
        avatar_url: admin.avatar_url,
        isSuperAdmin: admin.role === "superadmin",
      };

      req.session.save((saveError) => {
        if (saveError) {
          console.error("Session save error:", saveError.message);
          return res.status(500).json({
            success: false,
            message: "Unable to save the administrator session.",
          });
        }

        return res.status(200).json({
          success: true,
          authenticated: true,
          message: "Login successful.",
          token: req.sessionID,
          admin: req.session.admin,
        });
      });
    });
  } catch (error) {
    console.error("Admin login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to process administrator login.",
    });
  }
});

// =========================================================
// ADMIN PASSWORD RESET
// =========================================================

app.post("/api/admin/forgot-password", async (req, res) => {
  const brevoConfig = getBrevoEmailConfig();
  if (!brevoConfig) {
    return res.status(503).json({
      success: false,
      message: "Brevo email is not configured. Please contact the system administrator.",
    });
  }

  const submittedEmail =
    typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const emailKey = hashResetValue(submittedEmail.slice(0, 255));
  const requestIp = req.ip || req.socket?.remoteAddress || "unknown";
  const ipKey = hashResetValue(requestIp);

  try {
    const [ipRequests] = await db.execute(
      `SELECT COUNT(*) AS count
       FROM admin_password_reset_requests
       WHERE request_ip_hash = ?
         AND request_type = 'request'
         AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 MINUTE)`,
      [ipKey]
    );
    const [emailRequests] = await db.execute(
      `SELECT COUNT(*) AS count
       FROM admin_password_reset_requests
       WHERE request_email_hash = ?
         AND request_type = 'request'
         AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 MINUTE)`,
      [emailKey]
    );

    if (Number(ipRequests[0]?.count) >= 10 || Number(emailRequests[0]?.count) >= 3) {
      return res.status(429).json({
        success: false,
        message: "Too many reset requests. Please wait before trying again.",
      });
    }

    await db.execute(
      `INSERT INTO admin_password_reset_requests
        (request_ip_hash, request_email_hash, request_type)
       VALUES (?, ?, 'request')`,
      [ipKey, emailKey]
    );
    await db.execute(
      `DELETE FROM admin_password_reset_requests
       WHERE created_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 HOUR)`
    );

    const emailIsValid =
      submittedEmail.length <= 255 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submittedEmail);
    if (!emailIsValid) {
      return res.status(200).json({
        success: true,
        message: PASSWORD_RESET_GENERIC_MESSAGE,
      });
    }

    const [admins] = await db.execute(
      `SELECT id, name, email
       FROM admins
       WHERE LOWER(email) = ?
         AND role IN ('admin', 'superadmin')
         AND status = 'approved'
         AND is_active = 1
         AND password_hash IS NOT NULL
       LIMIT 1`,
      [submittedEmail]
    );

    if (admins.length === 0) {
      return res.status(200).json({
        success: true,
        message: PASSWORD_RESET_GENERIC_MESSAGE,
      });
    }

    const admin = admins[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    await db.execute(
      `INSERT INTO admin_password_reset_tokens (admin_id, token_hash, expires_at)
       VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ${PASSWORD_RESET_TTL_MINUTES} MINUTE))`,
      [admin.id, tokenHash]
    );
    const [tokenRows] = await db.execute(
      "SELECT id FROM admin_password_reset_tokens WHERE token_hash = ? LIMIT 1",
      [tokenHash]
    );

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173")
      .replace(/\/+$/, "");
    const resetUrl = `${frontendUrl}/admin/forgot-password?token=${encodeURIComponent(resetToken)}`;
    const safeName = escapeHtml(admin.name || "Administrator");

    try {
      await sendBrevoEmail(brevoConfig, {
        to: admin.email,
        subject: "Reset your college administrator password",
        textContent: `Hello ${admin.name || "Administrator"},\n\nUse this secure link to reset your administrator password. It expires in ${PASSWORD_RESET_TTL_MINUTES} minutes:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
        htmlContent: `<p>Hello ${safeName},</p><p>Use this secure link to reset your administrator password. It expires in ${PASSWORD_RESET_TTL_MINUTES} minutes:</p><p><a href="${resetUrl}">Reset administrator password</a></p><p>If you did not request this, you can ignore this email.</p>`,
      });
    } catch (mailError) {
      await db.execute(
        "DELETE FROM admin_password_reset_tokens WHERE token_hash = ?",
        [tokenHash]
      );
      console.error("Admin password reset email delivery failed:", mailError.message);
      return res.status(503).json({
        success: false,
        message: "Reset email could not be sent right now. Please try again later.",
      });
    }

    if (tokenRows.length > 0) {
      await db.execute(
        `UPDATE admin_password_reset_tokens
         SET used_at = UTC_TIMESTAMP()
         WHERE admin_id = ? AND id <> ? AND used_at IS NULL`,
        [admin.id, tokenRows[0].id]
      );
    }

    return res.status(200).json({
      success: true,
      message: PASSWORD_RESET_GENERIC_MESSAGE,
    });
  } catch (error) {
    console.error("Admin password reset request error:", error.message);
    if (
      error.code === "ER_NO_SUCH_TABLE" ||
      error.code === "ER_BAD_FIELD_ERROR"
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Password reset database schema is missing or outdated. Apply migration 008_admin_password_reset.sql to the API database.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to process the password reset request.",
    });
  }
});

app.post("/api/admin/reset-password", async (req, res) => {
  const { token, password } = req.body || {};
  if (
    typeof token !== "string" ||
    !/^[a-f0-9]{64}$/i.test(token) ||
    typeof password !== "string" ||
    password.length < 12 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({
      success: false,
      message: "Use a valid reset link and a password of at least 12 characters (maximum 72 UTF-8 bytes).",
    });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const connection = await db.getConnection();

  try {
    const requestIp = req.ip || req.socket?.remoteAddress || "unknown";
    const ipKey = hashResetValue(requestIp);
    const attemptKey = hashResetValue(tokenHash);
    const [resetAttempts] = await connection.execute(
      `SELECT COUNT(*) AS count
       FROM admin_password_reset_requests
       WHERE request_ip_hash = ?
         AND request_type = 'completion'
         AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 MINUTE)`,
      [ipKey]
    );

    if (Number(resetAttempts[0]?.count) >= 20) {
      return res.status(429).json({
        success: false,
        message: "Too many reset attempts. Please wait before trying again.",
      });
    }

    await connection.execute(
      `INSERT INTO admin_password_reset_requests
        (request_ip_hash, request_email_hash, request_type)
       VALUES (?, ?, 'completion')`,
      [ipKey, attemptKey]
    );
    await connection.beginTransaction();
    const [tokens] = await connection.execute(
      `SELECT id, admin_id
       FROM admin_password_reset_tokens
       WHERE token_hash = ?
         AND used_at IS NULL
         AND expires_at > UTC_TIMESTAMP()
       LIMIT 1
       FOR UPDATE`,
      [tokenHash]
    );

    if (tokens.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired. Request a new one.",
      });
    }

    const adminId = tokens[0].admin_id;
    const passwordHash = await bcrypt.hash(password, 12);
    const [updatedAdmin] = await connection.execute(
      "UPDATE admins SET password_hash = ? WHERE id = ? AND is_active = 1",
      [passwordHash, adminId]
    );
    if (updatedAdmin.affectedRows !== 1) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired. Request a new one.",
      });
    }
    await connection.execute(
      `UPDATE admin_password_reset_tokens
       SET used_at = UTC_TIMESTAMP()
       WHERE admin_id = ? AND used_at IS NULL`,
      [adminId]
    );
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Your password has been updated. Sign in with your new password.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Admin password reset completion error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to update the password right now.",
    });
  } finally {
    connection.release();
  }
});

// =========================================================
// CHECK ADMIN SESSION
// =========================================================

app.get("/api/admin/me", async (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      message: "Please log in as an administrator.",
    });
  }

  try {
    const adminId = req.session.admin.id;
    const [rows] = await db.execute(
      `SELECT
        id,
        name,
        username,
        email,
        role,
        status,
        is_active,
        department,
        designation,
        avatar_url
       FROM admins
       WHERE id = ?
       LIMIT 1`,
      [adminId]
    );

    if (
      rows.length === 0 ||
      rows[0].status !== "approved" ||
      Number(rows[0].is_active) !== 1
    ) {
      if (req.session && typeof req.session.destroy === "function") {
        req.session.destroy(() => { });
      }
      return res.status(403).json({
        success: false,
        authenticated: false,
        message: "Administrator session is no longer active or authorized.",
      });
    }

    const currentAdmin = rows[0];

    // Sync refreshed properties into session
    req.session.admin = {
      id: currentAdmin.id,
      name: currentAdmin.name,
      username: currentAdmin.username,
      email: currentAdmin.email,
      role: currentAdmin.role,
      status: currentAdmin.status,
      department: currentAdmin.department,
      designation: currentAdmin.designation,
      avatar_url: currentAdmin.avatar_url,
      isSuperAdmin: currentAdmin.role === "superadmin",
    };

    return res.status(200).json({
      success: true,
      authenticated: true,
      admin: req.session.admin,
      isSuperAdmin: req.session.admin.role === "superadmin",
    });
  } catch (error) {
    console.error("Error refreshing admin session:", error.message);
    return res.status(200).json({
      success: true,
      authenticated: true,
      admin: req.session.admin,
      isSuperAdmin: req.session.admin.role === "superadmin",
    });
  }
});

// =========================================================
// ADMIN REGISTRATION (NEW ADMINS - REQUIRES APPROVAL)
// =========================================================

app.post("/api/admin/register", async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      department,
      designation,
      phone,
      request_reason,
      auth_provider,
      auth_provider_id,
      avatar_url,
    } = req.body || {};

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const provider = auth_provider === "google" ? "google" : "local";

    if (!cleanName || cleanName.length < 2 || cleanName.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid full name (2 to 150 characters).",
      });
    }

    if (!cleanUsername || !/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message:
          "Username must be 3-30 characters long and contain only letters, numbers, and underscores.",
      });
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (provider !== "google") {
      if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long.",
        });
      }
      if (password.length > 72) {
        return res.status(400).json({
          success: false,
          message: "Password must not exceed 72 characters.",
        });
      }
    }

    // Check if email already exists
    const [existingEmail] = await db.execute(
      "SELECT id, status, is_active FROM admins WHERE LOWER(email) = ? LIMIT 1",
      [cleanEmail]
    );

    if (existingEmail.length > 0) {
      const existing = existingEmail[0];
      if (existing.status === "pending") {
        return res.status(409).json({
          success: false,
          status: "pending",
          message:
            "A registration request with this email is already awaiting Main Administrator approval.",
        });
      }
      if (existing.status === "approved") {
        return res.status(409).json({
          success: false,
          status: "approved",
          message: "An active administrator account with this email already exists.",
        });
      }
      if (existing.status === "rejected") {
        return res.status(409).json({
          success: false,
          status: "rejected",
          message:
            "A registration with this email was previously declined. Please contact the college administrator.",
        });
      }
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // Check if username already exists
    const [existingUsername] = await db.execute(
      "SELECT id FROM admins WHERE LOWER(username) = ? LIMIT 1",
      [cleanUsername]
    );

    if (existingUsername.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This username is already taken. Please choose another username.",
      });
    }

    const passwordHash =
      password && typeof password === "string"
        ? await bcrypt.hash(password, 12)
        : null;

    const [result] = await db.execute(
      `INSERT INTO admins (
        name,
        username,
        email,
        password_hash,
        role,
        status,
        is_active,
        auth_provider,
        auth_provider_id,
        department,
        designation,
        phone,
        avatar_url,
        request_reason
      ) VALUES (?, ?, ?, ?, 'admin', 'pending', 0, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanName,
        cleanUsername,
        cleanEmail,
        passwordHash,
        provider,
        auth_provider_id || null,
        department?.trim() || null,
        designation?.trim() || null,
        phone?.trim() || null,
        avatar_url?.trim() || null,
        request_reason?.trim() || null,
      ]
    );

    return res.status(201).json({
      success: true,
      status: "pending",
      message:
        "Administrator registration request submitted successfully! Your account is queued for verification and approval by the Main Administrator.",
      admin: {
        id: result.insertId,
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        department: department || null,
        status: "pending",
        auth_provider: provider,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit administrator registration. Please try again.",
    });
  }
});

// =========================================================
// CHECK ADMIN REGISTRATION STATUS
// =========================================================

app.post("/api/admin/check-status", async (req, res) => {
  try {
    const { identifier } = req.body || {};
    const cleanId = (identifier || "").trim().toLowerCase();

    if (!cleanId) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email or username to check registration status.",
      });
    }

    const [admins] = await db.execute(
      `SELECT
        a.id,
        a.name,
        a.username,
        a.email,
        a.department,
        a.designation,
        a.role,
        a.status,
        a.is_active,
        a.auth_provider,
        a.rejection_reason,
        a.created_at,
        a.approved_at,
        approver.name AS approved_by_name
       FROM admins a
       LEFT JOIN admins approver ON a.approved_by = approver.id
       WHERE LOWER(a.email) = ? OR LOWER(a.username) = ?
       LIMIT 1`,
      [cleanId, cleanId]
    );

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No administrator registration found for this email or username.",
      });
    }

    const admin = admins[0];

    return res.status(200).json({
      success: true,
      status: admin.status,
      admin: {
        id: admin.id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        department: admin.department,
        designation: admin.designation,
        role: admin.role,
        status: admin.status,
        is_active: Boolean(admin.is_active),
        auth_provider: admin.auth_provider,
        rejection_reason: admin.rejection_reason,
        created_at: admin.created_at,
        approved_at: admin.approved_at,
        approved_by_name: admin.approved_by_name,
      },
    });
  } catch (error) {
    console.error("Admin check status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve registration status.",
    });
  }
});

// =========================================================
// PENDING ADMIN REGISTRATIONS COUNT (FOR DASHBOARD BADGE)
// =========================================================

app.get("/api/admin/pending-count", requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT COUNT(*) AS count FROM admins WHERE status = 'pending'"
    );
    return res.status(200).json({
      success: true,
      count: rows[0]?.count || 0,
    });
  } catch (error) {
    console.error("Pending count error:", error);
    return res.status(500).json({ success: false, count: 0 });
  }
});

// =========================================================
// SUPERADMIN - LIST ALL ADMINISTRATORS & APPLICANTS
// =========================================================

app.get("/api/admin/users", requireSuperAdmin, async (req, res) => {
  try {
    const { status, search } = req.query || {};

    let query = `
      SELECT
        a.id,
        a.name,
        a.username,
        a.email,
        a.role,
        a.status,
        a.is_active,
        a.auth_provider,
        a.department,
        a.designation,
        a.phone,
        a.avatar_url,
        a.request_reason,
        a.rejection_reason,
        a.created_at,
        a.approved_at,
        a.last_login_at,
        approver.name AS approved_by_name
      FROM admins a
      LEFT JOIN admins approver ON a.approved_by = approver.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== "all") {
      query += " AND a.status = ?";
      params.push(status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      query += " AND (LOWER(a.name) LIKE ? OR LOWER(a.email) LIKE ? OR LOWER(COALESCE(a.username, '')) LIKE ? OR LOWER(COALESCE(a.department, '')) LIKE ?)";
      params.push(term, term, term, term);
    }

    query += `
      ORDER BY
        CASE WHEN a.status = 'pending' THEN 0 ELSE 1 END,
        a.created_at DESC
    `;

    const [admins] = await db.execute(query, params);

    // Summary counts for dashboard metrics
    const [counts] = await db.execute(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'approved' AND is_active = 1 THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN status = 'suspended' OR is_active = 0 THEN 1 ELSE 0 END) AS suspended
      FROM admins
    `);

    return res.status(200).json({
      success: true,
      admins,
      counts: counts[0] || { total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 },
    });
  } catch (error) {
    console.error("Fetch admins error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve administrator accounts.",
    });
  }
});

// =========================================================
// SUPERADMIN - APPROVE ADMIN
// =========================================================

app.post("/api/admin/users/:id/approve", requireSuperAdmin, async (req, res) => {
  try {
    const adminId = Number(req.params.id);

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid administrator ID.",
      });
    }

    const approverId = req.session.admin.id;

    const [result] = await db.execute(
      `UPDATE admins
       SET status = 'approved',
           is_active = 1,
           approved_by = ?,
           approved_at = CURRENT_TIMESTAMP,
           rejection_reason = NULL
       WHERE id = ?`,
      [approverId, adminId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Administrator record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Administrator has been approved and granted active access.",
    });
  } catch (error) {
    console.error("Approve admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve administrator.",
    });
  }
});

// =========================================================
// SUPERADMIN - REJECT ADMIN
// =========================================================

app.post("/api/admin/users/:id/reject", requireSuperAdmin, async (req, res) => {
  try {
    const adminId = Number(req.params.id);
    const { reason } = req.body || {};

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid administrator ID.",
      });
    }

    if (adminId === req.session.admin.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot reject your own administrator account.",
      });
    }

    const approverId = req.session.admin.id;

    const [result] = await db.execute(
      `UPDATE admins
       SET status = 'rejected',
           is_active = 0,
           rejection_reason = ?,
           approved_by = ?,
           approved_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [reason?.trim() || "Registration declined by Main Administrator", approverId, adminId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Administrator record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Administrator registration request has been declined.",
    });
  } catch (error) {
    console.error("Reject admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject administrator.",
    });
  }
});

// =========================================================
// SUPERADMIN - TOGGLE ACTIVE STATUS (SUSPEND / ACTIVATE)
// =========================================================

app.post("/api/admin/users/:id/toggle-status", requireSuperAdmin, async (req, res) => {
  try {
    const adminId = Number(req.params.id);

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid administrator ID.",
      });
    }

    if (adminId === req.session.admin.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate or suspend your own account.",
      });
    }

    const [rows] = await db.execute(
      "SELECT id, is_active, status FROM admins WHERE id = ? LIMIT 1",
      [adminId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Administrator record not found.",
      });
    }

    const currentActive = Number(rows[0].is_active) === 1;
    const newActive = currentActive ? 0 : 1;
    const newStatus = newActive ? "approved" : "suspended";

    await db.execute(
      "UPDATE admins SET is_active = ?, status = ? WHERE id = ?",
      [newActive, newStatus, adminId]
    );

    return res.status(200).json({
      success: true,
      is_active: newActive,
      status: newStatus,
      message: newActive
        ? "Administrator account has been activated."
        : "Administrator account has been suspended.",
    });
  } catch (error) {
    console.error("Toggle admin status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update account status.",
    });
  }
});

// =========================================================
// SUPERADMIN - UPDATE ADMIN ROLE (PROMOTE / DEMOTE)
// =========================================================

app.post("/api/admin/users/:id/role", requireSuperAdmin, async (req, res) => {
  try {
    const adminId = Number(req.params.id);
    const { role } = req.body || {};

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid administrator ID.",
      });
    }

    if (role !== "admin" && role !== "superadmin") {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'admin' or 'superadmin'.",
      });
    }

    if (adminId === req.session.admin.id && role !== "superadmin") {
      const [countSuper] = await db.execute(
        "SELECT COUNT(*) AS count FROM admins WHERE role = 'superadmin' AND is_active = 1"
      );
      if (countSuper[0].count <= 1) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot demote yourself. The system must retain at least one active Main Administrator.",
        });
      }
    }

    await db.execute("UPDATE admins SET role = ? WHERE id = ?", [role, adminId]);

    return res.status(200).json({
      success: true,
      message: `Administrator role successfully updated to ${role}.`,
    });
  } catch (error) {
    console.error("Update role error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update administrator role.",
    });
  }
});

// =========================================================
// SUPERADMIN - DELETE ADMIN RECORD
// =========================================================

app.delete("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
  try {
    const adminId = Number(req.params.id);

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid administrator ID.",
      });
    }

    if (adminId === req.session.admin.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own administrator account.",
      });
    }

    const [result] = await db.execute("DELETE FROM admins WHERE id = ?", [adminId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Administrator not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Administrator record deleted successfully.",
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete administrator.",
    });
  }
});

// =========================================================
// ADMIN LOGOUT
// =========================================================

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  const rawAuth = req.headers.authorization || req.headers["x-admin-token"];
  const token = rawAuth?.startsWith("Bearer ")
    ? rawAuth.slice(7).trim()
    : rawAuth?.trim() || req.sessionID;

  if (token) {
    sessionStore.destroy(token, () => { });
  }

  const clearCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  if (req.session && typeof req.session.destroy === "function") {
    req.session.destroy((error) => {
      res.clearCookie("college_admin_sid", clearCookieOptions);

      if (error) {
        console.error("Admin logout error:", error.message);

        return res.status(500).json({
          success: false,
          message: "Unable to log out.",
        });
      }

      return res.json({
        success: true,
        message: "Logged out successfully.",
      });
    });
  } else {
    res.clearCookie("college_admin_sid", clearCookieOptions);
    return res.json({
      success: true,
      message: "Logged out successfully.",
    });
  }
});

// =========================================================
// ALUMNI DEPARTMENT NORMALIZATION
// =========================================================

const departmentAliases = {
  "computer science & engineering":
    "Computer Science & Engineering",
  cse: "Computer Science & Engineering",

  "electronics & communication engineering":
    "Electronics & Communication Engineering",
  ece: "Electronics & Communication Engineering",

  "electrical & electronics engineering":
    "Electrical & Electronics Engineering",
  eee: "Electrical & Electronics Engineering",

  "mechanical engineering": "Mechanical Engineering",
  mechanical: "Mechanical Engineering",

  "civil engineering": "Civil Engineering",
  civil: "Civil Engineering",

  "automobile engineering": "Automobile Engineering",
  automobile: "Automobile Engineering",

  pharmacy: "Pharmacy",
};

function normalizeDepartment(department) {
  if (typeof department !== "string") {
    return null;
  }

  const key = department.trim().toLowerCase().replace(/\s+/g, " ");

  return departmentAliases[key] || null;
}

// =========================================================
// ALUMNI REGISTRATION
// =========================================================

app.post("/api/alumni/register", async (req, res) => {
  try {
    const {
      fullName,
      department,
      alumniStatus,
      graduationYear,
      pin,
      organization,
      email,
      phone,
      authenticationMethod,
      privacyAccepted,
      informationConfirmed,
    } = req.body || {};

    const cleanFullName =
      typeof fullName === "string" ? fullName.trim() : "";

    const cleanDepartment =
      typeof department === "string" ? department.trim() : "";

    const normalizedDepartment = normalizeDepartment(cleanDepartment);

    const cleanStatus =
      typeof alumniStatus === "string"
        ? alumniStatus.trim()
        : "Alumni";

    const cleanEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    const cleanPhone =
      typeof phone === "string" ? phone.trim() : "";

    const cleanPin =
      typeof pin === "string" ? pin.trim() : "";

    const cleanOrganization =
      typeof organization === "string"
        ? organization.trim()
        : "";

    const cleanAuthMethod =
      typeof authenticationMethod === "string"
        ? authenticationMethod.trim()
        : "Email";

    const year = Number(graduationYear);
    const currentYear = new Date().getFullYear();

    if (
      !cleanFullName ||
      !cleanDepartment ||
      !cleanEmail ||
      !cleanPhone ||
      graduationYear === undefined ||
      graduationYear === null ||
      graduationYear === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill in all required fields, including graduation year.",
      });
    }

    if (cleanFullName.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Full name must not exceed 150 characters.",
      });
    }

    if (!normalizedDepartment) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid department.",
      });
    }

    if (!["Alumni", "Former Student"].includes(cleanStatus)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid alumni status.",
      });
    }

    if (
      !Number.isInteger(year) ||
      year < 1980 ||
      year > currentYear
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Graduation year must be between 1980 and ${currentYear}.`,
      });
    }

    if (
      cleanEmail.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (
      cleanPhone.length > 20 ||
      !/^[0-9+()\-\s]+$/.test(cleanPhone) ||
      cleanPhone.replace(/\D/g, "").length < 7
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number.",
      });
    }

    if (
      cleanPin.length > 50 ||
      cleanOrganization.length > 200
    ) {
      return res.status(400).json({
        success: false,
        message: "PIN or organization information is too long.",
      });
    }

    if (!["Email", "Google", "LinkedIn"].includes(cleanAuthMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid authentication method.",
      });
    }

    if (
      privacyAccepted !== true ||
      informationConfirmed !== true
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please accept the privacy notice and confirm your information.",
      });
    }

    const sql = `
      INSERT INTO alumni (
        full_name,
        department,
        alumni_status,
        graduation_year,
        pin,
        organization,
        email,
        phone,
        authentication_method,
        privacy_accepted,
        information_confirmed
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      cleanFullName,
      normalizedDepartment,
      cleanStatus,
      year,
      cleanPin || null,
      cleanOrganization || null,
      cleanEmail,
      cleanPhone,
      cleanAuthMethod,
      true,
      true,
    ];

    const [result] = await db.execute(sql, values);
    const brevoConfig = getBrevoEmailConfig();
    let confirmationEmailSent = false;

    if (!brevoConfig) {
      console.error(
        "Alumni registration confirmation email is not configured."
      );
    } else {
      const registrationId = result.insertId;
      const safeName = escapeHtml(cleanFullName);
      const safeDepartment = escapeHtml(normalizedDepartment);
      const safeStatus = escapeHtml(cleanStatus);
      const subject =
        "Welcome to the Government Polytechnic Masab Tank Alumni Network";
      const textContent = [
        `Hello ${cleanFullName},`,
        "",
        "Your registration has been received and saved successfully. You are now registered with the Government Polytechnic College, Masab Tank Alumni Network.",
        "",
        `Registration ID: ${registrationId}`,
        `Department: ${normalizedDepartment}`,
        `Alumni status: ${cleanStatus}`,
        `Year of graduation: ${year}`,
        "",
        "We look forward to keeping you connected with your college and fellow alumni.",
        "",
        "Government Polytechnic College, Masab Tank",
        "Alumni Network",
      ].join("\n");
      const htmlContent = `
        <div style="margin:0;padding:32px 12px;background:#f3f5f8;font-family:Arial,Helvetica,sans-serif;color:#263449;">
          <div style="max-width:620px;margin:0 auto;overflow:hidden;border:1px solid #e1e6ed;border-radius:14px;background:#ffffff;">
            <div style="padding:30px 36px;background:#800000;color:#ffffff;">
              <p style="margin:0 0 10px;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#f4dada;">Alumni Network</p>
              <h1 style="margin:0;font-size:25px;line-height:1.35;">Registration confirmed</h1>
              <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#f8eaea;">Government Polytechnic College, Masab Tank</p>
            </div>
            <div style="padding:32px 36px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hello ${safeName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#526174;">Your registration has been received and saved successfully. You are now part of the Government Polytechnic College, Masab Tank Alumni Network.</p>
              <div style="padding:20px 22px;border:1px solid #e7ebf0;border-radius:10px;background:#f8fafc;">
                <p style="margin:0 0 14px;font-size:13px;font-weight:bold;color:#800000;text-transform:uppercase;letter-spacing:1px;">Registration details</p>
                <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;">
                  <tr><td style="padding:7px 12px 7px 0;color:#718096;">Registration ID</td><td style="padding:7px 0;font-weight:bold;color:#263449;">${registrationId}</td></tr>
                  <tr><td style="padding:7px 12px 7px 0;color:#718096;">Department</td><td style="padding:7px 0;color:#263449;">${safeDepartment}</td></tr>
                  <tr><td style="padding:7px 12px 7px 0;color:#718096;">Alumni status</td><td style="padding:7px 0;color:#263449;">${safeStatus}</td></tr>
                  <tr><td style="padding:7px 12px 7px 0;color:#718096;">Year of graduation</td><td style="padding:7px 0;color:#263449;">${year}</td></tr>
                </table>
              </div>
              <p style="margin:24px 0 0;font-size:14px;line-height:1.8;color:#526174;">We look forward to keeping you connected with your college and fellow alumni.</p>
            </div>
            <div style="padding:18px 36px;border-top:1px solid #e9edf2;background:#fbfcfd;">
              <p style="margin:0;font-size:12px;line-height:1.7;color:#788598;">Government Polytechnic College, Masab Tank<br>Alumni Network</p>
            </div>
          </div>
        </div>
      `;

      try {
        await sendBrevoEmail(brevoConfig, {
          to: cleanEmail,
          subject,
          textContent,
          htmlContent,
        });
        confirmationEmailSent = true;
      } catch (emailError) {
        console.error(
          "Alumni registration confirmation email delivery failed:",
          emailError.message
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Alumni registration saved successfully.",
      data: {
        id: result.insertId,
        fullName: cleanFullName,
        department: normalizedDepartment,
        alumniStatus: cleanStatus,
        graduationYear: year,
        email: cleanEmail,
        authenticationMethod: cleanAuthMethod,
        confirmationEmailSent,
      },
    });
  } catch (error) {
    console.error("Alumni registration error:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This email address is already registered.",
      });
    }

    if (error.code === "ER_BAD_FIELD_ERROR") {
      return res.status(500).json({
        success: false,
        message:
          "The alumni database columns do not match the registration form.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save alumni registration.",
    });
  }
});

// =========================================================
// GET ALUMNI - ADMIN ONLY
// =========================================================

app.get("/api/alumni", requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        full_name,
        department,
        alumni_status,
        graduation_year,
        organization,
        email,
        phone,
        authentication_method,
        created_at
      FROM alumni
      ORDER BY id DESC
    `);

    return res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Get alumni error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve alumni registrations.",
    });
  }
});

// =========================================================
// CATEGORIES MANAGEMENT SYSTEM - FOR ALL PAGES
// =========================================================

const VALID_CATEGORY_TARGETS = new Set([
  "events",
  "gallery",
  "notices",
  "faculty",
  "placements",
  "departments",
  "alumni",
  "general",
]);

const slugifyCategory = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

// PUBLIC: Fetch categories by page or all active
app.get("/api/categories", async (req, res) => {
  try {
    const { page } = req.query;
    let query = `
      SELECT id, target_page, name, slug, description, color, icon, sort_order, is_active, created_at, updated_at
      FROM categories
      WHERE is_active = 1
    `;
    const params = [];

    if (page && typeof page === "string" && page.trim() && page.trim().toLowerCase() !== "all") {
      query += ` AND target_page = ?`;
      params.push(page.trim().toLowerCase());
    }

    query += ` ORDER BY target_page ASC, sort_order ASC, name ASC`;

    const [rows] = await db.query(query, params);

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get categories error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories.",
    });
  }
});

// ADMIN: Fetch all categories with dynamic item usage count
app.get("/api/admin/categories", requireAdmin, async (req, res) => {
  try {
    const { page, search, status } = req.query;

    let query = `
      SELECT id, target_page, name, slug, description, color, icon, sort_order, is_active, created_at, updated_at
      FROM categories
      WHERE 1=1
    `;
    const params = [];

    if (page && typeof page === "string" && page.trim() && page.trim().toLowerCase() !== "all") {
      query += ` AND target_page = ?`;
      params.push(page.trim().toLowerCase());
    }

    if (status === "active") {
      query += ` AND is_active = 1`;
    } else if (status === "inactive") {
      query += ` AND is_active = 0`;
    }

    if (search && typeof search === "string" && search.trim()) {
      query += ` AND (name LIKE ? OR slug LIKE ? OR description LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY target_page ASC, sort_order ASC, name ASC`;

    const [categories] = await db.query(query, params);

    // Compute live item counts for categories
    const usageCounts = {
      events: {},
      gallery: {},
      notices: {},
      faculty: {},
      placements: {},
      departments: {},
      alumni: {},
    };

    try {
      const [eventRows] = await db.query(
        "SELECT LOWER(category) as cat, COUNT(*) as c FROM events WHERE category IS NOT NULL GROUP BY LOWER(category)"
      );
      for (const r of eventRows) if (r.cat) usageCounts.events[r.cat] = Number(r.c);

      const [galleryRows] = await db.query(
        "SELECT LOWER(JSON_UNQUOTE(JSON_EXTRACT(payload, '$.category'))) as cat, COUNT(*) as c FROM site_content WHERE content_type = 'gallery' GROUP BY cat"
      );
      for (const r of galleryRows) if (r.cat) usageCounts.gallery[r.cat] = Number(r.c);

      const [noticeRows] = await db.query(
        "SELECT LOWER(category) as cat, COUNT(*) as c FROM notices WHERE category IS NOT NULL GROUP BY LOWER(category)"
      );
      for (const r of noticeRows) if (r.cat) usageCounts.notices[r.cat] = Number(r.c);

      const [facultyRows] = await db.query(
        "SELECT LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(payload, '$.category')), JSON_UNQUOTE(JSON_EXTRACT(payload, '$.department')))) as cat, COUNT(*) as c FROM site_content WHERE content_type = 'faculty' GROUP BY cat"
      );
      for (const r of facultyRows) if (r.cat) usageCounts.faculty[r.cat] = Number(r.c);

      const [placementRows] = await db.query(
        "SELECT LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(payload, '$.category')), JSON_UNQUOTE(JSON_EXTRACT(payload, '$.kind')))) as cat, COUNT(*) as c FROM site_content WHERE content_type = 'placements' GROUP BY cat"
      );
      for (const r of placementRows) if (r.cat) usageCounts.placements[r.cat] = Number(r.c);

      const [deptRows] = await db.query(
        "SELECT LOWER(department_code) as cat, COUNT(*) as c FROM departments GROUP BY cat"
      );
      for (const r of deptRows) if (r.cat) usageCounts.departments[r.cat] = Number(r.c);

      const [alumniRows] = await db.query(
        "SELECT LOWER(department) as cat, COUNT(*) as c FROM alumni WHERE department IS NOT NULL GROUP BY LOWER(department)"
      );
      for (const r of alumniRows) if (r.cat) usageCounts.alumni[r.cat] = Number(r.c);
    } catch (countErr) {
      console.warn("Could not calculate dynamic category usage counts:", countErr.message);
    }

    const data = categories.map((cat) => {
      const target = (cat.target_page || "").toLowerCase();
      const catKey = (cat.name || "").toLowerCase();
      const itemCount = usageCounts[target]?.[catKey] || 0;
      return {
        ...cat,
        is_active: Boolean(cat.is_active),
        item_count: itemCount,
      };
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get admin categories error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories.",
    });
  }
});

// ADMIN: POST /api/admin/categories
app.post("/api/admin/categories", requireAdmin, async (req, res) => {
  try {
    const {
      target_page,
      name,
      slug,
      description,
      color = "#800000",
      icon = "Tag",
      sort_order = 0,
      is_active = true,
    } = req.body || {};

    if (
      !target_page ||
      typeof target_page !== "string" ||
      !VALID_CATEGORY_TARGETS.has(target_page.trim().toLowerCase())
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid target page. Supported pages: ${Array.from(VALID_CATEGORY_TARGETS).join(", ")}.`,
      });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const cleanTarget = target_page.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanSlug = slug && typeof slug === "string" && slug.trim() ? slugifyCategory(slug) : slugifyCategory(cleanName);
    const cleanDesc = description && typeof description === "string" ? description.trim() || null : null;
    const cleanColor = typeof color === "string" && /^#[0-9a-fA-F]{3,8}$/.test(color.trim()) ? color.trim() : "#800000";
    const cleanIcon = typeof icon === "string" && icon.trim() ? icon.trim() : "Tag";
    const parsedOrder = Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0;

    // Check duplicate
    const [existing] = await db.execute(
      "SELECT id FROM categories WHERE target_page = ? AND LOWER(name) = LOWER(?) LIMIT 1",
      [cleanTarget, cleanName]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Category "${cleanName}" already exists for ${cleanTarget}.`,
      });
    }

    const [result] = await db.execute(
      `INSERT INTO categories
        (target_page, name, slug, description, color, icon, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [cleanTarget, cleanName, cleanSlug, cleanDesc, cleanColor, cleanIcon, parsedOrder, is_active ? 1 : 0]
    );

    return res.status(201).json({
      success: true,
      message: `Category "${cleanName}" created successfully for ${cleanTarget}.`,
      data: {
        id: result.insertId,
        target_page: cleanTarget,
        name: cleanName,
        slug: cleanSlug,
        description: cleanDesc,
        color: cleanColor,
        icon: cleanIcon,
        sort_order: parsedOrder,
        is_active: Boolean(is_active),
      },
    });
  } catch (error) {
    console.error("Create category error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create category.",
    });
  }
});

// ADMIN: PUT /api/admin/categories/:id
app.put("/api/admin/categories/:id", requireAdmin, async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid category ID." });
    }

    const {
      target_page,
      name,
      slug,
      description,
      color,
      icon,
      sort_order,
      is_active,
    } = req.body || {};

    const [existing] = await db.execute("SELECT * FROM categories WHERE id = ? LIMIT 1", [categoryId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }
    const current = existing[0];

    const cleanTarget = target_page && typeof target_page === "string" && VALID_CATEGORY_TARGETS.has(target_page.trim().toLowerCase())
      ? target_page.trim().toLowerCase()
      : current.target_page;

    const cleanName = name && typeof name === "string" && name.trim() ? name.trim() : current.name;
    const cleanSlug = slug && typeof slug === "string" && slug.trim() ? slugifyCategory(slug) : slugifyCategory(cleanName);
    const cleanDesc = description !== undefined ? (typeof description === "string" ? description.trim() || null : null) : current.description;
    const cleanColor = color && typeof color === "string" && /^#[0-9a-fA-F]{3,8}$/.test(color.trim()) ? color.trim() : current.color;
    const cleanIcon = icon && typeof icon === "string" && icon.trim() ? icon.trim() : current.icon;
    const cleanOrder = sort_order !== undefined && Number.isInteger(Number(sort_order)) ? Number(sort_order) : current.sort_order;
    const cleanActive = is_active !== undefined ? (Boolean(is_active) ? 1 : 0) : current.is_active;

    // Check duplicate name on target page
    const [dup] = await db.execute(
      "SELECT id FROM categories WHERE target_page = ? AND LOWER(name) = LOWER(?) AND id != ? LIMIT 1",
      [cleanTarget, cleanName, categoryId]
    );

    if (dup.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Another category with name "${cleanName}" already exists for ${cleanTarget}.`,
      });
    }

    await db.execute(
      `UPDATE categories
       SET target_page = ?, name = ?, slug = ?, description = ?, color = ?, icon = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [cleanTarget, cleanName, cleanSlug, cleanDesc, cleanColor, cleanIcon, cleanOrder, cleanActive, categoryId]
    );

    return res.json({
      success: true,
      message: "Category updated successfully.",
      data: {
        id: categoryId,
        target_page: cleanTarget,
        name: cleanName,
        slug: cleanSlug,
        description: cleanDesc,
        color: cleanColor,
        icon: cleanIcon,
        sort_order: cleanOrder,
        is_active: Boolean(cleanActive),
      },
    });
  } catch (error) {
    console.error("Update category error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update category." });
  }
});

// ADMIN: POST /api/admin/categories/:id/toggle-status
app.post("/api/admin/categories/:id/toggle-status", requireAdmin, async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid category ID." });
    }

    const [rows] = await db.execute("SELECT id, name, is_active FROM categories WHERE id = ? LIMIT 1", [categoryId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    const newStatus = rows[0].is_active ? 0 : 1;
    await db.execute("UPDATE categories SET is_active = ? WHERE id = ?", [newStatus, categoryId]);

    return res.json({
      success: true,
      message: `Category "${rows[0].name}" is now ${newStatus ? "active" : "inactive"}.`,
      is_active: Boolean(newStatus),
    });
  } catch (error) {
    console.error("Toggle category status error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to toggle category status." });
  }
});

// ADMIN: DELETE /api/admin/categories/:id
app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    const force = req.query.force === "true";

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid category ID." });
    }

    const [existing] = await db.execute("SELECT * FROM categories WHERE id = ? LIMIT 1", [categoryId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }
    const category = existing[0];

    // Check usage
    let inUseCount = 0;
    try {
      if (category.target_page === "events") {
        const [r] = await db.execute("SELECT count(*) as c FROM events WHERE LOWER(category) = LOWER(?)", [category.name]);
        inUseCount = Number(r[0].c);
      } else if (category.target_page === "gallery") {
        const [r] = await db.execute(
          "SELECT count(*) as c FROM site_content WHERE content_type = 'gallery' AND LOWER(JSON_UNQUOTE(JSON_EXTRACT(payload, '$.category'))) = LOWER(?)",
          [category.name]
        );
        inUseCount = Number(r[0].c);
      } else if (category.target_page === "notices") {
        const [r] = await db.execute("SELECT count(*) as c FROM notices WHERE LOWER(category) = LOWER(?)", [category.name]);
        inUseCount = Number(r[0].c);
      }
    } catch (e) {
      // continue
    }

    if (inUseCount > 0 && !force) {
      return res.status(409).json({
        success: false,
        in_use: true,
        count: inUseCount,
        message: `Category "${category.name}" is currently assigned to ${inUseCount} ${category.target_page} item(s). Confirm delete with force=true if you really wish to delete it.`,
      });
    }

    await db.execute("DELETE FROM categories WHERE id = ?", [categoryId]);

    return res.json({
      success: true,
      message: `Category "${category.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete category error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to delete category." });
  }
});

// ADMIN: POST /api/admin/categories/seed-defaults
app.post("/api/admin/categories/seed-defaults", requireAdmin, async (req, res) => {
  try {
    const { DEFAULT_CATEGORIES } = require("./migrations/migrate_categories");
    let inserted = 0;
    for (const cat of DEFAULT_CATEGORIES) {
      const [existing] = await db.execute(
        "SELECT id FROM categories WHERE target_page = ? AND name = ? LIMIT 1",
        [cat.target_page, cat.name]
      );
      if (existing.length === 0) {
        await db.execute(
          `INSERT INTO categories (target_page, name, slug, description, color, icon, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [cat.target_page, cat.name, cat.slug, cat.description, cat.color, cat.icon, cat.sort_order]
        );
        inserted++;
      }
    }
    return res.json({
      success: true,
      message: `Seeded ${inserted} standard categories.`,
    });
  } catch (error) {
    console.error("Seed categories error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to seed default categories." });
  }
});

// =========================================================
// NOTICES
// =========================================================

app.get("/api/notices", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, title, description, category, notice_date, created_at
      FROM notices
      ORDER BY notice_date DESC, id DESC
    `);

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get notices error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notices.",
    });
  }
});

// =========================================================
// ADD NOTICE - ADMIN ONLY
// =========================================================

app.post("/api/notices", requireAdmin, async (req, res) => {
  try {
    const { title, description, category, notice_date } = req.body || {};

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notice title is required.",
      });
    }

    const cleanCategory = typeof category === "string" && category.trim() ? category.trim() : "General";

    const [result] = await db.execute(
      `INSERT INTO notices (title, description, category, notice_date)
       VALUES (?, ?, ?, ?)`,
      [
        title.trim(),
        typeof description === "string"
          ? description.trim() || null
          : null,
        cleanCategory,
        notice_date || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Notice added successfully.",
      data: {
        id: result.insertId,
        title: title.trim(),
        category: cleanCategory,
      },
    });
  } catch (error) {
    console.error("Add notice error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add notice.",
    });
  }
});

// =========================================================
// UPDATE NOTICE - ADMIN ONLY
// =========================================================

app.put("/api/notices/:id", requireAdmin, async (req, res) => {
  try {
    const noticeId = Number(req.params.id);
    const { title, description, category, notice_date } = req.body || {};

    if (!Number.isInteger(noticeId) || noticeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice ID.",
      });
    }

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notice title is required.",
      });
    }

    // Check that the notice exists before updating it.
    const [existingNotice] = await db.execute(
      "SELECT id, category FROM notices WHERE id = ? LIMIT 1",
      [noticeId]
    );

    if (existingNotice.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notice not found.",
      });
    }

    const cleanDescription =
      typeof description === "string"
        ? description.trim() || null
        : null;

    const cleanCategory =
      category !== undefined
        ? (typeof category === "string" && category.trim() ? category.trim() : "General")
        : existingNotice[0].category || "General";

    await db.execute(
      `UPDATE notices
       SET title = ?, description = ?, category = ?, notice_date = ?
       WHERE id = ?`,
      [
        title.trim(),
        cleanDescription,
        cleanCategory,
        notice_date || null,
        noticeId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Notice updated successfully.",
    });
  } catch (error) {
    console.error("Update notice error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update notice.",
    });
  }
});

// =========================================================
// DELETE NOTICE - ADMIN ONLY
// =========================================================

app.delete("/api/notices/:id", requireAdmin, async (req, res) => {
  try {
    const noticeId = Number(req.params.id);

    if (!Number.isInteger(noticeId) || noticeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice ID.",
      });
    }

    const [result] = await db.execute(
      "DELETE FROM notices WHERE id = ?",
      [noticeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notice not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notice deleted successfully.",
    });
  } catch (error) {
    console.error("Delete notice error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notice.",
    });
  }
});

// ==========================================
// DEPARTMENTS MANAGEMENT API
// ==========================================

// GET: Fetch all departments
app.get("/api/departments", async (req, res) => {
  try {
    const [departments] = await db.query(
      "SELECT * FROM departments ORDER BY id ASC"
    );

    res.json({
      success: true,
      departments
    });

  } catch (error) {
    console.error("Fetch departments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch departments."
    });
  }
});


// POST: Add a new department
app.post("/api/departments", requireAdmin, async (req, res) => {
  try {
    const {
      department_name,
      department_code,
      description,
      hod_name,
      intake,
      image,
      image_public_id,
      is_active
    } = req.body;

    if (!department_name || !department_code) {
      return res.status(400).json({
        success: false,
        message: "Department name and code are required."
      });
    }

    const [result] = await db.query(
      `INSERT INTO departments
            (department_name, department_code, description,
             hod_name, intake, image, image_public_id, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        department_name.trim(),
        department_code.trim().toUpperCase(),
        description || null,
        hod_name || null,
        Number(intake) || 0,
        image || null,
        image_public_id || null,
        is_active === undefined ? 1 : (is_active ? 1 : 0)
      ]
    );

    res.status(201).json({
      success: true,
      message: "Department added successfully.",
      departmentId: result.insertId
    });

  } catch (error) {
    console.error("Add department error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add department. Check whether the department code already exists."
    });
  }
});


// PUT: Update an existing department
app.put("/api/departments/:id", requireAdmin, async (req, res) => {
  try {
    const departmentId = Number(req.params.id);

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID."
      });
    }

    const {
      department_name,
      department_code,
      description,
      hod_name,
      intake,
      image,
      image_public_id,
      is_active
    } = req.body;

    if (!department_name || !department_code) {
      return res.status(400).json({
        success: false,
        message: "Department name and code are required."
      });
    }

    const [result] = await db.query(
      `UPDATE departments
             SET department_name = ?,
                 department_code = ?,
                 description = ?,
                 hod_name = ?,
                 intake = ?,
                 image = ?,
                 image_public_id = ?,
                 is_active = ?
             WHERE id = ?`,
      [
        department_name.trim(),
        department_code.trim().toUpperCase(),
        description || null,
        hod_name || null,
        Number(intake) || 0,
        image || null,
        image_public_id || null,
        is_active ? 1 : 0,
        departmentId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Department not found."
      });
    }

    res.json({
      success: true,
      message: "Department updated successfully."
    });

  } catch (error) {
    console.error("Update department error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update department."
    });
  }
});


// DELETE: Remove a department
app.delete("/api/departments/:id", requireAdmin, async (req, res) => {
  try {
    const departmentId = Number(req.params.id);

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID."
      });
    }

    const [result] = await db.query(
      "DELETE FROM departments WHERE id = ?",
      [departmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Department not found."
      });
    }

    res.json({
      success: true,
      message: "Department deleted successfully."
    });

  } catch (error) {
    console.error("Delete department error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete department."
    });
  }
});

// =========================================================
// EVENTS
// =========================================================

app.get("/api/events", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        title,
        description,
        CAST(event_date AS CHAR) AS event_date,
        category,
        image,
        image_public_id,
        is_active,
        created_at
      FROM events
      WHERE is_active = TRUE
      ORDER BY event_date ASC, id ASC
    `);

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get events error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch events.",
    });
  }
});

// =========================================================
// ADMIN EVENTS
// =========================================================

app.get("/api/admin/events", requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        title,
        description,
        CAST(event_date AS CHAR) AS event_date,
        category,
        image,
        image_public_id,
        is_active,
        created_at
      FROM events
      ORDER BY event_date ASC, id ASC
    `);

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get admin events error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch events.",
    });
  }
});

app.post("/api/admin/events", requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      event_date,
      category,
      image,
      image_public_id,
      is_active = true,
    } = req.body || {};

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Event title is required.",
      });
    }

    if (!isValidDateOnly(event_date)) {
      return res.status(400).json({
        success: false,
        message: "A valid event date is required.",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO events
        (title, description, event_date, category, image, image_public_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        typeof description === "string" ? description.trim() || null : null,
        event_date,
        typeof category === "string" ? category.trim() || null : null,
        typeof image === "string" ? image.trim() || null : null,
        typeof image_public_id === "string" ? image_public_id.trim() || null : null,
        is_active ? 1 : 0,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Event added successfully.",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Add admin event error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add event.",
    });
  }
});

app.put("/api/admin/events/:id", requireAdmin, async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const {
      title,
      description,
      event_date,
      category,
      image,
      image_public_id,
      is_active = true,
    } = req.body || {};

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Event title is required.",
      });
    }

    if (!isValidDateOnly(event_date)) {
      return res.status(400).json({
        success: false,
        message: "A valid event date is required.",
      });
    }

    const [existingEvents] = await db.execute(
      "SELECT id FROM events WHERE id = ? LIMIT 1",
      [eventId]
    );

    if (existingEvents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const [result] = await db.execute(
      `UPDATE events
       SET title = ?,
           description = ?,
           event_date = ?,
           category = ?,
           image = ?,
           image_public_id = ?,
           is_active = ?
       WHERE id = ?`,
      [
        title.trim(),
        typeof description === "string" ? description.trim() || null : null,
        event_date,
        typeof category === "string" ? category.trim() || null : null,
        typeof image === "string" ? image.trim() || null : null,
        typeof image_public_id === "string" ? image_public_id.trim() || null : null,
        is_active ? 1 : 0,
        eventId,
      ]
    );

    return res.json({
      success: true,
      message: "Event updated successfully.",
    });
  } catch (error) {
    console.error("Update admin event error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update event.",
    });
  }
});

app.delete("/api/admin/events/:id", requireAdmin, async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const [result] = await db.execute(
      "DELETE FROM events WHERE id = ?",
      [eventId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    return res.json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("Delete admin event error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete event.",
    });
  }
});

// =========================================================
// MANAGED WEBSITE CONTENT
// =========================================================

app.get("/api/placements", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, branch, student_name, company_name, package_offered
       FROM placements
       ORDER BY created_at DESC, id DESC`
    );

    return res.json({
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        kind: "student",
        branch: row.branch,
        name: row.student_name,
        company: row.company_name,
        package: row.package_offered,
      })),
    });
  } catch (error) {
    console.error("Get placements error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch placement records.",
    });
  }
});

const managedContentTypes = new Set([
  "faculty",
  "placements",
  "gallery",
  "contact",
]);

function isManagedContentType(value) {
  return managedContentTypes.has(value);
}

app.get("/api/content/:type", async (req, res) => {
  const { type } = req.params;

  if (!isManagedContentType(type)) {
    return res.status(404).json({
      success: false,
      message: "Managed content section not found.",
    });
  }

  try {
    const [rows] = await db.execute(
      `SELECT id, payload, is_active, sort_order
       FROM site_content
       WHERE content_type = ? AND is_active = 1
       ORDER BY sort_order ASC, id ASC`,
      [type]
    );

    return res.json({
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        ...(typeof row.payload === "string"
          ? JSON.parse(row.payload)
          : row.payload),
        is_active: Boolean(row.is_active),
        sort_order: row.sort_order,
      })),
    });
  } catch (error) {
    console.error(`Get ${type} content error:`, error.message);

    return res.status(500).json({
      success: false,
      message: `Failed to fetch ${type} content. Apply database migration 003_site_content.sql if this section has not been set up.`,
    });
  }
});

app.get("/api/admin/content/:type", requireAdmin, async (req, res) => {
  const { type } = req.params;

  if (!isManagedContentType(type)) {
    return res.status(404).json({
      success: false,
      message: "Managed content section not found.",
    });
  }

  try {
    const [rows] = await db.execute(
      `SELECT id, payload, is_active, sort_order
       FROM site_content
       WHERE content_type = ?
       ORDER BY sort_order ASC, id ASC`,
      [type]
    );

    return res.json({
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        ...(typeof row.payload === "string"
          ? JSON.parse(row.payload)
          : row.payload),
        is_active: Boolean(row.is_active),
        sort_order: row.sort_order,
      })),
    });
  } catch (error) {
    console.error(`Get admin ${type} content error:`, error.message);

    return res.status(500).json({
      success: false,
      message: `Failed to fetch ${type} content. Apply database migration 003_site_content.sql if this section has not been set up.`,
    });
  }
});

app.post("/api/admin/content/:type", requireAdmin, async (req, res) => {
  const { type } = req.params;
  const { payload, is_active = true, sort_order = 0 } = req.body || {};

  if (!isManagedContentType(type)) {
    return res.status(404).json({
      success: false,
      message: "Managed content section not found.",
    });
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload) ||
    Buffer.byteLength(JSON.stringify(payload), "utf8") > 16000
  ) {
    return res.status(400).json({
      success: false,
      message: "Content must be a JSON object no larger than 16 KB.",
    });
  }

  if (typeof is_active !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Publish status must be true or false.",
    });
  }

  const parsedOrder = Number(sort_order);
  if (
    !Number.isInteger(parsedOrder) ||
    parsedOrder < -100000 ||
    parsedOrder > 100000
  ) {
    return res.status(400).json({
      success: false,
      message: "Sort order must be a whole number between -100000 and 100000.",
    });
  }

  try {
    if (type === "contact") {
      const [rows] = await db.execute(
        "SELECT id FROM site_content WHERE content_type = ? LIMIT 1",
        [type]
      );

      if (rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Contact details already exist. Edit the existing entry instead.",
        });
      }
    }

    const [result] = await db.execute(
      `INSERT INTO site_content (content_type, payload, is_active, sort_order)
       VALUES (?, ?, ?, ?)`,
      [type, JSON.stringify(payload), is_active ? 1 : 0, parsedOrder]
    );

    return res.status(201).json({
      success: true,
      message: "Content created successfully.",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error(`Create ${type} content error:`, error.message);

    return res.status(500).json({
      success: false,
      message: `Failed to create ${type} content.`,
    });
  }
});

app.put("/api/admin/content/:type/:id", requireAdmin, async (req, res) => {
  const { type } = req.params;
  const contentId = Number(req.params.id);
  const { payload, is_active = true, sort_order = 0 } = req.body || {};

  if (!isManagedContentType(type)) {
    return res.status(404).json({
      success: false,
      message: "Managed content section not found.",
    });
  }

  if (!Number.isInteger(contentId) || contentId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid content ID.",
    });
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload) ||
    Buffer.byteLength(JSON.stringify(payload), "utf8") > 16000
  ) {
    return res.status(400).json({
      success: false,
      message: "Content must be a JSON object no larger than 16 KB.",
    });
  }

  if (typeof is_active !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Publish status must be true or false.",
    });
  }

  const parsedOrder = Number(sort_order);
  if (
    !Number.isInteger(parsedOrder) ||
    parsedOrder < -100000 ||
    parsedOrder > 100000
  ) {
    return res.status(400).json({
      success: false,
      message: "Sort order must be a whole number between -100000 and 100000.",
    });
  }

  try {
    const [existingRows] = await db.execute(
      "SELECT id FROM site_content WHERE id = ? AND content_type = ? LIMIT 1",
      [contentId, type]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Content item not found.",
      });
    }

    const [result] = await db.execute(
      `UPDATE site_content
       SET payload = ?, is_active = ?, sort_order = ?
       WHERE id = ? AND content_type = ?`,
      [JSON.stringify(payload), is_active ? 1 : 0, parsedOrder, contentId, type]
    );

    return res.json({
      success: true,
      message: "Content updated successfully.",
    });
  } catch (error) {
    console.error(`Update ${type} content error:`, error.message);

    return res.status(500).json({
      success: false,
      message: `Failed to update ${type} content.`,
    });
  }
});

app.delete("/api/admin/content/:type/:id", requireAdmin, async (req, res) => {
  const { type } = req.params;
  const contentId = Number(req.params.id);

  if (!isManagedContentType(type)) {
    return res.status(404).json({
      success: false,
      message: "Managed content section not found.",
    });
  }

  if (!Number.isInteger(contentId) || contentId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid content ID.",
    });
  }

  try {
    const [result] = await db.execute(
      "DELETE FROM site_content WHERE id = ? AND content_type = ?",
      [contentId, type]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Content item not found.",
      });
    }

    return res.json({
      success: true,
      message: "Content deleted successfully.",
    });
  } catch (error) {
    console.error(`Delete ${type} content error:`, error.message);

    return res.status(500).json({
      success: false,
      message: `Failed to delete ${type} content.`,
    });
  }
});

// =========================================================
// SBTET ATTENDANCE
// =========================================================

app.get("/api/attendance", async (req, res) => {
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

    const url =
      `${SBTET_ATTENDANCE_URL}?Pin=${encodeURIComponent(pin)}`;

    let result;
    if (process.env.RENDER) {
      try {
        const vResult = await fetchViaVercelProxy(`/api/attendance?pin=${encodeURIComponent(pin)}`);
        return res.status(vResult.status).json(vResult.data);
      } catch (proxyErr) {
        console.warn("Vercel proxy failed, trying direct SBTET...", proxyErr.message);
      }
    }

    try {
      result = await fetchSBTET(url);
    } catch (directError) {
      console.warn("Direct SBTET fetch failed (possible geo-block), falling back to Vercel India proxy...", directError.message);
      try {
        const vResult = await fetchViaVercelProxy(`/api/attendance?pin=${encodeURIComponent(pin)}`);
        return res.status(vResult.status).json(vResult.data);
      } catch (fallbackError) {
        console.error("Attendance proxy fallback failed:", fallbackError.message);
        throw directError;
      }
    }

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: "SBTET attendance request failed.",
      });
    }

    const report = parseSBTETResponse(result.data);

    if (typeof report === "string" && report.includes("Subquery")) {
      return res.status(404).json({
        success: false,
        message: "Attendance for this student PIN (C24 scheme) has not yet been published on the SBTET portal.",
      });
    }

    const summary = Array.isArray(report?.Table) ? report.Table[0] : null;
    const dailyAttendance = Array.isArray(report?.Table1)
      ? report.Table1
      : null;

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
        workingDays:
          Number(summary.WorkingDays ?? summary.ActualWorkingDays) || 0,
        percentage:
          Number(summary.Percentage ?? summary.TotalPercentage) || 0,
        totalPercentage: Number(summary.TotalPercentage) || 0,
        examsNDP: Number(summary.ExamsNDP) || 0,
        examsPer: Number(summary.ExamsPer) || 0,
        examsWorkingDays: Number(summary.ExamsWorkingDays) || 0,
        dailyAttendance,
      },
    });
  } catch (error) {
    console.error("Attendance error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message && error.message.includes("timed out")
        ? "The SBTET server took too long to respond. Please try again."
        : "Failed to fetch attendance from SBTET.",
      detail: error.message,
    });
  }
});

// =========================================================
// SBTET RESULTS
// =========================================================

app.get("/api/consolidated-result", async (req, res) => {
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

    if (process.env.RENDER) {
      try {
        const vResult = await fetchViaVercelProxy(
          `/api/consolidated-result?pin=${encodeURIComponent(cleanPin)}&scheme=${encodeURIComponent(cleanScheme)}`
        );
        return res.status(vResult.status).json(vResult.data);
      } catch (proxyErr) {
        console.warn("Vercel proxy failed for consolidated-result, trying direct SBTET...", proxyErr.message);
      }
    }

    let result;
    try {
      result = await fetchSBTET(url);
    } catch (directError) {
      console.warn("Direct SBTET consolidated result fetch failed, falling back to Vercel India proxy...", directError.message);
      try {
        const vResult = await fetchViaVercelProxy(
          `/api/consolidated-result?pin=${encodeURIComponent(cleanPin)}&scheme=${encodeURIComponent(cleanScheme)}`
        );
        return res.status(vResult.status).json(vResult.data);
      } catch (fbErr) {
        console.error("Consolidated result proxy fallback failed:", fbErr.message);
        throw directError;
      }
    }

    if (!result.ok) {
      return res.status(result.status).json({
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

    if (
      responseCode === "400" ||
      subjects.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No consolidated result was found for this PIN and scheme.",
      });
    }

    function getSemNumber(item) {
      if (!item || typeof item !== "object") return 0;
      if (item.SemId !== undefined && item.SemId !== null && !isNaN(Number(item.SemId))) {
        return Number(item.SemId);
      }
      const raw = String(item.Semester || item.Sem || item.SemYear || item.SemesterName || "");
      const match = raw.match(/([1-8])/);
      return match ? Number(match[1]) : 0;
    }

    const sortedSemesters = [...semesterResults].sort(
      (a, b) => getSemNumber(a) - getSemNumber(b)
    );

    const sortedSubjects = [...subjects].sort((a, b) => {
      const semDiff = getSemNumber(a) - getSemNumber(b);
      if (semDiff !== 0) return semDiff;
      const orderA = Number(a.SubjectOrder ?? a.SequenceId ?? 0);
      const orderB = Number(b.SubjectOrder ?? b.SequenceId ?? 0);
      if (orderA !== orderB) return orderA - orderB;
      const codeA = String(a.Subject_Code || a.SubjectCode || a.Course_Code || a.SubCode || "");
      const codeB = String(b.Subject_Code || b.SubjectCode || b.Course_Code || b.SubCode || "");
      return codeA.localeCompare(codeB);
    });

    return res.json({
      success: true,
      source: "SBTET",
      data: {
        student,
        summary: summaryTable[0] || {},
        subjects: sortedSubjects,
        semesters: sortedSemesters,
      },
    });
  } catch (error) {
    console.error("Consolidated result error:", error.message);

    return res.status(500).json({
      success: false,
      message:
        error.name === "AbortError"
          ? "SBTET consolidated result request timed out."
          : "Failed to fetch consolidated result from SBTET.",
    });
  }
});

app.get("/api/result", async (req, res) => {
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
      C21: process.env.SBTET_C21_SCHEME_ID || "10",
      C18: process.env.SBTET_C18_SCHEME_ID || "8",
      C16S: process.env.SBTET_C16S_SCHEME_ID || "7",
      C16: process.env.SBTET_C16_SCHEME_ID || "6",
      C14: process.env.SBTET_C14_SCHEME_ID || "5",
      C09: process.env.SBTET_C09_SCHEME_ID || "4",
      C08: process.env.SBTET_C08_SCHEME_ID || "3",
      C05: process.env.SBTET_C05_SCHEME_ID || "2",
      ER2020: process.env.SBTET_ER2020_SCHEME_ID || "9",
      ER91: process.env.SBTET_ER91_SCHEME_ID || "1",
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

      const proxyPath = `/api/result?pin=${encodeURIComponent(cleanPin)}&scheme=${encodeURIComponent(cleanScheme)}&semester=${encodeURIComponent(cleanSemester)}&examType=${encodeURIComponent(cleanExamType)}`;

      if (process.env.RENDER) {
        try {
          const vResult = await fetchViaVercelProxy(proxyPath);
          return res.status(vResult.status).json(vResult.data);
        } catch (proxyErr) {
          console.warn("Vercel proxy failed for mid result, trying direct SBTET...", proxyErr.message);
        }
      }

      let result;
      try {
        result = await fetchSBTET(url);
      } catch (directError) {
        console.warn("Direct SBTET mid result fetch failed, falling back to Vercel India proxy...", directError.message);
        try {
          const vResult = await fetchViaVercelProxy(proxyPath);
          return res.status(vResult.status).json(vResult.data);
        } catch (fbErr) {
          console.error("Mid result proxy fallback failed:", fbErr.message);
        }
        throw directError;
      }

      if (!result.ok) {
        return res.status(result.status).json({
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
      const proxyPath = `/api/result?pin=${encodeURIComponent(cleanPin)}&scheme=${encodeURIComponent(cleanScheme)}&semester=${encodeURIComponent(cleanSemester)}&examType=${encodeURIComponent(cleanExamType)}`;

      if (process.env.RENDER) {
        try {
          const vResult = await fetchViaVercelProxy(proxyPath);
          return res.status(vResult.status).json(vResult.data);
        } catch (proxyErr) {
          console.warn("Vercel proxy failed for semester result, trying direct SBTET...", proxyErr.message);
        }
      }
      const examMonthYearIds = String(
        process.env.SBTET_EXAM_MONTH_YEAR_IDS || ""
      )
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      if (examMonthYearIds.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "SBTET exam month/year IDs are not configured.",
        });
      }

      let foundReport = null;
      let lastStatus = null;
      const CHUNK_SIZE = 5;
      const cleanSemNumber = String(semYearId);
      const romanMap = { I: "1", II: "2", III: "3", IV: "4", V: "5", VI: "6" };

      for (let i = 0; i < examMonthYearIds.length && !foundReport; i += CHUNK_SIZE) {
        const chunk = examMonthYearIds.slice(i, i + CHUNK_SIZE);
        const promises = chunk.map((id) => {
          const url =
            `${SBTET_SEM_RESULT_URL}` +
            `?ExamMonthYearId=${encodeURIComponent(id)}` +
            `&ExamTypeId=5` +
            `&Pin=${encodeURIComponent(cleanPin)}` +
            `&SchemeId=${encodeURIComponent(schemeId)}` +
            `&SemYearId=${semYearId}` +
            `&StudentTypeId=${Number(process.env.SBTET_STUDENT_TYPE_ID) || 1}`;

          return fetchSBTET(url).catch((err) => ({ ok: false, status: 500, error: err }));
        });

        const responses = await Promise.all(promises);

        for (const result of responses) {
          if (!result || !result.ok) {
            if (result?.status) lastStatus = result.status;
            continue;
          }

          const reports = parseSBTETResponse(result.data);
          const reportList = Array.isArray(reports) ? reports : [reports];
          const matched = reportList.find((item) => {
            if (!item || typeof item !== "object") return false;
            const subjects = Array.isArray(item.studentWiseReport) ? item.studentWiseReport : [];
            const studentInfo = Array.isArray(item.studentInfo) ? item.studentInfo[0] : null;
            const rawSem = String(studentInfo?.Sem || studentInfo?.Semester || "").trim().toUpperCase();
            const semDigits = rawSem.match(/\d+/)?.[0];
            const normRoman = romanMap[rawSem.replace(/SEM|SEMESTER/g, "").trim()];
            const semMatches = !rawSem || rawSem === cleanSemester || semDigits === cleanSemNumber || normRoman === cleanSemNumber;
            return subjects.length > 0 && semMatches;
          });

          if (matched) {
            foundReport = matched;
            break;
          }
        }
      }

      if (!foundReport) {
        if (lastStatus && lastStatus >= 500) {
          try {
            const vResult = await fetchViaVercelProxy(proxyPath);
            return res.status(vResult.status).json(vResult.data);
          } catch (fbErr) {
            console.error("Semester result proxy fallback failed:", fbErr.message);
          }
        }

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
        return total + (Number.isFinite(marks) ? marks : 0);
      }, 0);

      return res.json({
        success: true,
        source: "SBTET",
        data: {
          student: {
            pin: student?.Pin || student?.PIN || cleanPin,
            name: student?.StudentName || student?.Name || null,
            branchName: student?.BranchName || student?.Branch || null,
            branchCode: student?.BranchCode || null,
            semester: student?.Sem || student?.Semester || cleanSemester,
            collegeCode: student?.CollegeCode || null,
            collegeName: student?.CollegeName || null,
            examination: student?.ExamType || "Semester",
            examMonthYear: student?.ExamMonthYear || null,
          },
          subjects,
          studentSubjectTotal: subjectTotals,
          studentSGPACGPAInfo: gradeSummary,
          summary: {
            totalMarks,
            totalCredits: subjectTotals[0]?.TotalCredits,
            totalCreditsEarned: subjectTotals[0]?.TotalCreditsEarned,
            result: subjectTotals[0]?.Result,
            sgpa: gradeSummary[0]?.SGPA,
            cgpa: gradeSummary[0]?.CGPA,
            academicYear: subjectTotals[0]?.AcadamicYear,
          },
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: "Use Mid-1, Mid-2 or Semester as the exam type.",
    });
  } catch (error) {
    console.error("Result error:", error.message);

    return res.status(500).json({
      success: false,
      message:
        error.name === "AbortError"
          ? "SBTET result request timed out."
          : "Failed to fetch result from SBTET.",
    });
  }
});

// =========================================================
// GOOGLE OAUTH HELPERS
// =========================================================

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function randomString(length = 32) {
  return base64url(crypto.randomBytes(length));
}

function createState() {
  return randomString(32);
}

// =========================================================
// GOOGLE LOGIN
// =========================================================

function getGoogleRedirectUri(returnOrigin = "") {
  return process.env.GOOGLE_REDIRECT_URI;
}

app.get("/api/auth/google", (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).send(
        "Google OAuth configuration is missing."
      );
    }

    const returnTo = req.query.return_to || req.headers.referer || "";
    let returnOrigin = "";
    if (returnTo) {
      try {
        const parsed = new URL(returnTo);
        returnOrigin = parsed.origin;
      } catch (_) { }
    }

    const redirectUri = getGoogleRedirectUri(returnOrigin);
    if (!redirectUri) {
      return res.status(500).send(
        "Google OAuth configuration is missing."
      );
    }

    const intent = (req.query.intent || "alumni").trim();
    const nonce = createState();
    // Encode state, intent, and returnOrigin as URL-safe base64
    const statePayload = Buffer.from(
      JSON.stringify({ nonce, intent, returnOrigin })
    ).toString("base64url");

    req.session.googleOAuthNonce = nonce;
    req.session.googleOAuthIntent = intent;
    req.session.googleOAuthState = statePayload;
    if (returnOrigin) {
      req.session.googleOAuthReturnOrigin = returnOrigin;
    }

    req.session.save((error) => {
      if (error) {
        console.error("Google OAuth session error:", error.message);

        return res.status(500).send(
          "Unable to start Google authentication."
        );
      }

      const googleUrl =
        "https://accounts.google.com/o/oauth2/v2/auth" +
        `?client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent("openid email profile")}` +
        `&state=${encodeURIComponent(statePayload)}`;

      return res.redirect(googleUrl);
    });
  } catch (error) {
    console.error("Google login error:", error.message);

    return res.status(500).send(
      "Google authentication could not be started."
    );
  }
});

// =========================================================
// GOOGLE CALLBACK
// =========================================================

app.get("/api/auth/google/callback", async (req, res) => {
  try {
    const { code, error, state } = req.query;

    if (error) {
      return res.status(400).send(
        "Google authentication was cancelled or failed."
      );
    }

    let intent = "alumni";
    let nonce = null;
    let returnOrigin = "";

    if (typeof state === "string" && state) {
      try {
        const decoded = JSON.parse(
          Buffer.from(state, "base64url").toString("utf8")
        );
        intent = decoded.intent || "alumni";
        nonce = decoded.nonce || null;
        returnOrigin = decoded.returnOrigin || "";
      } catch (_) {
        if (state.includes("__")) {
          const parts = state.split("__");
          nonce = parts[0];
          intent = parts[1] || "alumni";
        } else {
          nonce = state;
        }
      }
    }

    if (!returnOrigin && req.session.googleOAuthReturnOrigin) {
      returnOrigin = req.session.googleOAuthReturnOrigin;
    }

    delete req.session.googleOAuthState;
    delete req.session.googleOAuthNonce;
    delete req.session.googleOAuthIntent;
    delete req.session.googleOAuthReturnOrigin;

    if (typeof code !== "string" || !code) {
      return res.status(400).send(
        "Google authorization code is missing."
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = getGoogleRedirectUri(returnOrigin);

    if (!clientId || !clientSecret || !redirectUri) {
      const missingVariables = [
        !clientId ? "GOOGLE_CLIENT_ID" : "",
        !clientSecret ? "GOOGLE_CLIENT_SECRET" : "",
        !redirectUri ? "GOOGLE_REDIRECT_URI" : "",
      ].filter(Boolean);

      return res.status(500).send(
        `Google OAuth configuration is missing: ${missingVariables.join(", ")}`
      );
    }

    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Google token exchange failed:", tokenData);

      return res.status(400).send(
        "Could not complete Google authentication."
      );
    }

    const userResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const userData = await userResponse.json();

    if (!userResponse.ok || !userData.email) {
      return res.status(400).send(
        "Could not verify Google user information."
      );
    }

    let frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    if (returnOrigin && isOriginAllowed(returnOrigin)) {
      frontendUrl = returnOrigin.replace(/\/+$/, "");
    }

    const cleanEmail = userData.email.toLowerCase().trim();

    // Check if this is an Admin authentication or registration flow
    if (intent === "admin_register" || intent === "admin_login") {
      const [admins] = await db.execute(
        `SELECT
          id,
          name,
          username,
          email,
          role,
          status,
          is_active,
          department,
          designation,
          avatar_url,
          rejection_reason
         FROM admins
         WHERE LOWER(email) = ?
         LIMIT 1`,
        [cleanEmail]
      );

      if (admins.length > 0) {
        const admin = admins[0];

        if (admin.status === "pending") {
          return res.redirect(
            `${frontendUrl}/admin/register?status=pending&email=${encodeURIComponent(
              cleanEmail
            )}&name=${encodeURIComponent(admin.name)}`
          );
        }

        if (admin.status === "rejected") {
          return res.redirect(
            `${frontendUrl}/admin/register?status=rejected&email=${encodeURIComponent(
              cleanEmail
            )}&reason=${encodeURIComponent(
              admin.rejection_reason || "Registration request declined by the Main Administrator."
            )}`
          );
        }

        if (admin.status === "suspended" || Number(admin.is_active) !== 1) {
          return res.redirect(
            `${frontendUrl}/admin/login?error=${encodeURIComponent(
              "This administrator account has been deactivated or suspended."
            )}`
          );
        }

        if (
          (admin.status === "approved" || !admin.status) &&
          Number(admin.is_active) === 1
        ) {
          const avatar = userData.picture || admin.avatar_url;
          await db.execute(
            `UPDATE admins
             SET avatar_url = COALESCE(?, avatar_url),
                 last_login_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [avatar, admin.id]
          );

          return req.session.regenerate((err) => {
            if (err) {
              console.error("Session regeneration failed:", err);
              return res.redirect(
                `${frontendUrl}/admin/login?error=${encodeURIComponent(
                  "Session creation failed."
                )}`
              );
            }

            req.session.admin = {
              id: admin.id,
              name: admin.name,
              username: admin.username,
              email: admin.email,
              role: admin.role,
              status: admin.status,
              department: admin.department,
              designation: admin.designation,
              avatar_url: avatar,
              isSuperAdmin: admin.role === "superadmin",
            };

            req.session.save((saveErr) => {
              if (saveErr) {
                console.error("Session save failed:", saveErr);
                return res.redirect(
                  `${frontendUrl}/admin/login?error=${encodeURIComponent(
                    "Failed to save session."
                  )}`
                );
              }

              return res.redirect(
                `${frontendUrl}/admin/dashboard?token=${encodeURIComponent(
                  req.sessionID
                )}`
              );
            });
          });
        }
      }

      // Admin does NOT exist in database
      if (intent === "admin_login") {
        return res.redirect(
          `${frontendUrl}/admin/login?error=${encodeURIComponent(
            `No administrator account found with ${cleanEmail}. Please submit an admin registration request first.`
          )}`
        );
      }

      // intent === "admin_register"
      return res.redirect(
        `${frontendUrl}/admin/register?oauth=google&email=${encodeURIComponent(
          cleanEmail
        )}&name=${encodeURIComponent(userData.name || "")}&avatar=${encodeURIComponent(
          userData.picture || ""
        )}&sub=${encodeURIComponent(userData.sub || "")}`
      );
    }

    // Default: Alumni registration redirect
    const redirectUrl =
      `${frontendUrl}/alumni/register/form` +
      `?authMethod=google` +
      `&name=${encodeURIComponent(userData.name || "")}` +
      `&email=${encodeURIComponent(cleanEmail)}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google callback error:", error.message);

    return res.status(500).send(
      "Google authentication failed."
    );
  }
});

// =========================================================
// SERVER DIAGNOSTIC
// =========================================================

app.get("/api/admin-route-test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin routes are available.",
    serverFile: __filename,
    port: PORT,
  });
});

// =========================================================
// 404 ROUTE
// =========================================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
});

// =========================================================
// START SERVER
// =========================================================

if (require.main === module) {
  db.testConnection()
    .then(() => {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Server startup aborted because TiDB is unavailable.");
      console.error("Error code:", error.code || "UNKNOWN");
      db.end().catch((closeError) => {
        console.error("Failed to close the database pool:", closeError.message);
      });
      process.exitCode = 1;
    });
}

module.exports = app;