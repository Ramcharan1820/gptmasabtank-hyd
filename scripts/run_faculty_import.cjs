/**
 * Script to run faculty import into `site_content` table
 * Uses server/db.js connection configured via server/.env
 */

const fs = require('fs');
const path = require('path');
const db = require('../server/db');

const facultyRecords = [
  {
    faculty_code: '1234',
    name: 'Ram',
    designation: 'HOD',
    department: 'CSE',
    qualification: 'M Tech',
    experience: '18',
    specialization: 'Computer Science, Systems & Cloud Architecture',
    email: 'tejayadavnani@gmail.com',
    phone: '',
    photo: 'https://drive.google.com/uc?export=view&id=1aGCDbCch0O5w1bLwNmTw-Xl2LCtiTUFb',
    photo_public_id: '',
    message: 'Welcome to the Department of Computer Science & Engineering. We strive for excellence in programming, problem solving, and industry-aligned technical skill sets.',
    is_leadership: false,
    sort_order: 1,
  },
  {
    faculty_code: '4515016',
    name: 'Miryalkar Priyanka',
    designation: 'Lecturer',
    department: 'Automobile',
    qualification: 'M Tech',
    experience: '5 years',
    specialization: 'Automotive Powertrains, IC Engines & Diagnostics',
    email: 'miryalkar.priyanka11@gmail.com',
    phone: '',
    photo: 'https://drive.google.com/uc?export=view&id=1fQ3cEQMBZ0ati2KqyLbvXpjqMmGOPY7H',
    photo_public_id: '',
    message: '',
    is_leadership: false,
    sort_order: 2,
  },
  {
    faculty_code: '1832558',
    name: 'Smt.V.V.Rama Lakshmi',
    designation: 'Senior Lecturer in Civil Engineering',
    department: 'Civil',
    qualification: 'M.tech',
    experience: '31+ years',
    specialization: 'Structural Analysis, Concrete Technology & Surveying',
    email: 'vrlvedula@gmail.com',
    phone: '',
    photo: 'https://drive.google.com/uc?export=view&id=1L5GmzxGc-6jln7JWlJAWwH1L1KUlimuy',
    photo_public_id: '',
    message: '',
    is_leadership: false,
    sort_order: 3,
  },
  {
    faculty_code: '1760288',
    name: 'Dr.M Vinay Kumar Chakravarthy',
    designation: 'Lecturer in Pharmacy',
    department: 'Pharmacy',
    qualification: 'Ph.D',
    experience: '14 Years',
    specialization: 'Pharmaceutical Chemistry, Drug Synthesis & Analysis',
    email: 'm.vinay2708@gmail.com',
    phone: '',
    photo: 'https://drive.google.com/uc?export=view&id=1feiocxWtSpCE9Wr0JPA3q_9dd7ypWzZ0',
    photo_public_id: '',
    message: '',
    is_leadership: false,
    sort_order: 4,
  },
  {
    faculty_code: '1757568',
    name: 'D SUDHEER KUMAR',
    designation: 'Senior Lecturer in Pharmacy',
    department: 'Pharmacy',
    qualification: 'M. Pharmacy',
    experience: '14 Years',
    specialization: 'Pharmaceutics, Dosage Forms & Hospital Pharmacy',
    email: 'sudeer.donta@gmail.com',
    phone: '',
    photo: 'https://drive.google.com/uc?export=view&id=1uMT4ssIYzI9YavTqw5nkKLcTMXy_7qOA',
    photo_public_id: '',
    message: '',
    is_leadership: false,
    sort_order: 5,
  },
  {
    faculty_code: '1650221',
    name: 'D Srikanth',
    designation: 'Lecturer',
    department: 'ECE',
    qualification: 'M.Tech',
    experience: '14',
    specialization: 'Embedded Systems, Microcontrollers & VLSI',
    email: 'srideva.5050@gmail.com',
    phone: '',
    photo: 'https://drive.google.com/uc?export=view&id=1pIP1-cJGQL95owrCtDHHui3qmDaecsji',
    photo_public_id: '',
    message: '',
    is_leadership: false,
    sort_order: 6,
  },
  {
    faculty_code: '10645517',
    name: 'N Mounika',
    designation: 'Lecturer in CSE',
    department: 'CSE',
    qualification: 'Btech',
    experience: '1yr',
    specialization: 'Web Technologies, Data Structures & Python',
    email: 'manaswimiryala@gmail.com',
    phone: '',
    photo: 'https://drive.google.com/uc?export=view&id=1vTUCT3ZEXIKvLzZV92ZR8FMd66VV-oRX',
    photo_public_id: '',
    message: '',
    is_leadership: false,
    sort_order: 7,
  },
  {
    faculty_code: '10650640',
    name: 'B.Mounika',
    designation: 'Lecturer',
    department: 'CSE',
    qualification: 'B.Tech',
    experience: '1',
    specialization: 'Operating Systems & Database Management',
    email: 'mounika.maligireddy14@gmail.com',
    phone: '',
    photo: 'https://drive.google.com/uc?export=view&id=1DtsKV4uUlOKoRlCB-sNkVWRMSjRXtrKo',
    photo_public_id: '',
    message: '',
    is_leadership: false,
    sort_order: 8,
  },
  {
    faculty_code: '1845147',
    name: 'S SRINIVAS',
    designation: 'LECTURER',
    department: 'CSE',
    qualification: 'B.E (BACHELOR OF ENGINEERING)',
    experience: '16',
    specialization: 'Computer Networks, C/C++ Programming & Software Engg',
    email: 'srinivas8126@gmail.com',
    phone: '',
    photo: 'https://drive.google.com/uc?export=view&id=1PP44BawT2MaR1Fct1XtyE1m7mqewfcEl',
    photo_public_id: '',
    message: '',
    is_leadership: false,
    sort_order: 9,
  },
  {
    faculty_code: '',
    name: 'Sailaja thummala',
    designation: 'Lecturer',
    department: 'CSE',
    qualification: 'M.tech',
    experience: '13yrs',
    specialization: 'Algorithms, Software Testing & Java',
    email: 'sailaja.thummala@gmail.com',
    phone: '',
    photo: 'https://drive.google.com/uc?export=view&id=14QKK9jtV4YwHGIeja1I3LqNwRdJW06Df',
    photo_public_id: '',
    message: '',
    is_leadership: false,
    sort_order: 10,
  },
];

async function runImport() {
  console.log('--- Starting Faculty Import ---');
  let inserted = 0;
  let skipped = 0;

  for (const record of facultyRecords) {
    try {
      const email = record.email.trim();
      // Check if faculty already exists by email in site_content
      const [existing] = await db.execute(
        `SELECT id FROM site_content 
         WHERE content_type = 'faculty' 
           AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.email')) = ?`,
        [email]
      );

      if (existing.length > 0) {
        console.log(`[SKIP] Already exists: ${record.name} (${email}) - ID #${existing[0].id}`);
        skipped++;
        continue;
      }

      const sortOrder = record.sort_order || 99;
      const payload = {
        faculty_code: record.faculty_code || '',
        name: record.name,
        designation: record.designation,
        department: record.department,
        qualification: record.qualification,
        experience: record.experience,
        specialization: record.specialization || '',
        email: record.email,
        phone: record.phone || '',
        photo: record.photo || '',
        photo_public_id: record.photo_public_id || '',
        message: record.message || '',
        is_leadership: Boolean(record.is_leadership),
        is_active: true,
      };

      const [res] = await db.execute(
        `INSERT INTO site_content (content_type, payload, is_active, sort_order)
         VALUES ('faculty', ?, 1, ?)`,
        [JSON.stringify(payload), sortOrder]
      );

      console.log(`[INSERTED] Added ${record.name} (${record.department}) as ID #${res.insertId}`);
      inserted++;
    } catch (err) {
      console.error(`[ERROR] Failed to process ${record.name}:`, err.message);
    }
  }

  console.log('\n--- Import Summary ---');
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Total:    ${facultyRecords.length}`);

  // Fetch final list
  const [rows] = await db.execute(
    `SELECT id, 
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.name')) as name,
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.department')) as department,
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.designation')) as designation
     FROM site_content 
     WHERE content_type = 'faculty'
     ORDER BY sort_order, id`
  );
  console.log(`\nCurrent total faculty in database: ${rows.length}`);
  console.table(rows);
}

runImport()
  .then(() => {
    console.log('\nFaculty import complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });

