-- Hannah.health Database Schema
-- Version: 1.0.0
-- Created: 2025-01-19
-- Description: Complete database schema for meal planning app with dual-mode support

-- ============================================
-- ENUMS AND CUSTOM TYPES
-- ============================================

-- User mode preferences
CREATE TYPE user_mode AS ENUM ('medical', 'ed_safe', 'balanced');

-- Medical conditions
CREATE TYPE medical_condition AS ENUM (
    'nafld', 
    'diabetes_type_1', 
    'diabetes_type_2', 
    'high_cholesterol', 
    'hypertension', 
    'celiac', 
    'ibs', 
    'gerd',
    'other'
);

-- Meal types
CREATE TYPE meal_type AS ENUM (
    'breakfast', 
    'lunch', 
    'dinner', 
    'snack', 
    'beverage'
);

-- Activity levels
CREATE TYPE activity_level AS ENUM (
    'sedentary', 
    'lightly_active', 
    'moderately_active', 
    'very_active', 
    'extremely_active'
);

-- Dietary preferences
CREATE TYPE dietary_preference AS ENUM (
    'omnivore',
    'vegetarian',
    'vegan',
    'pescatarian',
    'keto',
    'paleo',
    'mediterranean',
    'low_carb',
    'low_fat',
    'gluten_free',
    'dairy_free',
    'halal',
    'kosher'
);

