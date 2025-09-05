-- Fix meal type constraint to include snack variants
-- Run this in Supabase SQL Editor

-- First, drop the existing constraint
ALTER TABLE public.food_entries 
DROP CONSTRAINT IF EXISTS food_entries_meal_type_check;

-- Add the new constraint with all meal types including snack variants
ALTER TABLE public.food_entries 
ADD CONSTRAINT food_entries_meal_type_check 
CHECK (meal_type = ANY (ARRAY[
    'breakfast'::text, 
    'lunch'::text, 
    'dinner'::text, 
    'snack'::text,
    'morning snack'::text,
    'afternoon snack'::text,
    'evening snack'::text
]));

-- Verify the constraint was updated
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint
WHERE 
    conrelid = 'public.food_entries'::regclass
    AND conname = 'food_entries_meal_type_check';