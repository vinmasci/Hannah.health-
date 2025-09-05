-- Weight Tracking Table for Hannah Health
-- This table stores historical weight entries for tracking progress over time

-- ============================================
-- WEIGHT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2) NOT NULL,
    weight_lbs DECIMAL(5,2) GENERATED ALWAYS AS (weight_kg * 2.20462) STORED,
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    notes TEXT,
    logged_via TEXT DEFAULT 'app' CHECK (logged_via IN ('app', 'sms', 'web', 'healthkit')),
    measured_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_weight_logs_user_measured ON public.weight_logs(user_id, measured_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on weight_logs table
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- Weight Logs Policies
CREATE POLICY "Users can view own weight logs" 
    ON public.weight_logs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs" 
    ON public.weight_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs" 
    ON public.weight_logs FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs" 
    ON public.weight_logs FOR DELETE 
    USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Get latest weight for user
-- ============================================
CREATE OR REPLACE FUNCTION get_latest_weight(p_user_id UUID)
RETURNS TABLE(weight_kg DECIMAL, measured_at TIMESTAMPTZ) AS $$
BEGIN
    RETURN QUERY
    SELECT wl.weight_kg, wl.measured_at
    FROM public.weight_logs wl
    WHERE wl.user_id = p_user_id
    ORDER BY wl.measured_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Get weight trend (last 30 days)
-- ============================================
CREATE OR REPLACE FUNCTION get_weight_trend(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    weight_kg DECIMAL,
    measured_at TIMESTAMPTZ,
    change_from_previous DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH weight_data AS (
        SELECT 
            wl.weight_kg,
            wl.measured_at,
            LAG(wl.weight_kg) OVER (ORDER BY wl.measured_at) as previous_weight
        FROM public.weight_logs wl
        WHERE wl.user_id = p_user_id
            AND wl.measured_at >= NOW() - INTERVAL '1 day' * p_days
        ORDER BY wl.measured_at DESC
    )
    SELECT 
        wd.weight_kg,
        wd.measured_at,
        (wd.weight_kg - wd.previous_weight) as change_from_previous
    FROM weight_data wd;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Update user profile weight on new log
-- ============================================
CREATE OR REPLACE FUNCTION update_user_profile_weight()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the user_profiles table with the latest weight
    UPDATE public.user_profiles
    SET weight_kg = NEW.weight_kg,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profile_weight
    AFTER INSERT ON public.weight_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profile_weight();