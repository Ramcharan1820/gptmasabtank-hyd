const db = require('../db');

async function runMigration() {
  console.log('--- Starting Admin Approval System Migration ---');
  try {
    const [cols] = await db.execute('SHOW COLUMNS FROM admins');
    const existingCols = new Set(cols.map((c) => c.Field));

    const toAdd = [
      { name: 'username', def: 'VARCHAR(100) NULL' },
      { name: 'status', def: "VARCHAR(20) NOT NULL DEFAULT 'approved'" },
      { name: 'auth_provider', def: "VARCHAR(50) NOT NULL DEFAULT 'local'" },
      { name: 'auth_provider_id', def: 'VARCHAR(255) NULL' },
      { name: 'department', def: 'VARCHAR(100) NULL' },
      { name: 'designation', def: 'VARCHAR(150) NULL' },
      { name: 'phone', def: 'VARCHAR(20) NULL' },
      { name: 'avatar_url', def: 'VARCHAR(1024) NULL' },
      { name: 'request_reason', def: 'TEXT NULL' },
      { name: 'rejection_reason', def: 'VARCHAR(255) NULL' },
      { name: 'approved_by', def: 'INT UNSIGNED NULL' },
      { name: 'approved_at', def: 'TIMESTAMP NULL' },
      { name: 'last_login_at', def: 'TIMESTAMP NULL' },
    ];

    for (const col of toAdd) {
      if (!existingCols.has(col.name)) {
        console.log(`Adding column: ${col.name}`);
        await db.execute(`ALTER TABLE admins ADD COLUMN ${col.name} ${col.def}`);
      }
    }

    // Modify password_hash to be NULLable for OAuth registrations
    await db.execute('ALTER TABLE admins MODIFY COLUMN password_hash VARCHAR(255) NULL');

    // Add unique index on username if not exists
    const [indices] = await db.execute('SHOW INDEX FROM admins');
    const indexNames = new Set(indices.map((idx) => idx.Key_name));
    if (!indexNames.has('admins_username_unique')) {
      console.log('Adding UNIQUE index on username');
      await db.execute('ALTER TABLE admins ADD UNIQUE KEY admins_username_unique (username)');
    }

    // Update existing admin to role = 'superadmin', username = 'admin', status = 'approved', is_active = 1
    console.log('Ensuring existing admin is superadmin...');
    await db.execute(
      `UPDATE admins 
       SET role = 'superadmin', 
           username = COALESCE(username, 'admin'), 
           status = 'approved', 
           is_active = 1 
       WHERE email = 'admin@gmail.com'`
    );

    const [updatedCols] = await db.execute('SHOW COLUMNS FROM admins');
    console.log('Columns in admins table:');
    console.table(updatedCols.map((c) => ({ Field: c.Field, Type: c.Type, Null: c.Null, Default: c.Default })));

    const [admins] = await db.execute('SELECT id, name, username, email, role, status, is_active FROM admins');
    console.log('Current admins in database:');
    console.table(admins);

    console.log('--- Migration Completed Successfully! ---');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();

