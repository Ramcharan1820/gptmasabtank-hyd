-- Faculty import for Government Polytechnic College, Masab Tank
-- Target table: site_content (the same table used by AdminDashboard Faculty Management).
-- Safe to run more than once: rows with an existing matching email are skipped.
-- Before running, confirm your MySQL Workbench connection is using college_website.

USE college_website;
START TRANSACTION;

-- 1. Ram
INSERT INTO site_content (content_type, payload, is_active, sort_order)
SELECT 'faculty', JSON_OBJECT('faculty_code', '1234', 'name', 'Ram', 'designation', 'HOD', 'department', 'CSE', 'qualification', 'M Tech', 'experience', '18', 'specialization', '', 'email', 'tejayadavnani@gmail.com', 'phone', '', 'photo', 'https://drive.google.com/uc?export=view&id=1aGCDbCch0O5w1bLwNmTw-Xl2LCtiTUFb', 'photo_public_id', '', 'message', '', 'is_leadership', FALSE), 1, 1
WHERE NOT EXISTS (
  SELECT 1 FROM site_content
  WHERE content_type = 'faculty'
    AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.email')) = 'tejayadavnani@gmail.com'
);

-- 2. Miryalkar Priyanka
INSERT INTO site_content (content_type, payload, is_active, sort_order)
SELECT 'faculty', JSON_OBJECT('faculty_code', '4515016', 'name', 'Miryalkar Priyanka', 'designation', 'Lecturer', 'department', 'Automobile', 'qualification', 'M Tech', 'experience', '5 years', 'specialization', '', 'email', 'miryalkar.priyanka11@gmail.com', 'phone', '', 'photo', 'https://drive.google.com/uc?export=view&id=1fQ3cEQMBZ0ati2KqyLbvXpjqMmGOPY7H', 'photo_public_id', '', 'message', '', 'is_leadership', FALSE), 1, 2
WHERE NOT EXISTS (
  SELECT 1 FROM site_content
  WHERE content_type = 'faculty'
    AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.email')) = 'miryalkar.priyanka11@gmail.com'
);

-- 3. Smt.V.V.Rama Lakshmi
INSERT INTO site_content (content_type, payload, is_active, sort_order)
SELECT 'faculty', JSON_OBJECT('faculty_code', '1832558', 'name', 'Smt.V.V.Rama Lakshmi', 'designation', 'Senior Lecturer in Civil Engineering', 'department', 'Civil', 'qualification', 'M.tech', 'experience', '31+ years', 'specialization', '', 'email', 'vrlvedula@gmail.com', 'phone', '', 'photo', 'https://drive.google.com/uc?export=view&id=1L5GmzxGc-6jln7JWlJAWwH1L1KUlimuy', 'photo_public_id', '', 'message', '', 'is_leadership', FALSE), 1, 3
WHERE NOT EXISTS (
  SELECT 1 FROM site_content
  WHERE content_type = 'faculty'
    AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.email')) = 'vrlvedula@gmail.com'
);

-- 4. Dr.M Vinay Kumar Chakravarthy
INSERT INTO site_content (content_type, payload, is_active, sort_order)
SELECT 'faculty', JSON_OBJECT('faculty_code', '1760288', 'name', 'Dr.M Vinay Kumar Chakravarthy', 'designation', 'Lecturer in Pharmacy', 'department', 'Pharmacy', 'qualification', 'Ph.D', 'experience', '14 Years', 'specialization', '', 'email', 'm.vinay2708@gmail.com', 'phone', '', 'photo', 'https://drive.google.com/uc?export=view&id=1feiocxWtSpCE9Wr0JPA3q_9dd7ypWzZ0', 'photo_public_id', '', 'message', '', 'is_leadership', FALSE), 1, 4
WHERE NOT EXISTS (
  SELECT 1 FROM site_content
  WHERE content_type = 'faculty'
    AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.email')) = 'm.vinay2708@gmail.com'
);

-- 5. D SUDHEER KUMAR
INSERT INTO site_content (content_type, payload, is_active, sort_order)
SELECT 'faculty', JSON_OBJECT('faculty_code', '1757568', 'name', 'D SUDHEER KUMAR', 'designation', 'Senior Lecturer in Pharmacy', 'department', 'Pharmacy', 'qualification', 'M. Pharmacy', 'experience', '14 Years', 'specialization', '', 'email', 'sudeer.donta@gmail.com', 'phone', '', 'photo', 'https://drive.google.com/uc?export=view&id=1uMT4ssIYzI9YavTqw5nkKLcTMXy_7qOA', 'photo_public_id', '', 'message', '', 'is_leadership', FALSE), 1, 5
WHERE NOT EXISTS (
  SELECT 1 FROM site_content
  WHERE content_type = 'faculty'
    AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.email')) = 'sudeer.donta@gmail.com'
);

-- 6. D Srikanth
INSERT INTO site_content (content_type, payload, is_active, sort_order)
SELECT 'faculty', JSON_OBJECT('faculty_code', '1650221', 'name', 'D Srikanth', 'designation', 'Lecturer', 'department', 'ECE', 'qualification', 'M.Tech', 'experience', '14', 'specialization', '', 'email', 'srideva.5050@gmail.com', 'phone', '', 'photo', 'https://drive.google.com/uc?export=view&id=1pIP1-cJGQL95owrCtDHHui3qmDaecsji', 'photo_public_id', '', 'message', '', 'is_leadership', FALSE), 1, 6
WHERE NOT EXISTS (
  SELECT 1 FROM site_content
  WHERE content_type = 'faculty'
    AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.email')) = 'srideva.5050@gmail.com'
);

-- 7. N Mounika
INSERT INTO site_content (content_type, payload, is_active, sort_order)
SELECT 'faculty', JSON_OBJECT('faculty_code', '10645517', 'name', 'N Mounika', 'designation', 'Lecturer in CSE', 'department', 'CSE', 'qualification', 'Btech', 'experience', '1yr', 'specialization', '', 'email', 'manaswimiryala@gmail.com', 'phone', '', 'photo', 'https://drive.google.com/uc?export=view&id=1vTUCT3ZEXIKvLzZV92ZR8FMd66VV-oRX', 'photo_public_id', '', 'message', '', 'is_leadership', FALSE), 1, 7
WHERE NOT EXISTS (
  SELECT 1 FROM site_content
  WHERE content_type = 'faculty'
    AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.email')) = 'manaswimiryala@gmail.com'
);

-- 8. B.Mounika
INSERT INTO site_content (content_type, payload, is_active, sort_order)
SELECT 'faculty', JSON_OBJECT('faculty_code', '10650640', 'name', 'B.Mounika', 'designation', 'Lecturer', 'department', 'CSE', 'qualification', 'B.Tech', 'experience', '1', 'specialization', '', 'email', 'mounika.maligireddy14@gmail.com', 'phone', '', 'photo', 'https://drive.google.com/uc?export=view&id=1DtsKV4uUlOKoRlCB-sNkVWRMSjRXtrKo', 'photo_public_id', '', 'message', '', 'is_leadership', FALSE), 1, 8
WHERE NOT EXISTS (
  SELECT 1 FROM site_content
  WHERE content_type = 'faculty'
    AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.email')) = 'mounika.maligireddy14@gmail.com'
);

-- 9. S SRINIVAS
INSERT INTO site_content (content_type, payload, is_active, sort_order)
SELECT 'faculty', JSON_OBJECT('faculty_code', '1845147', 'name', 'S SRINIVAS', 'designation', 'LECTURER', 'department', 'CSE', 'qualification', 'B.E (BACHELOR OF ENGINEERING)', 'experience', '16', 'specialization', '', 'email', 'srinivas8126@gmail.com', 'phone', '', 'photo', 'https://drive.google.com/uc?export=view&id=1PP44BawT2MaR1Fct1XtyE1m7mqewfcEl', 'photo_public_id', '', 'message', '', 'is_leadership', FALSE), 1, 9
WHERE NOT EXISTS (
  SELECT 1 FROM site_content
  WHERE content_type = 'faculty'
    AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.email')) = 'srinivas8126@gmail.com'
);

-- 10. Sailaja thummala
INSERT INTO site_content (content_type, payload, is_active, sort_order)
SELECT 'faculty', JSON_OBJECT('faculty_code', '', 'name', 'Sailaja thummala', 'designation', 'Lecturer', 'department', 'CSE', 'qualification', 'M.tech', 'experience', '13yrs', 'specialization', '', 'email', 'sailaja.thummala@gmail.com', 'phone', '', 'photo', 'https://drive.google.com/uc?export=view&id=14QKK9jtV4YwHGIeja1I3LqNwRdJW06Df', 'photo_public_id', '', 'message', '', 'is_leadership', FALSE), 1, 10
WHERE NOT EXISTS (
  SELECT 1 FROM site_content
  WHERE content_type = 'faculty'
    AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.email')) = 'sailaja.thummala@gmail.com'
);

COMMIT;

-- Verify imported faculty records:
SELECT id,
       JSON_UNQUOTE(JSON_EXTRACT(payload, '$.name')) AS faculty_name,
       JSON_UNQUOTE(JSON_EXTRACT(payload, '$.department')) AS department,
       is_active, sort_order
FROM site_content
WHERE content_type = 'faculty'
ORDER BY sort_order, id;
