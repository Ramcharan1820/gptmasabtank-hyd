CREATE TABLE IF NOT EXISTS site_content (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  content_type VARCHAR(32) NOT NULL,
  payload JSON NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY site_content_type_status_order_idx
    (content_type, is_active, sort_order, id)
);

INSERT INTO site_content (content_type, payload, is_active, sort_order)
SELECT 'faculty', seed_data.payload, 1, seed_data.sort_order
FROM (
  SELECT 0 AS sort_order, JSON_OBJECT(
    'faculty_code', 'PRINCIPAL',
    'name', 'Dr. K. Chandra Sekhar',
    'designation', 'Principal / Head of Institution',
    'department', 'Leadership',
    'qualification', 'Ph.D, M.Tech (Mechanical Engg)',
    'experience', '26+ Years',
    'email', 'gpthyd01@telangana.gov.in',
    'phone', '040-23395914',
    'photo', '/principal.jpg',
    'message', 'Government Polytechnic Masab Tank has a storied legacy of technical excellence. Our goal is to mentor students through rigorous practical lab training, skill development, and industry alignment.',
    'is_leadership', TRUE
  ) AS payload
  UNION ALL SELECT 1, JSON_OBJECT('faculty_code', 'CSE001', 'name', 'Sri N. Srinivasulu', 'designation', 'Head of Section (HOD)', 'department', 'CSE', 'qualification', 'M.Tech (CSE)', 'experience', '18 Years', 'specialization', 'AI, Full-Stack Web Technologies & Algorithms', 'email', 'hod.cse@gptmasb.dte.telangana.gov.in', 'photo', '/csehod.png')
  UNION ALL SELECT 2, JSON_OBJECT('faculty_code', 'CSE002', 'name', 'Sri MD.Riaz', 'designation', 'Senior Lecturer', 'department', 'CSE', 'qualification', 'b.tech (m tech)', 'experience', '16 Years', 'specialization', 'Relational Databases, Cloud & Cyber Security', 'email', 'sunitha.p@gptmasb.dte.telangana.gov.in', 'photo', '/riaz.png')
  UNION ALL SELECT 3, JSON_OBJECT('faculty_code', 'CSE003', 'name', 'Sri Srinivas', 'designation', 'Senior Lecturer', 'department', 'CSE', 'qualification', 'B.Tech (.net ,ccp )', 'experience', '16 Years', 'specialization', 'c++ programmer', 'email', 'ramesh.t@gptmasb.dte.telangana.gov.in')
  UNION ALL SELECT 4, JSON_OBJECT('faculty_code', 'CSE004', 'name', 'Sri Ramanarshiah', 'designation', 'Lecturer', 'department', 'CSE', 'qualification', 'B.Tech ( software engineering )', 'experience', '8 Years', 'specialization', 'software engineer', 'email', 'ramesh.t@gptmasb.dte.telangana.gov.in')
  UNION ALL SELECT 5, JSON_OBJECT('faculty_code', 'CSE005', 'name', 'Sri shailaja', 'designation', 'Lecturer', 'department', 'CSE', 'qualification', 'B.Tech ( cyber security )', 'experience', '8 Years', 'specialization', 'mobile application development', 'email', 'ramesh.t@gptmasb.dte.telangana.gov.in')
  UNION ALL SELECT 6, JSON_OBJECT('faculty_code', 'CSE006', 'name', 'Sri N. mounika', 'designation', 'Lecturer', 'department', 'CSE', 'qualification', 'B.Tech (Computer Networks)', 'experience', '8 Years', 'specialization', 'Operating System, cloud computing', 'email', 'ramesh.t@gptmasb.dte.telangana.gov.in', 'photo', '/mounikan.png')
  UNION ALL SELECT 7, JSON_OBJECT('faculty_code', 'CSE007', 'name', 'Sri N. mounika', 'designation', 'Lecturer', 'department', 'CSE', 'qualification', 'B.Tech (python)', 'experience', '8 Years', 'specialization', 'Python & operating system', 'email', 'ramesh.t@gptmasb.dte.telangana.gov.in', 'photo', '/mounikab.png')
  UNION ALL SELECT 8, JSON_OBJECT('faculty_code', 'ME001', 'name', 'Dr. G. Venkat Rao', 'designation', 'Head of Section (HOD)', 'department', 'Mechanical', 'qualification', 'Ph.D, M.Tech', 'experience', '21 Years', 'specialization', 'CAD/CAM, Thermal Systems & Robotics', 'email', 'hod.mech@gptmasb.dte.telangana.gov.in')
  UNION ALL SELECT 9, JSON_OBJECT('faculty_code', 'ME002', 'name', 'Smt. K. Saritha', 'designation', 'Senior Lecturer', 'department', 'Mechanical', 'qualification', 'M.Tech (Production Engg)', 'experience', '14 Years', 'specialization', 'Advanced Manufacturing & CNC Technology', 'email', 'saritha.k@gptmasb.dte.telangana.gov.in')
  UNION ALL SELECT 10, JSON_OBJECT('faculty_code', 'ME003', 'name', 'Sri M. Anjaneyulu', 'designation', 'Lecturer', 'department', 'Mechanical', 'qualification', 'M.Tech (Design Engg)', 'experience', '9 Years', 'specialization', 'Kinematics & Workshop Practice', 'email', 'anjaneyulu.m@gptmasb.dte.telangana.gov.in')
  UNION ALL SELECT 11, JSON_OBJECT('faculty_code', 'CE001', 'name', 'Sri V. Ramesh', 'designation', 'Head of Section (HOD)', 'department', 'Civil', 'qualification', 'M.Tech (Structural Engg)', 'experience', '19 Years', 'specialization', 'Structural Analysis & Total Station Surveying', 'email', 'hod.civil@gptmasb.dte.telangana.gov.in')
  UNION ALL SELECT 12, JSON_OBJECT('faculty_code', 'CE002', 'name', 'Smt. D. Aruna', 'designation', 'Lecturer', 'department', 'Civil', 'qualification', 'M.Tech (Geotechnical Engg)', 'experience', '10 Years', 'specialization', 'Soil Mechanics & Concrete Technology', 'email', 'aruna.d@gptmasb.dte.telangana.gov.in')
  UNION ALL SELECT 13, JSON_OBJECT('faculty_code', 'EEE001', 'name', 'Sri D. Suresh Babu', 'designation', 'Head of Section (HOD)', 'department', 'EEE', 'qualification', 'M.Tech (Power Systems)', 'experience', '20 Years', 'specialization', 'Power Distribution & Electrical Machines', 'email', 'hod.eee@gptmasb.dte.telangana.gov.in')
  UNION ALL SELECT 14, JSON_OBJECT('faculty_code', 'EEE002', 'name', 'Smt. Ch. Latha', 'designation', 'Lecturer', 'department', 'EEE', 'qualification', 'M.Tech (Power Electronics)', 'experience', '12 Years', 'specialization', 'Control Systems & Renewable Energy', 'email', 'latha.ch@gptmasb.dte.telangana.gov.in')
  UNION ALL SELECT 15, JSON_OBJECT('faculty_code', 'ECE001', 'name', 'Dr. B. Radhika', 'designation', 'Head of Section (HOD)', 'department', 'ECE', 'qualification', 'Ph.D, M.Tech (VLSI & Embedded)', 'experience', '17 Years', 'specialization', 'Microcontrollers, DSP & IoT Architectures', 'email', 'hod.ece@gptmasb.dte.telangana.gov.in')
  UNION ALL SELECT 16, JSON_OBJECT('faculty_code', 'ECE002', 'name', 'Sri K. Naresh', 'designation', 'Lecturer', 'department', 'ECE', 'qualification', 'M.Tech (Embedded Systems)', 'experience', '9 Years', 'specialization', 'Digital Electronics & Communication Circuits', 'email', 'naresh.k@gptmasb.dte.telangana.gov.in')
  UNION ALL SELECT 17, JSON_OBJECT('faculty_code', 'AUTO001', 'name', 'Sri K. Praveen Kumar', 'designation', 'Head of Section (HOD)', 'department', 'Automobile', 'qualification', 'M.Tech (Automotive Engg)', 'experience', '15 Years', 'specialization', 'IC Engines, Chassis Design & EV Systems', 'email', 'hod.auto@gptmasb.dte.telangana.gov.in')
  UNION ALL SELECT 18, JSON_OBJECT('faculty_code', 'GEN001', 'name', 'Dr. A. Srinivas', 'designation', 'Head of General Section', 'department', 'General', 'qualification', 'Ph.D (Applied Mathematics)', 'experience', '22 Years', 'specialization', 'Engineering Mathematics & Statistics', 'email', 'gen.math@gptmasb.dte.telangana.gov.in')
) AS seed_data
WHERE NOT EXISTS (
  SELECT 1 FROM site_content WHERE content_type = 'faculty'
);

