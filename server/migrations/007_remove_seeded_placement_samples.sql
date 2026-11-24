DELETE FROM site_content
WHERE content_type = 'placements'
  AND (
    (
      JSON_UNQUOTE(JSON_EXTRACT(payload, '$.kind')) = 'student'
      AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.name')) = 'Selected Student'
      AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.company')) = 'Company Name'
      AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.package')) = 'Placement Details'
    )
    OR (
      JSON_UNQUOTE(JSON_EXTRACT(payload, '$.kind')) = 'recruiter'
      AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.title')) IN (
        'TCS',
        'Infosys',
        'Wipro',
        'Tech Mahindra',
        'Cognizant',
        'HCL Technologies',
        'Accenture',
        'Capgemini',
        'Deloitte',
        'IBM',
        'Amazon',
        'Microsoft'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM placements p
        WHERE LOWER(TRIM(p.company_name)) = LOWER(TRIM(
          JSON_UNQUOTE(JSON_EXTRACT(site_content.payload, '$.title'))
        ))
      )
    )
  );
