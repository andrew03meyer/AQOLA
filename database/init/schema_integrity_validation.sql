-- Query to verify that all necessary tables are present according to  schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ( 
    'lsoas', 
    'postcodes', 
    'crime_data', 
    'spatial_ref_sys',
    'school_data',
    'property_data',
    'property_transactions'
);

-- Query to check the correct columns, data types are present in each table and NULL constraints enforced
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN (
    'lsoas',
    'postcodes',
    'crime_data',
    'school_data',
    'property_data',
    'property_transactions')
ORDER BY table_name, column_name;

-- Query to check the relational constraints (Primary and Foreign Keys)
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu 
    ON tc.constraint_name = kcu.constraint_name 
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public' 
AND tc.table_name IN (
    'lsoas',
    'postcodes',
    'crime_data', 
    'school_data', 
    'property_data',
    'property_transactions')
AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY')
ORDER BY tc.table_name;
