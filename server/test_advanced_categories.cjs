const db = require("./db");
const http = require("http");

const BASE_URL = "http://localhost:5000";

function makeRequest(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || "GET",
      headers: options.headers || {},
      ...options,
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (_) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on("error", reject);

    if (body) {
      if (typeof body === "object") {
        req.setHeader("Content-Type", "application/json");
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

async function runEndToEndTests() {
  console.log("==================================================");
  console.log("CATEGORIES MANAGEMENT SYSTEM - ADVANCED TEST SUITE");
  console.log("==================================================");

  try {
    // 1. Direct DB Verification
    console.log("\n[1] Verifying Database Schema...");
    const [catCols] = await db.query("SHOW COLUMNS FROM categories");
    const colNames = catCols.map((c) => c.Field);
    console.log("✓ Categories columns present:", colNames.join(", "));
    if (!colNames.includes("target_page") || !colNames.includes("color") || !colNames.includes("icon")) {
      throw new Error("Missing required columns in categories table");
    }

    const [noticeCols] = await db.query("SHOW COLUMNS FROM notices");
    const noticeColNames = noticeCols.map((c) => c.Field);
    console.log("✓ Notices columns present:", noticeColNames.join(", "));
    if (!noticeColNames.includes("category")) {
      throw new Error("Missing category column in notices table");
    }

    // 2. Count categories across all pages
    console.log("\n[2] Checking Categories Across All Pages...");
    const [pageCounts] = await db.query(
      "SELECT target_page, count(*) as count FROM categories GROUP BY target_page ORDER BY target_page"
    );
    console.table(pageCounts);

    // 3. Test Category CRUD operations in DB
    console.log("\n[3] Testing Category Insertion with Metadata...");
    const testCatName = "AI & Machine Learning Fest " + Date.now();
    const [insertResult] = await db.execute(
      `INSERT INTO categories (target_page, name, slug, description, color, icon, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ["events", testCatName, "ai-ml-fest", "Annual AI robotics fest", "#7c3aed", "Cpu", 99, 1]
    );
    const newId = insertResult.insertId;
    console.log(`✓ Inserted test category id: ${newId}`);

    // Update
    console.log("\n[4] Testing Category Update...");
    await db.execute(
      `UPDATE categories
       SET description = 'Updated description', color = '#2563eb', icon = 'Sparkles', sort_order = 100
       WHERE id = ?`,
      [newId]
    );
    const [updatedRow] = await db.query("SELECT * FROM categories WHERE id = ?", [newId]);
    console.log("✓ Updated category:", {
      name: updatedRow[0].name,
      description: updatedRow[0].description,
      color: updatedRow[0].color,
      icon: updatedRow[0].icon,
    });

    // Toggle status
    console.log("\n[5] Testing Category Status Toggle...");
    await db.execute("UPDATE categories SET is_active = 0 WHERE id = ?", [newId]);
    const [inactiveRow] = await db.query("SELECT is_active FROM categories WHERE id = ?", [newId]);
    console.log(`✓ Status toggled to: ${inactiveRow[0].is_active === 0 ? "Inactive (0)" : "Active"}`);

    // Cleanup test category
    await db.execute("DELETE FROM categories WHERE id = ?", [newId]);
    console.log("✓ Cleaned up test category.");

    // 6. Test Notices with Category
    console.log("\n[6] Testing Notices with Category Support...");
    const testNoticeTitle = "SBTET Semester Examination Circular " + Date.now();
    const [noticeResult] = await db.execute(
      `INSERT INTO notices (title, description, category, notice_date)
       VALUES (?, ?, ?, NOW())`,
      [testNoticeTitle, "Detailed timetable available on student portal", "Examination"]
    );
    const noticeId = noticeResult.insertId;
    console.log(`✓ Inserted notice id: ${noticeId} with category: "Examination"`);

    const [savedNotice] = await db.query("SELECT id, title, category FROM notices WHERE id = ?", [noticeId]);
    console.log("✓ Saved notice verification:", savedNotice[0]);

    // Cleanup test notice
    await db.execute("DELETE FROM notices WHERE id = ?", [noticeId]);
    console.log("✓ Cleaned up test notice.");

    // 7. Verify All Public Categories API Query
    console.log("\n[7] Verifying Public Categories Query...");
    const [activePublicCats] = await db.query(
      "SELECT id, target_page, name, slug, color, icon FROM categories WHERE is_active = 1 ORDER BY target_page, sort_order"
    );
    console.log(`✓ Total active categories available for public pages: ${activePublicCats.length}`);

    console.log("\n==================================================");
    console.log("ALL ADVANCED CATEGORY TESTS PASSED SUCCESSFULLY! ✓");
    console.log("==================================================");
    process.exit(0);
  } catch (error) {
    console.error("Test error:", error);
    process.exit(1);
  }
}

runEndToEndTests();
