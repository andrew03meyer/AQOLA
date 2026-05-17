CREATE EXTENSION IF NOT EXISTS postgis;
-- Drop child tables first (those that reference others)
DROP TABLE IF EXISTS property_transactions;
DROP TABLE IF EXISTS property_data;
DROP TABLE IF EXISTS kent_property_averages;
DROP TABLE IF EXISTS school_data;
DROP TABLE IF EXISTS flood_data;
DROP TABLE IF EXISTS crime_data;

-- Drop secondary parent tables
DROP TABLE IF EXISTS postcodes;

-- Drop base parent tables last
DROP TABLE IF EXISTS statistical_areas;
DROP TABLE IF EXISTS lsoas;
DROP TABLE IF EXISTS display_zones;

CREATE TABLE IF NOT EXISTS lsoas (
    lsoa_id VARCHAR(20) PRIMARY KEY,    
    area_name VARCHAR(100) NOT NULL,
    population INT,
    area_sq_km DECIMAL(10,4),
    boundary GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
    centroid GEOMETRY(POINT, 4326) NOT NULL,
    avg_property_price INT
);


CREATE TABLE IF NOT EXISTS postcodes (
    postcode VARCHAR(10) PRIMARY KEY,
    lsoa_id VARCHAR(20) NOT NULL REFERENCES lsoas(lsoa_id) ON DELETE CASCADE,
    postcode_area VARCHAR(4) NOT NULL,
    postcode_district VARCHAR(4) NOT NULL,
    postcode_sector VARCHAR(5) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    boundary GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
    centroid GEOMETRY(POINT, 4326) NOT NULL,
    avg_property_price INT
);

CREATE TABLE IF NOT EXISTS crime_data (
    crime_id SERIAL PRIMARY KEY,
    lsoa_id VARCHAR(20) NOT NULL REFERENCES lsoas(lsoa_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    crime_type VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS flood_data (
    flood_id SERIAL PRIMARY KEY,
    postcode VARCHAR(10) NOT NULL REFERENCES postcodes(postcode) ON DELETE CASCADE,
    frs_band VARCHAR(20),
    frs_count_high INT,
    frs_count_medium INT,
    frs_count_low INT,
    frs_count_very_low INT
);

CREATE TABLE IF NOT EXISTS school_data (
    urn VARCHAR(20) NOT NULL,
    lsoa_id VARCHAR(20) NOT NULL REFERENCES lsoas(lsoa_id) ON DELETE CASCADE,
    school_name VARCHAR(255) NOT NULL,
    postcode VARCHAR(10) NOT NULL REFERENCES postcodes(postcode) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL,
    is_secondary BOOLEAN NOT NULL,
    is_post16 BOOLEAN NOT NULL,
    gender VARCHAR(6) NOT NULL,
    year_range VARCHAR(10) NOT NULL,
    ofsted_ranking INT,
    centroid GEOMETRY(POINT, 4326),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    PRIMARY KEY (urn, year_range)
);

CREATE TABLE IF NOT EXISTS property_data (
    property_id VARCHAR(15) PRIMARY KEY, 
    full_address TEXT NOT NULL,        
    postcode VARCHAR(10) NOT NULL REFERENCES postcodes(postcode) ON DELETE CASCADE,
    lsoa_id VARCHAR(20) NOT NULL REFERENCES lsoas(lsoa_id) ON DELETE CASCADE,
    property_type CHAR(1) NOT NULL,   -- D, S, T, F, O
    square_meters INT NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL
);

CREATE TABLE IF NOT EXISTS property_transactions (
    transaction_id VARCHAR(45) PRIMARY KEY,
    property_id VARCHAR(15) REFERENCES property_data(property_id) ON DELETE CASCADE,
    is_new_build CHAR(1) NOT NULL,     -- Y = a newly built property, N = an established residential building
    sale_date DATE NOT NULL,
    price INT NOT NULL,
    price_per_sqm INT
);

CREATE TABLE IF NOT EXISTS kent_property_averages (
     property_type CHAR(1) NOT NULL,   -- D, S, T, F (discount O for averages)
     period VARCHAR(7) NOT NULL,  --e.g. Q1-1995 meaning 1st quarter months in 1995
     avg_price INT NOT NULL,
     avg_price_sqm INT,
     count INT,

     PRIMARY KEY (property_type, period)
);


-- INSERT INTO lsoas (lsoa_id, area_name, population, area_sq_km, boundary, centroid)
-- VALUES
--     ('E01024101', 'Canterbury 013C', 1500, 0.85,
--     ST_GeomFromText('MULTIPOLYGON(((-0.573 51.280, -0.570 51.280, -0.570 51.282, -0.573 51.282, -0.573 51.280)))', 4326),
--     ST_GeomFromText('POINT(-0.5715 51.281)', 4326)
--     );

-- INSERT INTO postcodes (lsoa_id, postcode, postcode_area, postcode_district, postcode_sector, latitude, longitude, centroid, boundary)
-- VALUES
--     ('E01024101', 'CT2 7QS', 'CT', 'CT2', 'CT2 7', 51.294936, 1.0888,
--     ST_GeomFromText('POINT(51.294936 1.0888)', 4326),
--     ST_GeomFromText('MULTIPOLYGON(((-0.573 51.280, -0.570 51.280, -0.570 51.282, -0.573 51.282, -0.573 51.280)))', 4326)
--     );

-- INSERT INTO crime_data (lsoa_id, date, latitude, longitude, crime_type)
-- VALUES
--     ('E01024101', '2024-05-15', 51.2815, 1.0710, 'Burglary');  
