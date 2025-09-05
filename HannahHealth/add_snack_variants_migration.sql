-- Migration to add snack variant meal types to food_entries table
-- This allows tracking of morning, afternoon, and evening snacks separately

-- First, drop the existing check constraint
ALTER TABLE public.food_entries 
DROP CONSTRAINT IF EXISTS food_entries_meal_type_check;

-- Add the new check constraint with additional snack variants
ALTER TABLE public.food_entries 
ADD CONSTRAINT food_entries_meal_type_check 
CHECK (meal_type IN (
    'breakfast', 
    'lunch', 
    'dinner', 
    'snack',
    'morning snack',
    'afternoon snack', 
    'evening snack'
));

-- Optional: Update any existing generic 'snack' entries to time-based variants
-- based on their created_at timestamp (commented out by default)
/*
UPDATE public.food_entries 
SET meal_type = CASE 
    WHEN EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC') BETWEEN 5 AND 10 THEN 'morning snack'
    WHEN EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC') BETWEEN 11 AND 16 THEN 'afternoon snack'
    WHEN EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC') BETWEEN 17 AND 23 THEN 'evening snack'
    ELSE 'snack'
END
WHERE meal_type = 'snack';
*/