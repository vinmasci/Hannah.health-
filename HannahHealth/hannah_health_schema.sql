-- Hannah Health Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    weight_kg DECIMAL(5,2),
    height_cm INTEGER,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    activity_level TEXT DEFAULT 'moderately_active',
    basal_metabolic_rate INTEGER DEFAULT 2200,
    daily_deficit_target INTEGER DEFAULT 500,
    tracking_mode TEXT DEFAULT 'full' CHECK (tracking_mode IN ('full', 'macros_only', 'habits_only')),
    is_nutritionist BOOLEAN DEFAULT FALSE,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'nutritionist')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FOOD ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.food_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    food_name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein DECIMAL(8,2),
    carbs DECIMAL(8,2),
    fat DECIMAL(8,2),
    fiber DECIMAL(8,2),
    sugar DECIMAL(8,2),
    sodium DECIMAL(8,2),
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.50,
    confidence_source TEXT,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    portion_size TEXT,
    brand TEXT,
    restaurant TEXT,
    image_url TEXT,
    notes TEXT,
    logged_via TEXT DEFAULT 'app' CHECK (logged_via IN ('app', 'sms', 'web')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHAT MESSAGES TABLE (for conversation history)
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_user BOOLEAN NOT NULL,
    confidence DECIMAL(3,2),
    image_data TEXT, -- Base64 encoded image
    food_entry_id UUID REFERENCES public.food_entries(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NUTRITIONIST CLIENTS TABLE (B2B feature)
-- ============================================
CREATE TABLE IF NOT EXISTS public.nutritionist_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(nutritionist_id, client_id)
);

-- ============================================
-- WEEKLY SUMMARIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.weekly_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    avg_daily_calories INTEGER,
    avg_daily_protein DECIMAL(8,2),
    avg_daily_carbs DECIMAL(8,2),
    avg_daily_fat DECIMAL(8,2),
    total_deficit INTEGER,
    pattern_insights JSONB,
    ai_recommendations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

-- ============================================
-- MEAL PLANS TABLE (Week 1 Magic feature)
-- ============================================
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    plan_data JSONB NOT NULL, -- Stores the full meal plan
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritionist_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" 
    ON public.user_profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.user_profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.user_profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Food Entries Policies
CREATE POLICY "Users can view own food entries" 
    ON public.food_entries FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food entries" 
    ON public.food_entries FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food entries" 
    ON public.food_entries FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food entries" 
    ON public.food_entries FOR DELETE 
    USING (auth.uid() = user_id);

-- Nutritionist can view client food entries
CREATE POLICY "Nutritionists can view client food entries" 
    ON public.food_entries FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.nutritionist_clients
            WHERE nutritionist_id = auth.uid()
            AND client_id = food_entries.user_id
            AND status = 'active'
        )
    );

-- Chat Messages Policies
CREATE POLICY "Users can view own messages" 
    ON public.chat_messages FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" 
    ON public.chat_messages FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Nutritionist Clients Policies
CREATE POLICY "Nutritionists can view their clients" 
    ON public.nutritionist_clients FOR SELECT 
    USING (auth.uid() = nutritionist_id OR auth.uid() = client_id);

CREATE POLICY "Users can accept nutritionist invites" 
    ON public.nutritionist_clients FOR UPDATE 
    USING (auth.uid() = client_id);

-- Weekly Summaries Policies
CREATE POLICY "Users can view own summaries" 
    ON public.weekly_summaries FOR SELECT 
    USING (auth.uid() = user_id);

-- Meal Plans Policies
CREATE POLICY "Users can view own meal plans" 
    ON public.meal_plans FOR SELECT 
    USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_food_entries_user_id ON public.food_entries(user_id);
CREATE INDEX idx_food_entries_created_at ON public.food_entries(created_at DESC);
CREATE INDEX idx_food_entries_user_date ON public.food_entries(user_id, created_at DESC);
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id, created_at DESC);
CREATE INDEX idx_nutritionist_clients_nutritionist ON public.nutritionist_clients(nutritionist_id);
CREATE INDEX idx_nutritionist_clients_client ON public.nutritionist_clients(client_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get daily calorie total
CREATE OR REPLACE FUNCTION get_daily_calories(user_uuid UUID, target_date DATE)
RETURNS INTEGER AS $$
DECLARE
    total_calories INTEGER;
BEGIN
    SELECT COALESCE(SUM(calories), 0)
    INTO total_calories
    FROM public.food_entries
    WHERE user_id = user_uuid
    AND DATE(created_at) = target_date;
    
    RETURN total_calories;
END;
$$ LANGUAGE plpgsql;

-- Function to get weekly patterns (for Week 1 Magic)
CREATE OR REPLACE FUNCTION analyze_weekly_patterns(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    patterns JSONB;
BEGIN
    -- This would contain logic to analyze eating patterns
    -- For now, return a simple aggregation
    SELECT jsonb_build_object(
        'avg_breakfast_time', AVG(EXTRACT(HOUR FROM created_at)),
        'favorite_foods', array_agg(DISTINCT food_name),
        'restaurant_frequency', COUNT(DISTINCT restaurant)
    )
    INTO patterns
    FROM public.food_entries
    WHERE user_id = user_uuid
    AND created_at >= NOW() - INTERVAL '7 days';
    
    RETURN patterns;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment to add test data
/*
-- Test user profile
INSERT INTO public.user_profiles (id, email, full_name, weight_kg, height_cm)
VALUES (auth.uid(), 'test@example.com', 'Test User', 70, 175);

-- Test food entry
INSERT INTO public.food_entries (user_id, food_name, calories, confidence, meal_type)
VALUES (auth.uid(), 'Big Mac', 563, 0.95, 'lunch');
*/

COMMENT ON SCHEMA public IS 'Hannah Health - AI Nutrition Tracking Database';