-- Progress tracking types
CREATE TYPE progress_type AS ENUM (
    'symptom',
    'mood',
    'energy',
    'victory',
    'measurement',
    'note'
);

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    mode_preference user_mode DEFAULT 'balanced',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    subscription_status TEXT DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences and settings
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- Medical settings
    medical_conditions medical_condition[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',
    medications TEXT[] DEFAULT '{}',
    -- Display preferences
    show_calories BOOLEAN DEFAULT TRUE,
    show_macros BOOLEAN DEFAULT TRUE,
    show_weight BOOLEAN DEFAULT TRUE,
    show_costs BOOLEAN DEFAULT TRUE,
    -- Dietary preferences
    dietary_preferences dietary_preference[] DEFAULT '{}',
    disliked_foods TEXT[] DEFAULT '{}',
    -- Goals (optional for medical mode)
    daily_calorie_target INTEGER,
    protein_target_grams INTEGER,
    carb_target_grams INTEGER,
    fat_target_grams INTEGER,
    fiber_target_grams INTEGER,
    sodium_limit_mg INTEGER,
    -- Other preferences
    timezone TEXT DEFAULT 'UTC',
    week_starts_on INTEGER DEFAULT 0, -- 0 = Sunday, 1 = Monday
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Foods database
CREATE TABLE public.foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    brand TEXT,
    barcode TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    -- Nutrition per 100g
    calories DECIMAL(8,2),
    protein_g DECIMAL(8,2),
    carbs_g DECIMAL(8,2),
    fat_g DECIMAL(8,2),
    fiber_g DECIMAL(8,2),
    sugar_g DECIMAL(8,2),
    sodium_mg DECIMAL(8,2),
    cholesterol_mg DECIMAL(8,2),
    -- Additional nutrients
    saturated_fat_g DECIMAL(8,2),
    trans_fat_g DECIMAL(8,2),
    potassium_mg DECIMAL(8,2),
    vitamin_a_iu DECIMAL(8,2),
    vitamin_c_mg DECIMAL(8,2),
    calcium_mg DECIMAL(8,2),
    iron_mg DECIMAL(8,2),
    -- Serving info
    serving_size DECIMAL(8,2),
    serving_unit TEXT,
    servings_per_container DECIMAL(8,2),
    -- Cost info
    cost_per_unit DECIMAL(8,2),
    cost_unit TEXT,
    -- Metadata
    is_verified BOOLEAN DEFAULT FALSE,
    is_custom BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id),
    safe_for_conditions medical_condition[] DEFAULT '{}',
    dietary_tags dietary_preference[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes
CREATE TABLE public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    servings INTEGER DEFAULT 1,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    instructions JSONB, -- Array of step objects
    tips TEXT,
    source_url TEXT,
    -- Aggregated nutrition (per serving)
    calories DECIMAL(8,2),
    protein_g DECIMAL(8,2),
    carbs_g DECIMAL(8,2),
    fat_g DECIMAL(8,2),
    fiber_g DECIMAL(8,2),
    sodium_mg DECIMAL(8,2),
    -- Cost
    cost_per_serving DECIMAL(8,2),
    -- Metadata
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    safe_for_conditions medical_condition[] DEFAULT '{}',
    dietary_tags dietary_preference[] DEFAULT '{}',
    meal_types meal_type[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe ingredients (many-to-many with foods)
CREATE TABLE public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES public.foods(id),
    amount DECIMAL(8,2) NOT NULL,
    unit TEXT NOT NULL,
    notes TEXT,
    is_optional BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal plans
CREATE TABLE public.meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT,
    date DATE NOT NULL,
    is_template BOOLEAN DEFAULT FALSE,
    -- Daily totals (calculated)
    total_calories DECIMAL(8,2),
    total_protein_g DECIMAL(8,2),
    total_carbs_g DECIMAL(8,2),
    total_fat_g DECIMAL(8,2),
    total_fiber_g DECIMAL(8,2),
    total_cost DECIMAL(8,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Meal plan items
CREATE TABLE public.meal_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
    meal_type meal_type NOT NULL,
    -- Can be either a food or a recipe
    food_id UUID REFERENCES public.foods(id),
    recipe_id UUID REFERENCES public.recipes(id),
    -- Serving info
    servings DECIMAL(8,2) DEFAULT 1,
    custom_name TEXT, -- For quick-added items
    -- Custom nutrition (if manually entered)
    custom_calories DECIMAL(8,2),
    custom_protein_g DECIMAL(8,2),
    custom_carbs_g DECIMAL(8,2),
    custom_fat_g DECIMAL(8,2),
    -- Notes
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (food_id IS NOT NULL AND recipe_id IS NULL) OR
        (food_id IS NULL AND recipe_id IS NOT NULL) OR
        (food_id IS NULL AND recipe_id IS NULL AND custom_name IS NOT NULL)
    )
);

-- Shopping lists
CREATE TABLE public.shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping list items
CREATE TABLE public.shopping_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    food_id UUID REFERENCES public.foods(id),
    custom_name TEXT,
    amount DECIMAL(8,2),
    unit TEXT,
    category TEXT, -- For grouping in store
    is_checked BOOLEAN DEFAULT FALSE,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress tracking
CREATE TABLE public.progress_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type progress_type NOT NULL,
    -- Flexible value based on type
    numeric_value DECIMAL(10,2),
    text_value TEXT,
    json_value JSONB,
    -- Mood/energy specific (1-10 scale)
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    energy_score INTEGER CHECK (energy_score >= 1 AND energy_score <= 10),
    -- Notes
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved meals (favorites)
CREATE TABLE public.saved_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    -- Can be a food or recipe
    food_id UUID REFERENCES public.foods(id),
    recipe_id UUID REFERENCES public.recipes(id),
    meal_type meal_type,
    servings DECIMAL(8,2) DEFAULT 1,
    notes TEXT,
    times_used INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (food_id IS NOT NULL AND recipe_id IS NULL) OR
        (food_id IS NULL AND recipe_id IS NOT NULL)
    )
);

-- User symptoms tracking (for medical mode)
CREATE TABLE public.symptom_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME,
    symptom TEXT NOT NULL,
    severity INTEGER CHECK (severity >= 1 AND severity <= 10),
    triggers TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blood test results tracking (for medical mode)
CREATE TABLE public.blood_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    test_date DATE NOT NULL,
    lab_name TEXT,
    -- Liver Function
    alt DECIMAL(8,2),
    ast DECIMAL(8,2),
    ggt DECIMAL(8,2),
    alkaline_phosphatase DECIMAL(8,2),
    -- Metabolic
    glucose_fasting DECIMAL(8,2),
    hba1c DECIMAL(8,2),
    insulin DECIMAL(8,2),
    -- Lipids
    triglycerides DECIMAL(8,2),
    hdl DECIMAL(8,2),
    ldl DECIMAL(8,2),
    total_cholesterol DECIMAL(8,2),
    -- Inflammation
    crp DECIMAL(8,2),
    ferritin DECIMAL(8,2),
    -- Other common
    vitamin_d DECIMAL(8,2),
    vitamin_b12 DECIMAL(8,2),
    tsh DECIMAL(8,2),
    -- Metadata
    photo_url TEXT, -- For stored lab report photos
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, test_date)
);

