const bcrypt = require("bcryptjs");
const db = require("./db");

async function setMainAdministrator() {
  const targetEmail = "gpthyd.dte.telangana@gmail.com".toLowerCase().trim();
  const targetUsername = "gpthyd_admin".toLowerCase().trim();
  const rawPassword = "admin@500028";
  const name = "Main Administrator";

  console.log("Setting Main Administrator account...");
  console.log("Email:", targetEmail);
  console.log("Username:", targetUsername);

  const passwordHash = await bcrypt.hash(rawPassword, 12);

  // Check if account with email or username already exists
  const [existing] = await db.execute(
    "SELECT id, email, username FROM admins WHERE email = ? OR username = ? OR id = 1 LIMIT 1",
    [targetEmail, targetUsername]
  );

  if (existing.length > 0) {
    const existingId = existing[0].id;
    console.log(`Updating existing admin record (ID: ${existingId})...`);
    await db.execute(
      `UPDATE admins
       SET name = ?,
           email = ?,
           username = ?,
           password_hash = ?,
           role = 'superadmin',
           status = 'approved',
           is_active = 1,
           department = 'Principal / Head Office',
           designation = 'Main Administrator'
       WHERE id = ?`,
      [name, targetEmail, targetUsername, passwordHash, existingId]
    );
  } else {
    console.log("Inserting new Main Administrator record...");
    await db.execute(
      `INSERT INTO admins (
        name,
        email,
        username,
        password_hash,
        role,
        status,
        is_active,
        department,
        designation
      ) VALUES (?, ?, ?, ?, 'superadmin', 'approved', 1, 'Principal / Head Office', 'Main Administrator')`,
      [name, targetEmail, targetUsername, passwordHash]
    );
  }

  // Verify in database
  const [admins] = await db.execute(
    "SELECT id, name, username, email, role, status, is_active, department, designation FROM admins WHERE email = ?",
    [targetEmail]
  );

  console.log("\nMain Administrator account successfully configured:");
  console.table(admins);

  // Test bcrypt verification
  const [stored] = await db.execute("SELECT password_hash FROM admins WHERE email = ?", [targetEmail]);
  const isMatch = await bcrypt.compare(rawPassword, stored[0].password_hash);
  console.log("Password verification check:", isMatch ? "MATCHED (Ready to login)" : "FAILED");

  process.exit(0);
}

setMainAdministrator().catch((err) => {
  console.error("Error setting main administrator:", err);
  process.exit(1);
});

