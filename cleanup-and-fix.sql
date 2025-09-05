-- First, drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_profile_on_signup();

-- Check and clean up any existing data
DELETE FROM user_profiles WHERE email = 'vincentmasci@icloud.com';
DELETE FROM auth.users WHERE email = 'vincentmasci@icloud.com';

-- Now you can sign up fresh without trigger interference