-- Meal feedback (for ED-safe mode)
CREATE TABLE public.meal_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    meal_plan_item_id UUID REFERENCES public.meal_plan_items(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5),
    fullness INTEGER CHECK (fullness >= 1 AND fullness <= 5),
    enjoyed BOOLEAN,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Performance indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_foods_name ON public.foods(name);
CREATE INDEX idx_foods_category ON public.foods(category);
CREATE INDEX idx_foods_barcode ON public.foods(barcode);
CREATE INDEX idx_recipes_name ON public.recipes(name);
CREATE INDEX idx_recipes_created_by ON public.recipes(created_by);
CREATE INDEX idx_meal_plans_user_date ON public.meal_plans(user_id, date);
CREATE INDEX idx_meal_plan_items_meal_plan ON public.meal_plan_items(meal_plan_id);
CREATE INDEX idx_shopping_lists_user ON public.shopping_lists(user_id);
CREATE INDEX idx_progress_entries_user_date ON public.progress_entries(user_id, date);
CREATE INDEX idx_saved_meals_user ON public.saved_meals(user_id);
CREATE INDEX idx_symptom_logs_user_date ON public.symptom_logs(user_id, date);
CREATE INDEX idx_blood_tests_user_date ON public.blood_tests(user_id, test_date);
CREATE INDEX idx_blood_tests_user ON public.blood_tests(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_feedback ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Foods policies
CREATE POLICY "Public foods are viewable by all" ON public.foods
    FOR SELECT USING (is_custom = FALSE OR created_by = auth.uid());

CREATE POLICY "Users can create custom foods" ON public.foods
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own custom foods" ON public.foods
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own custom foods" ON public.foods
    FOR DELETE USING (auth.uid() = created_by);

-- Recipes policies
CREATE POLICY "Public recipes are viewable by all" ON public.recipes
    FOR SELECT USING (is_public = TRUE OR created_by = auth.uid());

CREATE POLICY "Users can create recipes" ON public.recipes
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own recipes" ON public.recipes
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own recipes" ON public.recipes
    FOR DELETE USING (auth.uid() = created_by);

-- Recipe ingredients policies
CREATE POLICY "View ingredients for accessible recipes" ON public.recipe_ingredients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE id = recipe_ingredients.recipe_id
            AND (is_public = TRUE OR created_by = auth.uid())
        )
    );

CREATE POLICY "Users can manage ingredients for own recipes" ON public.recipe_ingredients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE id = recipe_ingredients.recipe_id
            AND created_by = auth.uid()
        )
    );

-- Meal plans policies
CREATE POLICY "Users can view own meal plans" ON public.meal_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own meal plans" ON public.meal_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans" ON public.meal_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans" ON public.meal_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Meal plan items policies
CREATE POLICY "Users can manage own meal plan items" ON public.meal_plan_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE id = meal_plan_items.meal_plan_id
            AND user_id = auth.uid()
        )
    );

-- Shopping lists policies
CREATE POLICY "Users can manage own shopping lists" ON public.shopping_lists
    FOR ALL USING (auth.uid() = user_id);

-- Shopping list items policies
CREATE POLICY "Users can manage own shopping list items" ON public.shopping_list_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.shopping_lists
            WHERE id = shopping_list_items.shopping_list_id
            AND user_id = auth.uid()
        )
    );

-- Progress entries policies
CREATE POLICY "Users can manage own progress" ON public.progress_entries
    FOR ALL USING (auth.uid() = user_id);

-- Saved meals policies
CREATE POLICY "Users can manage own saved meals" ON public.saved_meals
    FOR ALL USING (auth.uid() = user_id);

-- Symptom logs policies
CREATE POLICY "Users can manage own symptom logs" ON public.symptom_logs
    FOR ALL USING (auth.uid() = user_id);

-- Blood tests policies
CREATE POLICY "Users can manage own blood tests" ON public.blood_tests
    FOR ALL USING (auth.uid() = user_id);

-- Meal feedback policies
CREATE POLICY "Users can manage own meal feedback" ON public.meal_feedback
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON public.foods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plan_items_updated_at BEFORE UPDATE ON public.meal_plan_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON public.shopping_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_list_items_updated_at BEFORE UPDATE ON public.shopping_list_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_entries_updated_at BEFORE UPDATE ON public.progress_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_meals_updated_at BEFORE UPDATE ON public.saved_meals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate meal plan totals
CREATE OR REPLACE FUNCTION calculate_meal_plan_totals(plan_id UUID)
RETURNS void AS $$
DECLARE
    totals RECORD;
