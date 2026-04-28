/*NOTE: This query performs vaidation beyond standard schema constraints. While
NOT NULL constraints exist in the schema, they do not catch logically incorrect nulls/values.

This means
- whitespace or empty strings checked by Regex (~ '^\s*$')
- Malformed strings are not there checked by TRIM()
- 'NaN' or negative values
- coordinates have appropriate values/bounds restricted to Kent.
    - latitude bounds: South(50.88 degrees) to North(51.52 degrees)
    - longitude bounds: West(0.01  degrees) to East(1.47 degrees)
- no negative values where appropriate
- ST_IsEmpty is used to check if the spatial area geometries are empty
- tables themselves are not empty
*/

WITH completeness_failures AS (

    -- LSOAs
    SELECT 'lsoas' AS tbl, 'lsoa_id' AS col, 'Logical Null (Empty/Spaces)' AS issue, lsoa_id::text AS row_id
    FROM lsoas WHERE lsoa_id ~ '^\s*$'
    UNION ALL
    SELECT 'lsoas', 'lsoa_id', 'Malformed (Trailing/Leading Space)', lsoa_id::text
    FROM lsoas WHERE lsoa_id != TRIM(lsoa_id)
    UNION ALL
    SELECT 'lsoas', 'area_name', 'Logical Null (Empty/Spaces)', lsoa_id::text
    FROM lsoas WHERE area_name ~ '^\s*$'
    UNION ALL
    SELECT 'lsoas', 'boundary', 'Empty Geometry', lsoa_id::text
    FROM lsoas WHERE ST_IsEmpty(boundary)
    UNION ALL
    SELECT 'lsoas', 'centroid', 'Empty Geometry', lsoa_id::text
    FROM lsoas WHERE ST_IsEmpty(centroid)
    UNION ALL
    SELECT 'lsoas', 'avg_property_price', 'Unpopulated/Null Price', lsoa_id::text
    FROM lsoas WHERE avg_property_price IS NULL OR avg_property_price = 0
    UNION ALL
    SELECT 'lsoas', 'lsoa_id', 'Duplicate Key', lsoa_id
    FROM lsoas GROUP BY lsoa_id HAVING COUNT(*) > 1
    UNION ALL
    SELECT 'lsoas', 'ALL', 'TABLE IS EMPTY', '0'
    WHERE (SELECT COUNT(*) FROM lsoas) = 0

    UNION ALL

    -- Postcodes
    SELECT 'postcodes', 'postcode', 'Logical Null (Empty/Spaces)', postcode::text
    FROM postcodes WHERE postcode ~ '^\s*$'
    UNION ALL
    SELECT 'postcodes', 'postcode', 'Malformed (Trailing/Leading Space)', postcode::text
    FROM postcodes WHERE postcode != TRIM(postcode)
    UNION ALL
    SELECT 'postcodes', 'lsoa_id', 'Malformed (Trailing Space)', postcode::text
    FROM postcodes WHERE lsoa_id != TRIM(lsoa_id)
    UNION ALL
    SELECT 'postcodes', 'avg_property_price', 'Unpopulated/Null Price', postcode::text
    FROM postcodes WHERE avg_property_price IS NULL OR avg_property_price = 0
    UNION ALL
    SELECT 'postcodes', 'postcode', 'Duplicate Key', postcode
    FROM postcodes GROUP BY postcode HAVING COUNT(*) > 1
    UNION ALL
    SELECT 'postcodes', 'ALL', 'TABLE IS EMPTY', '0'
    WHERE (SELECT COUNT(*) FROM postcodes) = 0
    UNION ALL

    --Crime data
    SELECT 'crime_data', 'crime_type', 'Logical Null (Empty/Spaces)', crime_id::text
    FROM crime_data WHERE crime_type ~ '^\s*$'
    UNION ALL
    SELECT 'crime_data', 'crime_type', 'Malformed (Trailing/Leading Space)', crime_id::text
    FROM crime_data WHERE crime_type != TRIM(crime_type)
    UNION ALL
    SELECT 'crime_data', 'latitude', 'Out of Kent Bounds', crime_id::text
    FROM crime_data WHERE latitude NOT BETWEEN 50.88 AND 51.52
    UNION ALL
    SELECT 'crime_data', 'longitude', 'Out of Kent Bounds', crime_id::text
    FROM crime_data WHERE longitude NOT BETWEEN 0.01 AND 1.47
    UNION ALL
    SELECT 'crime_data', 'ALL', 'TABLE IS EMPTY', '0'
    WHERE (SELECT COUNT(*) FROM crime_data) = 0

    UNION ALL

    -- School Data
    SELECT 'school_data' AS tbl, 'urn' AS col, 'Logical Null (Empty/Spaces)' AS issue, urn::text AS row_id
    FROM school_data WHERE urn::text ~ '^\s*$'
    UNION ALL
    SELECT 'school_data', 'school_name', 'Logical Null (Empty/Spaces)', urn::text
    FROM school_data WHERE school_name ~ '^\s*$'
    UNION ALL
    SELECT 'school_data', 'urn', 'Malformed (Trailing/Leading Space)', urn::text
    FROM school_data WHERE urn::text != TRIM(urn::text)
    UNION ALL
    SELECT 'school_data', 'school_name', 'Malformed (Trailing/Leading Space)', urn::text
    FROM school_data WHERE school_name != TRIM(school_name)
    UNION ALL
    SELECT 'school_data', 'ofsted_ranking', 'Invalid Ranking Value (Outside -1 to 4)', urn::text
    FROM school_data WHERE ofsted_ranking < -1 OR ofsted_ranking > 4
    UNION ALL
    SELECT 'school_data', 'year_range', 'Invalid Year Format (Expects YYYY-YYYY)', urn::text
    FROM school_data WHERE year_range !~ '^\d{4}-\d{4}$'
    UNION ALL
    SELECT 'school_data', 'latitude', 'Out of Kent Bounds', urn::text
    FROM school_data WHERE latitude IS NOT NULL AND (latitude NOT BETWEEN 50.88 AND 51.52)
    UNION ALL
    SELECT 'school_data', 'longitude', 'Out of Kent Bounds', urn::text
    FROM school_data WHERE longitude IS NOT NULL AND (longitude NOT BETWEEN 0.01 AND 1.47)
    UNION ALL
    SELECT 'school_data', 'centroid', 'Empty Geometry', urn::text
    FROM school_data WHERE centroid IS NOT NULL AND ST_IsEmpty(centroid)
    UNION ALL
    SELECT 'school_data', 'urn/year_range', 'Duplicate URN for same Year', urn || ' (' || year_range || ')'
    FROM school_data GROUP BY urn, year_range HAVING COUNT(*) > 1
    UNION ALL
    SELECT 'school_data', 'ALL', 'TABLE IS EMPTY', '0'
    WHERE (SELECT COUNT(*) FROM school_data) = 0

    UNION ALL

  -- Property Data
    SELECT 'property_data', 'street', 'Logical Null (Empty/Spaces)', property_id::text
    FROM property_data WHERE street ~ '^\s*$'
    UNION ALL
    SELECT 'property_data', 'full_address', 'Logical Null (Empty/Spaces)', property_id::text
    FROM property_data WHERE full_address ~ '^\s*$'
    UNION ALL
    SELECT 'property_data', 'property_type', 'Invalid Type Code', property_id::text
    FROM property_data WHERE property_type NOT IN ('D', 'S', 'T', 'F', 'O')
    UNION ALL
    SELECT 'property_data', 'latitude', 'Out of Kent Bounds', property_id::text
    FROM property_data WHERE latitude NOT BETWEEN 50.88 AND 51.52
    UNION ALL
    SELECT 'property_data', 'longitude', 'Out of Kent Bounds', property_id::text
    FROM property_data WHERE longitude NOT BETWEEN 0.01 AND 1.47
    UNION ALL
    SELECT 'property_data', 'boundary', 'Empty Geometry', property_id::text
    FROM property_data WHERE ST_IsEmpty(boundary)
    UNION ALL
    SELECT 'property_data', 'centroid', 'Empty Geometry', property_id::text
    FROM property_data WHERE ST_IsEmpty(centroid)
    UNION ALL
    SELECT 'property_data', 'ALL', 'TABLE IS EMPTY', '0'
    WHERE (SELECT COUNT(*) FROM property_data) = 0

    UNION ALL

    -- Property Transactions
    SELECT 'property_transactions', 'price', 'Negative or Zero Price', transaction_id
    FROM property_transactions WHERE price <= 0
    UNION ALL
    SELECT 'property_transactions', 'price', 'Extreme Outlier (> 20M)', transaction_id
    FROM property_transactions WHERE price > 20000000
    UNION ALL
    SELECT 'property_transactions', 'sale_date', 'Future Date (Logical Error)', transaction_id
    FROM property_transactions WHERE sale_date > CURRENT_DATE
    UNION ALL
    SELECT 'property_transactions', 'sale_date', 'Pre-Data Era (< 1995)', transaction_id
    FROM property_transactions WHERE sale_date < '1995-01-01'
    UNION ALL
    SELECT 'property_transactions', 'ALL', 'TABLE IS EMPTY', '0'
    WHERE (SELECT COUNT(*) FROM property_transactions) = 0
    
)
SELECT tbl, col, issue, COUNT(*) AS issue_count, ARRAY_AGG(row_id) AS failing_ids
FROM completeness_failures
GROUP BY tbl, col, issue;