INSERT INTO site_content (content_type, payload, is_active, sort_order)
SELECT 'placements', seed_data.payload, 1, seed_data.sort_order
FROM (
  SELECT 0 AS sort_order, JSON_OBJECT('kind', 'feature', 'title', 'Career Guidance', 'description', 'Helping students understand career opportunities and prepare for recruitment processes.') AS payload
  UNION ALL SELECT 1, JSON_OBJECT('kind', 'feature', 'title', 'Training Programs', 'description', 'Supporting technical, aptitude, communication and interview preparation activities.')
  UNION ALL SELECT 2, JSON_OBJECT('kind', 'feature', 'title', 'Student Development', 'description', 'Encouraging students to improve their professional skills and confidence.')
  UNION ALL SELECT 3, JSON_OBJECT('kind', 'feature', 'title', 'Industry Interaction', 'description', 'Creating opportunities for students to understand industry expectations and workplace requirements.')
  UNION ALL SELECT 4, JSON_OBJECT('kind', 'recruiter', 'title', 'TCS')
  UNION ALL SELECT 5, JSON_OBJECT('kind', 'recruiter', 'title', 'Infosys')
  UNION ALL SELECT 6, JSON_OBJECT('kind', 'recruiter', 'title', 'Wipro')
  UNION ALL SELECT 7, JSON_OBJECT('kind', 'recruiter', 'title', 'Tech Mahindra')
  UNION ALL SELECT 8, JSON_OBJECT('kind', 'recruiter', 'title', 'Cognizant')
  UNION ALL SELECT 9, JSON_OBJECT('kind', 'recruiter', 'title', 'HCL Technologies')
  UNION ALL SELECT 10, JSON_OBJECT('kind', 'recruiter', 'title', 'Accenture')
  UNION ALL SELECT 11, JSON_OBJECT('kind', 'recruiter', 'title', 'Capgemini')
  UNION ALL SELECT 12, JSON_OBJECT('kind', 'recruiter', 'title', 'Deloitte')
  UNION ALL SELECT 13, JSON_OBJECT('kind', 'recruiter', 'title', 'IBM')
  UNION ALL SELECT 14, JSON_OBJECT('kind', 'recruiter', 'title', 'Amazon')
  UNION ALL SELECT 15, JSON_OBJECT('kind', 'recruiter', 'title', 'Microsoft')
  UNION ALL SELECT 16, JSON_OBJECT('kind', 'student', 'name', 'Selected Student', 'branch', 'Computer Science & Engineering', 'company', 'Company Name', 'package', 'Placement Details')
  UNION ALL SELECT 17, JSON_OBJECT('kind', 'student', 'name', 'Selected Student', 'branch', 'Electronics & Communication Engineering', 'company', 'Company Name', 'package', 'Placement Details')
  UNION ALL SELECT 18, JSON_OBJECT('kind', 'student', 'name', 'Selected Student', 'branch', 'Electrical & Electronics Engineering', 'company', 'Company Name', 'package', 'Placement Details')
  UNION ALL SELECT 19, JSON_OBJECT('kind', 'student', 'name', 'Selected Student', 'branch', 'Mechanical Engineering', 'company', 'Company Name', 'package', 'Placement Details')
) AS seed_data
WHERE NOT EXISTS (
  SELECT 1 FROM site_content WHERE content_type = 'placements'
);

