-- Auto-create user_profiles when someone signs up
-- This trigger runs after a new user is created in auth.users

CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (
    id, 
    email, 
    full_name,
    phone_number,
    phone_verified,
    sms_enabled,
    sms_message_count,
    weight_kg,
    height_cm,
    gender,
    activity_level,
    basal_metabolic_rate,
    daily_deficit_target,
    tracking_mode,
    subscription_tier,
    subscription_status,
    trial_starts_at,
    trial_ends_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Friend'),
    NULL,  -- phone added later
    false, -- not verified
    true,  -- SMS enabled by default
    0,     -- no messages yet
    NULL,  -- weight added later
    NULL,  -- height added later
    NULL,  -- gender added later
    'moderately_active', -- default activity
    2200,  -- default BMR (will calculate when we get stats)
    500,   -- default deficit
    'full', -- default tracking mode
    'free', -- default tier
    'trial', -- subscription status
    NOW(), -- trial starts now
    NOW() + INTERVAL '7 days', -- trial ends in 7 days
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't block signup
    RAISE LOG 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_on_signup();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON auth.users TO postgres;

-- Test: Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';