require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("./db");
const readline = require("readline");
const { stdin, stdout } = require("process");

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  try {
    console.log("\n====================================");
    console.log(" COLLEGE WEBSITE - CREATE ADMIN");
    console.log("====================================\n");

    const name = (await ask("Enter admin name: ")).trim();
    const email = (await ask("Enter admin email: ")).trim().toLowerCase();
    const password = await ask("Enter admin password: ");

    if (!name || !email || !password) {
      console.log("\nError: All fields are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("\nError: Please enter a valid email address.");
      return;
    }

    if (password.length < 12) {
      console.log(
        "\nError: Use a password with at least 12 characters."
      );
      return;
    }

    if (password.length > 72) {
      console.log(
        "\nError: Password must not exceed 72 characters when using bcrypt."
      );
      return;
    }

    const [existingAdmins] = await db.execute(
      "SELECT id FROM admins WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingAdmins.length > 0) {
      console.log("\nAn account with this email already exists.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      `INSERT INTO admins (name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, passwordHash, "admin", 1]
    );

    console.log("\nAdmin account created successfully!");
    console.log("Admin ID:", result.insertId);
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Role: admin");
    console.log("\nKeep your password private.");
  } catch (error) {
    console.error("\nFailed to create admin account.");

    if (error.code === "ER_DUP_ENTRY") {
      console.error("An account with this email already exists.");
    } else if (
      error.code === "ER_ACCESS_DENIED_ERROR" ||
      error.code === "ECONNREFUSED"
    ) {
      console.error(
        "Database connection failed. Check your server/.env database settings."
      );
    } else {
      console.error(error.message);
    }

    process.exitCode = 1;
  } finally {
    rl.close();

    if (typeof db.end === "function") {
      await db.end().catch(() => {});
    } else if (typeof db.pool?.end === "function") {
      await db.pool.end().catch(() => {});
    }
  }
}

main();