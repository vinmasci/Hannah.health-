-- Test query to verify what meal types are allowed in the database
-- Run this in Supabase SQL editor to check the constraint

-- Check the current constraint definition
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint
WHERE 
    conrelid = 'public.food_entries'::regclass
    AND conname = 'food_entries_meal_type_check';

-- Test inserting each meal type (these should all work after migration)
-- Note: These are test inserts that will be rolled back

BEGIN;

-- Test standard meal types
INSERT INTO public.food_entries (user_id, food_name, calories, meal_type)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'Test Breakfast', 100, 'breakfast'),
    ('00000000-0000-0000-0000-000000000000', 'Test Lunch', 100, 'lunch'),
    ('00000000-0000-0000-0000-000000000000', 'Test Dinner', 100, 'dinner'),
    ('00000000-0000-0000-0000-000000000000', 'Test Snack', 100, 'snack');

-- Test new snack variants
INSERT INTO public.food_entries (user_id, food_name, calories, meal_type)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'Test Morning Snack', 100, 'morning snack'),
    ('00000000-0000-0000-0000-000000000000', 'Test Afternoon Snack', 100, 'afternoon snack'),
    ('00000000-0000-0000-0000-000000000000', 'Test Evening Snack', 100, 'evening snack');

-- Test NULL meal type (for exercise)
INSERT INTO public.food_entries (user_id, food_name, calories, meal_type)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'Test Exercise', -100, NULL);

-- If we get here, all inserts worked!
SELECT 'All meal types are valid!' AS result;

-- Roll back the test inserts
ROLLBACK;