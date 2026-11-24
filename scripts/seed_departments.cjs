/**
 * Script to seed initial standard departments into `departments` table in MySQL
 */
const db = require('../server/db');

const initialDepartments = [
  {
    department_name: 'Computer Science & Engineering',
    department_code: 'CSE',
    description: 'Programming, full-stack software development, cloud systems, databases, cyber security, AI technologies, and networking.',
    hod_name: 'Sri N. Srinivasulu',
    intake: 120,
    image: '/images/departments/cse/hod.jpg',
    is_active: 1,
  },
  {
    department_name: 'Electronics & Communication Engineering',
    department_code: 'ECE',
    description: 'Electronic circuits, digital communication systems, embedded controllers, microprocessors, VLSI design, and modern electronics.',
    hod_name: 'Sri N. Satyanarayana',
    intake: 60,
    image: '/images/departments/ece/hod.jpg',
    is_active: 1,
  },
  {
    department_name: 'Electrical & Electronics Engineering',
    department_code: 'EEE',
    description: 'Electrical machines, power systems, generation & transmission, industrial electrical drives, control systems, and renewable energy.',
    hod_name: 'Sri N. Srinivasa Rao',
    intake: 60,
    image: '/images/departments/eee/hod.jpg',
    is_active: 1,
  },
  {
    department_name: 'Mechanical Engineering',
    department_code: 'ME',
    description: 'Machine design, manufacturing technology, precision machining, thermodynamics, CAD/CAM drafting, and robotics.',
    hod_name: 'Smt. N. Rajitha Rani',
    intake: 60,
    image: '/images/departments/mechanical/hod.jpg',
    is_active: 1,
  },
  {
    department_name: 'Civil Engineering',
    department_code: 'CE',
    description: 'Structural engineering, total station surveying, concrete technology, geotechnical analysis, and sustainable urban infrastructure.',
    hod_name: 'Dr. C. V. V. Prasad',
    intake: 60,
    image: '/images/departments/civil/hod.jpg',
    is_active: 1,
  },
  {
    department_name: 'Automobile Engineering',
    department_code: 'AE',
    description: 'Internal combustion engine mechanics, automotive chassis, electronic fuel injection, vehicle diagnostics, and electric vehicle architectures.',
    hod_name: 'Sri K. Hari Krishna',
    intake: 60,
    image: '/images/departments/automobile/hod.jpg',
    is_active: 1,
  },
  {
    department_name: 'Pharmacy (D.Pharm)',
    department_code: 'PHARMACY',
    description: 'Pharmaceutics, pharmaceutical chemistry, dosage formulations, hospital pharmacy practice, drug dispensing, and clinical pharmacology.',
    hod_name: 'Smt. K. Lalitha',
    intake: 60,
    image: '',
    is_active: 1,
  },
  {
    department_name: 'Humanities and Sciences',
    department_code: 'HUM',
    description: 'Foundational teaching in mathematics, physics, chemistry and English, with practical laboratory learning for diploma-level engineering students.',
    hod_name: 'Dr. G. Narender Reddy',
    intake: 0,
    image: '',
    is_active: 1,
  },
];

async function seedDepartments() {
  console.log('--- Seeding Departments Table ---');
  let inserted = 0;
  let updated = 0;

  for (const dept of initialDepartments) {
    try {
      const [existing] = await db.execute(
        'SELECT id FROM departments WHERE department_code = ?',
        [dept.department_code]
      );

      if (existing.length > 0) {
        await db.execute(
          `UPDATE departments
           SET department_name = ?, description = ?, hod_name = ?, intake = ?, is_active = ?
           WHERE id = ?`,
          [dept.department_name, dept.description, dept.hod_name, dept.intake, dept.is_active, existing[0].id]
        );
        console.log(`[UPDATED] Department ${dept.department_code} - ${dept.department_name}`);
        updated++;
      } else {
        await db.execute(
          `INSERT INTO departments (department_name, department_code, description, hod_name, intake, image, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [dept.department_name, dept.department_code, dept.description, dept.hod_name, dept.intake, dept.image || null, dept.is_active]
        );
        console.log(`[INSERTED] Department ${dept.department_code} - ${dept.department_name}`);
        inserted++;
      }
    } catch (err) {
      console.error(`[ERROR] Failed to seed ${dept.department_code}:`, err.message);
    }
  }

  console.log(`\nSeeding completed: ${inserted} inserted, ${updated} updated.`);
  const [rows] = await db.execute('SELECT id, department_name, department_code, hod_name, intake, is_active FROM departments ORDER BY id ASC');
  console.table(rows);
}

seedDepartments()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });

