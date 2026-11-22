const db = require('../db');

const DEFAULT_CATEGORIES = [
  // Events
  { target_page: 'events', name: 'Technical', slug: 'technical', color: '#2563eb', icon: 'Cpu', sort_order: 1, description: 'Hackathons, coding challenges, robotics and tech symposia' },
  { target_page: 'events', name: 'Cultural', slug: 'cultural', color: '#d97706', icon: 'Sparkles', sort_order: 2, description: 'Annual day, music, drama, fine arts and traditional fests' },
  { target_page: 'events', name: 'Sports', slug: 'sports', color: '#16a34a', icon: 'Trophy', sort_order: 3, description: 'Inter-college tournaments, athletics, cricket and indoor games' },
  { target_page: 'events', name: 'Academic', slug: 'academic', color: '#800000', icon: 'GraduationCap', sort_order: 4, description: 'Lectures, curriculum orientations and academic competitions' },
  { target_page: 'events', name: 'Workshop', slug: 'workshop', color: '#7c3aed', icon: 'Wrench', sort_order: 5, description: 'Hands-on industrial and technical skill workshops' },
  { target_page: 'events', name: 'Seminar', slug: 'seminar', color: '#0891b2', icon: 'Presentation', sort_order: 6, description: 'Industry expert talks, research sessions and paper presentations' },
  { target_page: 'events', name: 'Celebrations', slug: 'celebrations', color: '#db2777', icon: 'PartyPopper', sort_order: 7, description: 'National holidays, festival celebrations and commemorative days' },
  { target_page: 'events', name: 'Placement', slug: 'placement', color: '#059669', icon: 'Briefcase', sort_order: 8, description: 'Recruitment drives, pre-placement talks and mock interviews' },
  { target_page: 'events', name: 'Campus', slug: 'campus', color: '#4b5563', icon: 'Building', sort_order: 9, description: 'Campus cleanliness drives, NSS, NCC and green initiatives' },
  { target_page: 'events', name: 'Competition', slug: 'competition', color: '#ea580c', icon: 'Award', sort_order: 10, description: 'Project expos, debates, quizzes and state-level contests' },
  { target_page: 'events', name: 'Other', slug: 'other', color: '#64748b', icon: 'Tag', sort_order: 11, description: 'General announcements and miscellaneous activities' },

  // Gallery
  { target_page: 'gallery', name: 'Campus', slug: 'campus', color: '#4b5563', icon: 'Building', sort_order: 1, description: 'Campus architecture, administrative buildings and green lawns' },
  { target_page: 'gallery', name: 'Laboratories', slug: 'laboratories', color: '#2563eb', icon: 'FlaskConical', sort_order: 2, description: 'Modern engineering laboratories and specialized equipment' },
  { target_page: 'gallery', name: 'Activities', slug: 'activities', color: '#7c3aed', icon: 'Activity', sort_order: 3, description: 'Student co-curricular and club activities' },
  { target_page: 'gallery', name: 'Students', slug: 'students', color: '#0891b2', icon: 'Users', sort_order: 4, description: 'Classroom life, project teams and group interactions' },
  { target_page: 'gallery', name: 'Events', slug: 'events', color: '#ea580c', icon: 'CalendarDays', sort_order: 5, description: 'High-resolution moments from major college events' },
  { target_page: 'gallery', name: 'Celebrations', slug: 'celebrations', color: '#db2777', icon: 'PartyPopper', sort_order: 6, description: 'Republic Day, Independence Day and festival highlights' },
  { target_page: 'gallery', name: 'Sports', slug: 'sports', color: '#16a34a', icon: 'Trophy', sort_order: 7, description: 'Sports ground, athletic meet and match photos' },
  { target_page: 'gallery', name: 'Academic', slug: 'academic', color: '#800000', icon: 'GraduationCap', sort_order: 8, description: 'Library, seminar halls, classes and presentations' },
  { target_page: 'gallery', name: 'Infrastructure', slug: 'infrastructure', color: '#059669', icon: 'Landmark', sort_order: 9, description: 'Auditorium, workshop sheds and campus facilities' },
  { target_page: 'gallery', name: 'Achievements', slug: 'achievements', color: '#d97706', icon: 'Award', sort_order: 10, description: 'Award ceremonies, medals and certificates' },

  // Notices
  { target_page: 'notices', name: 'Examination', slug: 'examination', color: '#dc2626', icon: 'FileText', sort_order: 1, description: 'Timetables, hall tickets, fee deadlines and SBTET notifications' },
  { target_page: 'notices', name: 'Admissions', slug: 'admissions', color: '#2563eb', icon: 'UserCheck', sort_order: 2, description: 'POLYCET counseling, verification and reporting circulars' },
  { target_page: 'notices', name: 'Academic', slug: 'academic', color: '#800000', icon: 'GraduationCap', sort_order: 3, description: 'Syllabus, class schedules, attendance rules and internal exams' },
  { target_page: 'notices', name: 'Circulars', slug: 'circulars', color: '#7c3aed', icon: 'Bell', sort_order: 4, description: 'Official administration notices from DTE & Principal' },
  { target_page: 'notices', name: 'Scholarships', slug: 'scholarships', color: '#16a34a', icon: 'Coins', sort_order: 5, description: 'ePass, NSP and fee reimbursement application notices' },
  { target_page: 'notices', name: 'Holidays', slug: 'holidays', color: '#d97706', icon: 'CalendarDays', sort_order: 6, description: 'Declared college holidays and vacation schedules' },
  { target_page: 'notices', name: 'Placements', slug: 'placements', color: '#059669', icon: 'Briefcase', sort_order: 7, description: 'Campus placement drive notices and shortlist announcements' },
  { target_page: 'notices', name: 'General', slug: 'general', color: '#64748b', icon: 'Info', sort_order: 8, description: 'General announcements and student guidelines' },

  // Faculty
  { target_page: 'faculty', name: 'Leadership', slug: 'leadership', color: '#800000', icon: 'Crown', sort_order: 1, description: 'Principal, vice-principal and administrative heads' },
  { target_page: 'faculty', name: 'Teaching Faculty', slug: 'teaching-faculty', color: '#2563eb', icon: 'GraduationCap', sort_order: 2, description: 'Heads of Section, Senior Lecturers and Lecturers' },
  { target_page: 'faculty', name: 'Senior Lecturers', slug: 'senior-lecturers', color: '#7c3aed', icon: 'Award', sort_order: 3, description: 'Senior faculty members with over a decade of teaching' },
  { target_page: 'faculty', name: 'Lab & Technical Staff', slug: 'lab-technical-staff', color: '#0891b2', icon: 'Wrench', sort_order: 4, description: 'Workshop instructors, lab assistants and technicians' },
  { target_page: 'faculty', name: 'Administration', slug: 'administration', color: '#4b5563', icon: 'Shield', sort_order: 5, description: 'Office superintendents, exam cell and clerks' },
  { target_page: 'faculty', name: 'Guest Faculty', slug: 'guest-faculty', color: '#d97706', icon: 'UserPlus', sort_order: 6, description: 'Visiting lecturers and industry guest mentors' },

  // Placements
  { target_page: 'placements', name: 'IT & Software', slug: 'it-software', color: '#2563eb', icon: 'Laptop', sort_order: 1, description: 'Software developers, QA, Cloud and IT services recruiters' },
  { target_page: 'placements', name: 'Core Engineering', slug: 'core-engineering', color: '#ea580c', icon: 'Cog', sort_order: 2, description: 'Mechanical, civil, electrical and automobile companies' },
  { target_page: 'placements', name: 'Product Companies', slug: 'product-companies', color: '#7c3aed', icon: 'Layers', sort_order: 3, description: 'Product-based technology and hardware engineering firms' },
  { target_page: 'placements', name: 'Consulting & Analytics', slug: 'consulting-analytics', color: '#0891b2', icon: 'BarChart', sort_order: 4, description: 'Business analysts, tech consultants and data firms' },
  { target_page: 'placements', name: 'PSU & Government', slug: 'psu-government', color: '#800000', icon: 'Landmark', sort_order: 5, description: 'Public sector undertakings and state enterprise apprenticeships' },
  { target_page: 'placements', name: 'Internships', slug: 'internships', color: '#16a34a', icon: 'Compass', sort_order: 6, description: 'Paid industry training and 6-month industrial internship programs' },
  { target_page: 'placements', name: 'Training & Guidance', slug: 'training-guidance', color: '#d97706', icon: 'Megaphone', sort_order: 7, description: 'Aptitude classes, soft skills and mock interview programs' },

  // Departments
  { target_page: 'departments', name: 'Diploma Engineering', slug: 'diploma-engineering', color: '#800000', icon: 'Cpu', sort_order: 1, description: '3-year regular polytechnic diploma branches' },
  { target_page: 'departments', name: 'Technical Branches', slug: 'technical-branches', color: '#2563eb', icon: 'Wrench', sort_order: 2, description: 'Specialized applied engineering sections' },
  { target_page: 'departments', name: 'Science & Humanities', slug: 'science-humanities', color: '#059669', icon: 'BookOpen', sort_order: 3, description: 'Physics, chemistry, mathematics and English general section' },
  { target_page: 'departments', name: 'Vocational & Allied', slug: 'vocational-allied', color: '#7c3aed', icon: 'Briefcase', sort_order: 4, description: 'Pharmacy, skill development and vocational tracks' },

  // Alumni
  { target_page: 'alumni', name: 'Notable Alumni', slug: 'notable-alumni', color: '#d97706', icon: 'Star', sort_order: 1, description: 'Distinguished graduates with exceptional public recognition' },
  { target_page: 'alumni', name: 'Entrepreneurs & Founders', slug: 'entrepreneurs-founders', color: '#2563eb', icon: 'Rocket', sort_order: 2, description: 'Alumni who established successful startups and enterprises' },
  { target_page: 'alumni', name: 'Industry Leaders', slug: 'industry-leaders', color: '#800000', icon: 'Award', sort_order: 3, description: 'Executives, chief engineers and directors in top corporations' },
  { target_page: 'alumni', name: 'Higher Studies', slug: 'higher-studies', color: '#7c3aed', icon: 'GraduationCap', sort_order: 4, description: 'Graduates pursuing B.Tech, M.Tech or international degrees' },
  { target_page: 'alumni', name: 'Campus Chapters', slug: 'campus-chapters', color: '#059669', icon: 'Users', sort_order: 5, description: 'Regional and international alumni association chapters' },
];

