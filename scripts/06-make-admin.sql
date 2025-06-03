-- Mache flixebaumann@gmail.com zum Admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'flixebaumann@gmail.com';

-- Zeige das Ergebnis
SELECT 
  email, 
  full_name, 
  role, 
  created_at 
FROM profiles 
WHERE email = 'flixebaumann@gmail.com';

SELECT 'Admin-Rechte erfolgreich vergeben!' AS status;
