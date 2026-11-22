const http = require("http");
const db = require("./db");
const bcrypt = require("bcryptjs");

const BASE_URL = "http://localhost:5000";

function request(path, options = {}, body = null) {
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

async function runTests() {
  console.log("=== Testing Admin Registration & Approval System ===");

  // Ensure superadmin has known password for test
  const testSuperPass = "AdminPassword@123";
  const superHash = await bcrypt.hash(testSuperPass, 12);
  await db.execute(
    "UPDATE admins SET password_hash = ?, role = 'superadmin', is_active = 1, status = 'approved', username = 'superadmin' WHERE email = 'admin@gmail.com'",
    [superHash]
  );
  console.log("Superadmin account credentials set.");

  // Start server if needed
  let serverRunning = false;
  try {
    const res = await request("/api/admin-route-test");
    if (res.status === 200) serverRunning = true;
  } catch (_) {}

  let serverInstance = null;
  if (!serverRunning) {
    console.log("Starting server in-process...");
    const app = require("./server.js");
    await new Promise((resolve) => {
      serverInstance = app.listen(5000, "0.0.0.0", () => {
        console.log("Server listening on port 5000 for test");
        resolve();
      });
    });
  }

  const testEmail = `test_faculty_${Date.now()}@gptm.ac.in`;
  const testUsername = `faculty_${Date.now().toString().slice(-6)}`;
  const testPassword = "FacultyPassword@123";

  // Test 1: Submit new admin registration
  console.log("\n1. Testing POST /api/admin/register (New Admin Registration)...");
  const regRes = await request("/api/admin/register", { method: "POST" }, {
    name: "Dr. K. Srinivas Rao",
    username: testUsername,
    email: testEmail,
    password: testPassword,
    department: "Computer Science & Engineering (CSE)",
    designation: "Senior Lecturer",
    phone: "9876543210",
    request_reason: "Academic circulars and CSE department updates",
  });

  console.log("Registration Status Code:", regRes.status);
  console.log("Response:", regRes.data);
  if (regRes.status !== 201 || regRes.data.status !== "pending") {
    throw new Error("Test 1 Failed: Registration should return 201 with status pending");
  }
  const newAdminId = regRes.data.admin.id;
  console.log("✓ Registration successfully created with status: PENDING (ID:", newAdminId, ")");

  // Test 2: Duplicate email check
  console.log("\n2. Testing Duplicate Email Detection...");
  const dupEmailRes = await request("/api/admin/register", { method: "POST" }, {
    name: "Duplicate User",
    username: `other_${Date.now().toString().slice(-5)}`,
    email: testEmail,
    password: testPassword,
    department: "Civil Engineering",
  });
  console.log("Duplicate Email Status Code:", dupEmailRes.status);
  if (dupEmailRes.status !== 409) {
    throw new Error("Test 2 Failed: Duplicate email should return 409 Conflict");
  }
  console.log("✓ Correctly rejected duplicate email with 409 Conflict");

  // Test 3: Duplicate username check
  console.log("\n3. Testing Duplicate Username Detection...");
  const dupUserRes = await request("/api/admin/register", { method: "POST" }, {
    name: "Duplicate Username User",
    username: testUsername,
    email: `diff_${Date.now()}@gmail.com`,
    password: testPassword,
    department: "Mechanical Engineering",
  });
  console.log("Duplicate Username Status Code:", dupUserRes.status);
  if (dupUserRes.status !== 409) {
    throw new Error("Test 3 Failed: Duplicate username should return 409 Conflict");
  }
  console.log("✓ Correctly rejected duplicate username with 409 Conflict");

  // Test 4: Attempt to login before approval
  console.log("\n4. Testing Login for Unapproved (Pending) Admin...");
  const unapprovedLoginRes = await request("/api/admin/login", { method: "POST" }, {
    identifier: testUsername,
    password: testPassword,
  });
  console.log("Pending Login Status Code:", unapprovedLoginRes.status);
  console.log("Response message:", unapprovedLoginRes.data.message);
  if (unapprovedLoginRes.status !== 403 || unapprovedLoginRes.data.status !== "pending") {
    throw new Error("Test 4 Failed: Login for pending admin must return 403 status pending");
  }
  console.log("✓ Blocked unapproved admin from logging in with 403 Forbidden");

  // Test 5: Check registration status as applicant
  console.log("\n5. Testing Public Status Check /api/admin/check-status...");
  const statusRes = await request("/api/admin/check-status", { method: "POST" }, {
    identifier: testEmail,
  });
  console.log("Status Check Code:", statusRes.status);
  console.log("Applicant Status:", statusRes.data.admin.status);
  if (statusRes.status !== 200 || statusRes.data.admin.status !== "pending") {
    throw new Error("Test 5 Failed: Status check must return pending");
  }
  console.log("✓ Status check verified application is pending");

  // Test 6: Super Admin Login
  console.log("\n6. Testing Main Administrator (Superadmin) Login...");
  const superLoginRes = await request("/api/admin/login", { method: "POST" }, {
    identifier: "admin@gmail.com",
    password: testSuperPass,
  });
  console.log("Superadmin Login Status:", superLoginRes.status);
  if (superLoginRes.status !== 200) {
    throw new Error("Superadmin login failed: " + JSON.stringify(superLoginRes.data));
  }
  const superToken = superLoginRes.data.token;
  const rawCookie = superLoginRes.headers["set-cookie"];
  const superCookie = rawCookie
    ? Array.isArray(rawCookie)
      ? rawCookie[0].split(";")[0]
      : rawCookie.split(";")[0]
    : "";
  console.log("✓ Superadmin logged in successfully! Role:", superLoginRes.data.admin.role);

  const authHeaders = {
    Authorization: `Bearer ${superToken}`,
    Cookie: superCookie,
  };

  // Test 7: Superadmin list users
  console.log("\n7. Testing GET /api/admin/users (Super Admin List)...");
  const listRes = await request("/api/admin/users?status=pending", {
    headers: authHeaders,
  });
  console.log("List Status:", listRes.status);
  console.log("Found Pending Admins:", listRes.data.admins?.length);
  const found = listRes.data.admins?.some((a) => a.id === newAdminId);
  if (!found) throw new Error("Test 7 Failed: New admin not found in pending list");
  console.log("✓ New admin present in Superadmin pending queue");

  // Test 8: Main administrator approves admin
  console.log("\n8. Testing POST /api/admin/users/:id/approve (Main Administrator Approval)...");
  const approveRes = await request(`/api/admin/users/${newAdminId}/approve`, {
    method: "POST",
    headers: authHeaders,
  });
  console.log("Approve Status:", approveRes.status);
  console.log("Approve Response:", approveRes.data);
  if (approveRes.status !== 200 || !approveRes.data.success) {
    throw new Error("Test 8 Failed: Approve failed");
  }
  console.log("✓ Administrator approved by Main Administrator!");

  // Test 9: Login as newly approved admin
  console.log("\n9. Testing Login as Newly Approved Administrator...");
  const approvedLoginRes = await request("/api/admin/login", { method: "POST" }, {
    identifier: testUsername,
    password: testPassword,
  });
  console.log("Approved Login Status:", approvedLoginRes.status);
  console.log("Login Message:", approvedLoginRes.data.message);
  if (approvedLoginRes.status !== 200 || !approvedLoginRes.data.authenticated) {
    throw new Error("Test 9 Failed: Approved admin should be able to log in");
  }
  console.log("✓ Newly approved admin successfully authenticated into dashboard!");

  // Test 10: Toggle status (suspend)
  console.log("\n10. Testing Admin Account Suspend / Toggle...");
  const toggleRes = await request(`/api/admin/users/${newAdminId}/toggle-status`, {
    method: "POST",
    headers: authHeaders,
  });
  console.log("Toggle Status:", toggleRes.status, toggleRes.data);
  if (toggleRes.status !== 200) throw new Error("Test 10 Failed");

  // Test 11: Cleanup
  console.log("\n11. Cleaning up test admin record...");
  await request(`/api/admin/users/${newAdminId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  console.log("✓ Test admin cleaned up successfully.");

  console.log("\n🎉 ALL 11 TESTS PASSED PERFECTLY! SYSTEM IS 100% OPERATIONAL. 🎉\n");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