BEGIN
    SELECT 
        SUM(
            CASE 
                WHEN mpi.custom_calories IS NOT NULL THEN mpi.custom_calories * mpi.servings
                WHEN mpi.food_id IS NOT NULL THEN f.calories * mpi.servings / 100 * f.serving_size
                WHEN mpi.recipe_id IS NOT NULL THEN r.calories * mpi.servings
                ELSE 0
            END
        ) as total_calories,
        SUM(
            CASE 
                WHEN mpi.custom_protein_g IS NOT NULL THEN mpi.custom_protein_g * mpi.servings
                WHEN mpi.food_id IS NOT NULL THEN f.protein_g * mpi.servings / 100 * f.serving_size
                WHEN mpi.recipe_id IS NOT NULL THEN r.protein_g * mpi.servings
                ELSE 0
            END
        ) as total_protein,
        SUM(
            CASE 
                WHEN mpi.custom_carbs_g IS NOT NULL THEN mpi.custom_carbs_g * mpi.servings
                WHEN mpi.food_id IS NOT NULL THEN f.carbs_g * mpi.servings / 100 * f.serving_size
                WHEN mpi.recipe_id IS NOT NULL THEN r.carbs_g * mpi.servings
                ELSE 0
            END
        ) as total_carbs,
        SUM(
            CASE 
                WHEN mpi.custom_fat_g IS NOT NULL THEN mpi.custom_fat_g * mpi.servings
                WHEN mpi.food_id IS NOT NULL THEN f.fat_g * mpi.servings / 100 * f.serving_size
                WHEN mpi.recipe_id IS NOT NULL THEN r.fat_g * mpi.servings
                ELSE 0
            END
        ) as total_fat
    INTO totals
    FROM public.meal_plan_items mpi
    LEFT JOIN public.foods f ON mpi.food_id = f.id
    LEFT JOIN public.recipes r ON mpi.recipe_id = r.id
    WHERE mpi.meal_plan_id = plan_id;
    
    UPDATE public.meal_plans
    SET 
        total_calories = totals.total_calories,
        total_protein_g = totals.total_protein,
        total_carbs_g = totals.total_carbs,
        total_fat_g = totals.total_fat
    WHERE id = plan_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate meal plan totals when items change
CREATE OR REPLACE FUNCTION trigger_calculate_meal_plan_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM calculate_meal_plan_totals(OLD.meal_plan_id);
        RETURN OLD;
    ELSE
        PERFORM calculate_meal_plan_totals(NEW.meal_plan_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_meal_plan_totals
AFTER INSERT OR UPDATE OR DELETE ON public.meal_plan_items
    FOR EACH ROW EXECUTE FUNCTION trigger_calculate_meal_plan_totals();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SAMPLE DATA (Optional - for development)
-- ============================================

-- Note: Uncomment below to insert sample data during development

/*
-- Sample foods
INSERT INTO public.foods (name, category, calories, protein_g, carbs_g, fat_g, fiber_g, serving_size, serving_unit) VALUES
('Chicken Breast', 'Protein', 165, 31, 0, 3.6, 0, 100, 'g'),
('Brown Rice', 'Grains', 112, 2.6, 23.5, 0.9, 1.8, 100, 'g'),
('Broccoli', 'Vegetables', 34, 2.8, 7, 0.4, 2.6, 100, 'g'),
('Salmon', 'Protein', 208, 20, 0, 13, 0, 100, 'g'),
('Sweet Potato', 'Vegetables', 86, 1.6, 20, 0.1, 3, 100, 'g'),
('Greek Yogurt', 'Dairy', 59, 10, 3.6, 0.4, 0, 100, 'g'),
('Almonds', 'Nuts', 579, 21, 22, 50, 12.5, 100, 'g'),
('Quinoa', 'Grains', 120, 4.4, 21.3, 1.9, 2.8, 100, 'g'),
('Avocado', 'Fruits', 160, 2, 9, 15, 7, 100, 'g'),
('Eggs', 'Protein', 155, 13, 1.1, 11, 0, 100, 'g');
*/