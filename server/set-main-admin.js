const bcrypt = require("bcryptjs");
const db = require("./db");

async function setMainAdministrator() {
  const adminAccounts = [
    {
      name: "Main Administrator",
      email: "gpthyd.dte.telangana@gmail.com".toLowerCase().trim(),
      username: "gpthyd_admin".toLowerCase().trim(),
      rawPassword: "admin@500028",
      authProvider: "local",
      designation: "Main Administrator",
    },
    {
      name: "Teja Yadav",
      email: "tejayadavnani@gmail.com".toLowerCase().trim(),
      username: "tejayadav".toLowerCase().trim(),
      rawPassword: "admin@500028",
      authProvider: "google",
      designation: "Super Administrator",
    },
  ];

  for (const acc of adminAccounts) {
    console.log(`\nConfiguring administrator: ${acc.email}...`);
    const passwordHash = await bcrypt.hash(acc.rawPassword, 12);

    const [existing] = await db.execute(
      "SELECT id, email, username FROM admins WHERE email = ? OR username = ? LIMIT 1",
      [acc.email, acc.username]
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
             designation = ?
         WHERE id = ?`,
        [acc.name, acc.email, acc.username, passwordHash, acc.designation, existingId]
      );
    } else {
      console.log(`Inserting new administrator record for ${acc.email}...`);
      await db.execute(
        `INSERT INTO admins (
          name,
          email,
          username,
          password_hash,
          role,
          status,
          is_active,
          auth_provider,
          department,
          designation
        ) VALUES (?, ?, ?, ?, 'superadmin', 'approved', 1, ?, 'Principal / Head Office', ?)`,
        [acc.name, acc.email, acc.username, passwordHash, acc.authProvider, acc.designation]
      );
    }
  }

  // Verify in database
  const [admins] = await db.execute(
    "SELECT id, name, username, email, role, status, is_active, auth_provider, department, designation FROM admins"
  );

  console.log("\nSuper Administrator accounts successfully configured:");
  console.table(admins);

  process.exit(0);
}

setMainAdministrator().catch((err) => {
  console.error("Error setting main administrator:", err);
  process.exit(1);
});