INSERT INTO site_content (content_type, payload, is_active, sort_order)
SELECT 'gallery', seed_data.payload, 1, seed_data.sort_order
FROM (
  SELECT 0 AS sort_order, JSON_OBJECT('title', 'College Campus', 'category', 'Campus', 'image', '/college-campus-1.jpg') AS payload
  UNION ALL SELECT 1, JSON_OBJECT('title', 'Computer Science Laboratory', 'category', 'Laboratories', 'image', '/images/gallery/cse-lab.jpg')
  UNION ALL SELECT 2, JSON_OBJECT('title', 'Technical Activities', 'category', 'Activities', 'image', '/images/gallery/technical.jpg')
  UNION ALL SELECT 3, JSON_OBJECT('title', 'Student Activities', 'category', 'Students', 'image', '/images/gallery/students.jpg')
  UNION ALL SELECT 4, JSON_OBJECT('title', 'College Events', 'category', 'Events', 'image', '/images/gallery/events.jpg')
  UNION ALL SELECT 5, JSON_OBJECT('title', 'Annual Celebrations', 'category', 'Celebrations', 'image', '/images/gallery/celebration.jpg')
  UNION ALL SELECT 6, JSON_OBJECT('title', 'Sports Activities', 'category', 'Sports', 'image', '/images/gallery/sports.jpg')
  UNION ALL SELECT 7, JSON_OBJECT('title', 'Seminars & Workshops', 'category', 'Academic', 'image', '/images/gallery/workshop.jpg')
) AS seed_data
WHERE NOT EXISTS (
  SELECT 1 FROM site_content WHERE content_type = 'gallery'
);

INSERT INTO site_content (content_type, payload, is_active, sort_order)
SELECT 'contact', JSON_OBJECT(
  'address', 'Government Polytechnic College, Masab Tank, Hyderabad, Telangana, India.',
  'phone', '040-23395914',
  'email', 'gpthyd01@telangana.gov.in',
  'working_hours', 'Monday to Friday. During regular college working hours.',
  'location_title', 'Government Polytechnic College, Masab Tank',
  'location', 'Masab Tank, Hyderabad, Telangana, India.',
  'map_url', 'https://www.google.com/maps/search/?api=1&query=Government+Polytechnic+College+Masab+Tank+Hyderabad',
  'map_embed_url', 'https://www.google.com/maps?q=Government%20Polytechnic%20College%20Masab%20Tank%20Hyderabad&output=embed',
  'road_info', 'Government Polytechnic College, Masab Tank is located in Hyderabad and is accessible by local roads and public transportation.',
  'train_info', 'Hyderabad has several railway stations with local transport facilities available to reach Masab Tank.',
  'air_info', 'Rajiv Gandhi International Airport is the nearest major airport. Taxi and bus services are available towards Hyderabad.',
  'landmark_info', 'Masab Tank is a well-known locality in central Hyderabad and is easily accessible from major areas of the city.'
), 1, 0
WHERE NOT EXISTS (
  SELECT 1 FROM site_content WHERE content_type = 'contact'
);
