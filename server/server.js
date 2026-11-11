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

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing from server/.env");
}

// =========================================================
// MIDDLEWARE
// =========================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

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
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000,
    },
  })
);

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

  if (req.session.admin.role !== "admin") {
    return res.status(403).json({
      success: false,
      authenticated: false,
      message: "Administrator access is required.",
    });
  }

  return next();
}

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

function sbtetHeaders() {
  return {
    Accept: "application/json, text/plain, */*",
    "User-Agent": "Mozilla/5.0",
    Referer: "https://www.sbtet.telangana.gov.in/",
  };
}

async function fetchSBTET(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...sbtetHeaders(),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
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
    const { email, password } = req.body || {};

    const cleanEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    if (
      !cleanEmail ||
      typeof password !== "string" ||
      password.length === 0 ||
      password.length > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email and password.",
      });
    }

    const [admins] = await db.execute(
      `SELECT
        id,
        name,
        email,
        password_hash,
        role,
        is_active
       FROM admins
       WHERE email = ?
       LIMIT 1`,
      [cleanEmail]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const admin = admins[0];

    if (
      Number(admin.is_active) !== 1 ||
      admin.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This administrator account is inactive or unauthorized.",
      });
    }

    if (
      typeof admin.password_hash !== "string" ||
      !admin.password_hash
    ) {
      return res.status(500).json({
        success: false,
        message: "The administrator password is not configured correctly.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Regenerate the session after successful authentication.
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
        email: admin.email,
        role: admin.role,
      };

      // Save the session before sending the response.
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
// CHECK ADMIN SESSION
// =========================================================

app.get("/api/admin/me", (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      message: "Please log in as an administrator.",
    });
  }

  if (req.session.admin.role !== "admin") {
    return res.status(403).json({
      success: false,
      authenticated: false,
      message: "Administrator access is required.",
    });
  }

  return res.status(200).json({
    success: true,
    authenticated: true,
    admin: req.session.admin,
  });
});

// =========================================================
// ADMIN LOGOUT
// =========================================================

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Admin logout error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to log out.",
      });
    }

    res.clearCookie("college_admin_sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.json({
      success: true,
      message: "Logged out successfully.",
    });
  });
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
// NOTICES
// =========================================================

app.get("/api/notices", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, title, description, notice_date, created_at
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
    const { title, description, notice_date } = req.body || {};

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notice title is required.",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO notices (title, description, notice_date)
       VALUES (?, ?, ?)`,
      [
        title.trim(),
        typeof description === "string"
          ? description.trim() || null
          : null,
        notice_date || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Notice added successfully.",
      data: {
        id: result.insertId,
        title: title.trim(),
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
    const { title, description, notice_date } = req.body || {};

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
      "SELECT id FROM notices WHERE id = ? LIMIT 1",
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

    await db.execute(
      `UPDATE notices
       SET title = ?, description = ?, notice_date = ?
       WHERE id = ?`,
      [
        title.trim(),
        cleanDescription,
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
            "SELECT * FROM departments ORDER BY id DESC"
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
             hod_name, intake, image, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                department_name.trim(),
                department_code.trim().toUpperCase(),
                description || null,
                hod_name || null,
                Number(intake) || 0,
                image || null,
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
                 is_active = ?
             WHERE id = ?`,
            [
                department_name.trim(),
                department_code.trim().toUpperCase(),
                description || null,
                hod_name || null,
                Number(intake) || 0,
                image || null,
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
        (title, description, event_date, category, image, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        typeof description === "string" ? description.trim() || null : null,
        event_date,
        typeof category === "string" ? category.trim() || null : null,
        typeof image === "string" ? image.trim() || null : null,
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
           is_active = ?
       WHERE id = ?`,
      [
        title.trim(),
        typeof description === "string" ? description.trim() || null : null,
        event_date,
        typeof category === "string" ? category.trim() || null : null,
        typeof image === "string" ? image.trim() || null : null,
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

    const result = await fetchSBTET(url);

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: "SBTET attendance request failed.",
      });
    }

    const report = parseSBTETResponse(result.data);
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
      message: "Failed to fetch attendance.",
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
    const result = await fetchSBTET(url);

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

app.get("/api/auth/google", (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return res.status(500).send(
        "Google OAuth configuration is missing."
      );
    }

    const state = createState();
    req.session.googleOAuthState = state;

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
        `&state=${encodeURIComponent(state)}`;

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

    if (
      typeof state !== "string" ||
      !req.session.googleOAuthState ||
      state !== req.session.googleOAuthState
    ) {
      return res.status(400).send(
        "Invalid Google authentication state. Please try again."
      );
    }

    delete req.session.googleOAuthState;

    if (typeof code !== "string" || !code) {
      return res.status(400).send(
        "Google authorization code is missing."
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(500).send(
        "Google OAuth configuration is missing."
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
      console.error("Google token exchange failed.");

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

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const redirectUrl =
      `${frontendUrl}/alumni/register/form` +
      `?authMethod=google` +
      `&name=${encodeURIComponent(userData.name || "")}` +
      `&email=${encodeURIComponent(userData.email)}`;

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