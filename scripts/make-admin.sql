-- Make flixebaumann@gmail.com an admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'flixebaumann@gmail.com';

-- Verify the change
SELECT email, full_name, role 
FROM profiles 
WHERE email = 'flixebaumann@gmail.com';
