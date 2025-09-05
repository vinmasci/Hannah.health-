-- Check what meal types are currently allowed by the constraint
-- Run this in Supabase SQL editor

-- Method 1: Check the constraint definition directly
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint
WHERE 
    conrelid = 'public.food_entries'::regclass
    AND conname = 'food_entries_meal_type_check';

-- Method 2: Check the column information
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    check_clause
FROM 
    information_schema.columns c
    LEFT JOIN information_schema.check_constraints cc 
        ON cc.constraint_name = 'food_entries_meal_type_check'
WHERE 
    c.table_schema = 'public'
    AND c.table_name = 'food_entries'
    AND c.column_name = 'meal_type';

-- Method 3: Get all check constraints on the table
SELECT 
    conname,
    pg_get_constraintdef(oid)
FROM 
    pg_constraint
WHERE 
    conrelid = 'public.food_entries'::regclass
    AND contype = 'c';