async function runMigration() {
  console.log('--- Starting Categories Management Migration ---');
  try {
    // 1. Create categories table
    console.log('Creating categories table if not exists...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        target_page VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        description VARCHAR(255) NULL,
        color VARCHAR(30) NOT NULL DEFAULT '#800000',
        icon VARCHAR(50) NOT NULL DEFAULT 'Tag',
        sort_order INT NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY categories_target_name_unique (target_page, name),
        KEY categories_target_active_order_idx (target_page, is_active, sort_order)
      )
    `);

    // 2. Check and add category column to notices table
    console.log('Checking category column in notices table...');
    const [noticeCols] = await db.execute('SHOW COLUMNS FROM notices');
    const noticeColNames = new Set(noticeCols.map((c) => c.Field));
    if (!noticeColNames.has('category')) {
      console.log('Adding category column to notices table...');
      await db.execute('ALTER TABLE notices ADD COLUMN category VARCHAR(100) NULL DEFAULT "General" AFTER notice_date');
    }

    // 3. Seed default categories safely (INSERT IGNORE)
    console.log('Seeding default categories...');
    let insertedCount = 0;
    for (const cat of DEFAULT_CATEGORIES) {
      const [existing] = await db.execute(
        'SELECT id FROM categories WHERE target_page = ? AND name = ? LIMIT 1',
        [cat.target_page, cat.name]
      );
      if (existing.length === 0) {
        await db.execute(
          `INSERT INTO categories (target_page, name, slug, description, color, icon, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [cat.target_page, cat.name, cat.slug, cat.description, cat.color, cat.icon, cat.sort_order]
        );
        insertedCount++;
      }
    }
    console.log(`Seeded ${insertedCount} new categories (${DEFAULT_CATEGORIES.length} total standard categories).`);

    const [totalRows] = await db.execute('SELECT target_page, count(*) as count FROM categories GROUP BY target_page');
    console.log('Categories summary by target page:');
    console.table(totalRows);

    console.log('--- Migration Completed Successfully! ---');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration, DEFAULT_CATEGORIES };
