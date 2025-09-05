-- Migration: Add Phone Number Support for SMS Integration
-- Date: January 27, 2025
-- Purpose: Enable SMS food logging via Twilio

-- 1. Add phone number to user_profiles
ALTER TABLE user_profiles
ADD COLUMN phone_number TEXT UNIQUE,
ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN phone_verified_at TIMESTAMP,
ADD COLUMN sms_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN sms_message_count INTEGER DEFAULT 0,
ADD COLUMN sms_last_message_at TIMESTAMP;

-- Create index for fast phone lookups
CREATE INDEX idx_user_profiles_phone ON user_profiles(phone_number);

-- 2. Create phone verification tokens table
CREATE TABLE phone_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    verification_code TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_phone_verifications_phone ON phone_verifications(phone_number);
CREATE INDEX idx_phone_verifications_expires ON phone_verifications(expires_at);

-- 3. Update food_entries to track SMS source
-- (Already has logged_via field, just documenting valid values)
-- Valid values: 'app', 'sms', 'web'

-- 4. Create function to get user by phone number
CREATE OR REPLACE FUNCTION get_user_by_phone(phone_input TEXT)
RETURNS TABLE(
    user_id UUID,
    full_name TEXT,
    sms_enabled BOOLEAN,
    message_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.full_name,
        up.sms_enabled,
        up.sms_message_count
    FROM user_profiles up
    WHERE up.phone_number = phone_input
    AND up.phone_verified = TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to log food via SMS
CREATE OR REPLACE FUNCTION log_food_via_sms(
    phone_input TEXT,
    food_name_input TEXT,
    calories_input INTEGER,
    meal_type_input TEXT,
    confidence_input DECIMAL DEFAULT 0.70
)
RETURNS UUID AS $$
DECLARE
    user_id_var UUID;
    new_entry_id UUID;
BEGIN
    -- Get user ID from phone
    SELECT up.id INTO user_id_var
    FROM user_profiles up
    WHERE up.phone_number = phone_input
    AND up.phone_verified = TRUE
    AND up.sms_enabled = TRUE;
    
    IF user_id_var IS NULL THEN
        RAISE EXCEPTION 'User not found or SMS not enabled';
    END IF;
    
    -- Insert food entry
    INSERT INTO food_entries (
        user_id,
        food_name,
        calories,
        meal_type,
        confidence,
        confidence_source,
        logged_via,
        created_at
    ) VALUES (
        user_id_var,
        food_name_input,
        calories_input,
        meal_type_input,
        confidence_input,
        'sms_estimate',
        'sms',
        NOW()
    ) RETURNING id INTO new_entry_id;
    
    -- Update SMS message count
    UPDATE user_profiles
    SET sms_message_count = sms_message_count + 1,
        sms_last_message_at = NOW()
    WHERE id = user_id_var;
    
    RETURN new_entry_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Create RLS policies for phone verification
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own verification records
CREATE POLICY "Users can view own verifications" ON phone_verifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create verification for themselves
CREATE POLICY "Users can create own verification" ON phone_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own verification
CREATE POLICY "Users can update own verification" ON phone_verifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 7. Function to verify phone number
CREATE OR REPLACE FUNCTION verify_phone_number(
    user_id_input UUID,
    phone_input TEXT,
    code_input TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    is_valid BOOLEAN;
BEGIN
    -- Check if code matches and not expired
    SELECT TRUE INTO is_valid
    FROM phone_verifications
    WHERE user_id = user_id_input
    AND phone_number = phone_input
    AND verification_code = code_input
    AND expires_at > NOW()
    AND verified = FALSE
    AND attempts < 3;
    
    IF is_valid THEN
        -- Mark as verified
        UPDATE phone_verifications
        SET verified = TRUE
        WHERE user_id = user_id_input
        AND phone_number = phone_input;
        
        -- Update user profile
        UPDATE user_profiles
        SET phone_number = phone_input,
            phone_verified = TRUE,
            phone_verified_at = NOW()
        WHERE id = user_id_input;
        
        RETURN TRUE;
    ELSE
        -- Increment attempts
        UPDATE phone_verifications
        SET attempts = attempts + 1
        WHERE user_id = user_id_input
        AND phone_number = phone_input
        AND expires_at > NOW();
        
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. Cleanup expired verifications (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS void AS $$
BEGIN
    DELETE FROM phone_verifications
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Optional: Set up a cron job to run cleanup daily
-- SELECT cron.schedule('cleanup-verifications', '0 3 * * *', 'SELECT cleanup_expired_verifications();');