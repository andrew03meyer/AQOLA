import pytest
import os

# --- SETUP PATHS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCHEMA_SQL_PATH = os.path.join(BASE_DIR, '..', 'database', 'init', 'schema_integrity_validation.sql')
DATA_QUALITY_SQL_PATH = os.path.join(BASE_DIR, '..', 'database', 'init', 'data_quality_validation.sql')

# ---  DEFINE EXPECTED SCHEMA SPECS ---
EXPECTED_TABLES = ['lsoas', 'postcodes', 'crime_data', 'school_data','property_data', 'property_transactions']

# Format: (table, column, type, nullable)
EXPECTED_COLUMNS = {

    ('lsoas', 'lsoa_id', 'character varying', 'NO'),       # VARCHAR(20)
    ('lsoas', 'area_name', 'character varying', 'NO'),     # VARCHAR(100)
    ('lsoas', 'population', 'integer', 'YES'),             # INT (Nullable)
    ('lsoas', 'area_sq_km', 'numeric', 'YES'),             # DECIMAL(10,4) (Nullable)
    ('lsoas', 'boundary', 'USER-DEFINED', 'NO'),           # GEOMETRY(MULTIPOLYGON, 4326)
    ('lsoas', 'centroid', 'USER-DEFINED', 'NO'),           # GEOMETRY(POINT, 4326)

    ('postcodes', 'postcode', 'character varying', 'NO'),             # VARCHAR(10)
    ('postcodes', 'lsoa_id', 'character varying', 'NO'),              # VARCHAR(20) (Foreign Key)
    ('postcodes', 'postcode_area', 'character varying', 'NO'),        # VARCHAR(4)
    ('postcodes', 'postcode_district', 'character varying', 'NO'),    # VARCHAR(4)
    ('postcodes', 'postcode_sector', 'character varying', 'NO'),      # VARCHAR(5)
    ('postcodes', 'latitude', 'numeric', 'NO'),                       # DECIMAL(9,6)
    ('postcodes', 'longitude', 'numeric', 'NO'),                      # DECIMAL(9,6)
    ('postcodes', 'centroid', 'USER-DEFINED', 'NO'),                  # GEOMETRY(POINT, 4326)
    ('postcodes', 'boundary', 'USER-DEFINED', 'NO'),                  # GEOMETRY(MULTIPOLYGON, 4326)

    ('crime_data', 'crime_id', 'integer', 'NO'),                            # SERIAL
    ('crime_data', 'lsoa_id', 'character varying', 'NO'),             # VARCHAR(20) (Foreign Key)
    ('crime_data', 'date', 'date', 'NO'),                             # DATE
    ('crime_data', 'latitude', 'numeric', 'NO'),                      # DECIMAL(9,6)
    ('crime_data', 'longitude', 'numeric', 'NO'),                     # DECIMAL(9,6)
    ('crime_data', 'crime_type', 'character varying', 'NO'),
    
    ('school_data', 'urn', 'character varying', 'NO'),              # VARCHAR(20)
    ('school_data', 'lsoa_id', 'character varying', 'YES'),          # VARCHAR(20) (FK) (Nullable)
    ('school_data', 'school_name', 'character varying', 'NO'),      # VARCHAR(255)
    ('school_data', 'postcode', 'character varying', 'YES'),          # VARCHAR(10) (FK) (Nullable)
    ('school_data', 'is_primary', 'boolean', 'NO'),                 # BOOLEAN
    ('school_data', 'is_secondary', 'boolean', 'NO'),               # BOOLEAN
    ('school_data', 'is_post16', 'boolean', 'NO'),                  # BOOLEAN
    ('school_data', 'gender', 'character varying', 'NO'),           # VARCHAR(6)
    ('school_data', 'year_range', 'character varying', 'NO'),       # VARCHAR(10)
    ('school_data', 'ofsted_ranking', 'integer', 'YES'),            # INT (Nullable)
    ('school_data', 'centroid', 'USER-DEFINED', 'YES'),             # GEOMETRY (Nullable)
    ('school_data', 'latitude', 'numeric', 'YES'),                  # DECIMAL (Nullable)
    ('school_data', 'longitude', 'numeric', 'YES'),                  # DECIMAL (Nullable)
    
    # property_data Table
    ('property_data', 'property_id', 'integer', 'NO'),                # SERIAL
    ('property_data', 'paon', 'character varying', 'YES'),            # VARCHAR(100)
    ('property_data', 'saon', 'character varying', 'YES'),            # VARCHAR(100)
    ('property_data', 'street', 'character varying', 'NO'),           # VARCHAR(255)
    ('property_data', 'full_address', 'text', 'NO'),                  # TEXT
    ('property_data', 'postcode', 'character varying', 'YES'),        # VARCHAR(10) (FK)
    ('property_data', 'property_type', 'character', 'NO'),            # CHAR(1)
    ('property_data', 'boundary', 'USER-DEFINED', 'NO'),              # GEOMETRY

    # property_transactions Table
    ('property_transactions', 'transaction_id', 'character varying', 'NO'), # VARCHAR(45)
    ('property_transactions', 'property_id', 'integer', 'NO'),               # INT (FK)
    ('property_transactions', 'sale_date', 'date', 'NO'),                    # DATE
    ('property_transactions', 'price', 'integer', 'NO')                     # INT
    }

# Format: (table, type, column)
EXPECTED_KEYS = {
    ('lsoas', 'PRIMARY KEY', 'lsoa_id'),
    
    ('postcodes', 'PRIMARY KEY', 'postcode'),
    ('postcodes', 'FOREIGN KEY', 'lsoa_id'),
    
    ('crime_data', 'PRIMARY KEY', 'crime_id'),
    ('crime_data', 'FOREIGN KEY', 'lsoa_id'),
    
    ('school_data', 'PRIMARY KEY', 'urn'),
    ('school_data', 'PRIMARY KEY', 'year_range'),
    ('school_data', 'FOREIGN KEY', 'lsoa_id'),
    ('school_data', 'FOREIGN KEY', 'postcode'),
    
    ('property_data', 'PRIMARY KEY', 'property_id'),
    ('property_data', 'FOREIGN KEY', 'postcode'),

    ('property_transactions', 'PRIMARY KEY', 'transaction_id'),
    ('property_transactions', 'FOREIGN KEY', 'property_id')
}

# ---  TEST CLASSES ---

class TestSchemaIntegrity:
    """
    Validates the 3NF Structural integrity:
    - Connectivity
    - Table Existence
    - Column Definitions
    - Keys & Constraints
    """

    @pytest.fixture(scope="class")
    # Helper function to read the SQL files.
    def schema_queries(self):
        with open(SCHEMA_SQL_PATH) as f:
            content = f.read()
        return [q.strip() for q in content.split(';') if q.strip()]

    # Smoke test to ensure DB is reachable.
    def test_db_connection(self, db_conn):
        assert db_conn.closed == 0, "Connection should be open"
        with db_conn.cursor() as cur:
            cur.execute("SELECT 1;")
            assert cur.fetchone()[0] == 1

    # Checks if all critical tables and PostGIS extension are present.
    def test_tables_and_postgis_exist(self, db_conn, schema_queries):
        with db_conn.cursor() as cur:
            cur.execute(schema_queries[0])
            found_tables = [row[0] for row in cur.fetchall()]
            
            for table in EXPECTED_TABLES:
                assert table in found_tables, f"Missing critical table: {table}"
            
            assert 'spatial_ref_sys' in found_tables, "PostGIS extension is missing"

    def test_columns_match_specs(self, db_conn, schema_queries):
        # Verifies that all columns match the expected data types and nullability.
        with db_conn.cursor() as cur:
            cur.execute(schema_queries[1])
            # columns from DB: (table, col, type, nullable)
            actual_columns = {(r[0], r[1], r[2], r[3]) for r in cur.fetchall()}

            missing = EXPECTED_COLUMNS - actual_columns
            
            assert not missing, f"Missing or incorrect columns found:\n{missing}"

    def test_keys_and_constraints(self, db_conn, schema_queries):
        # Verifies Primary and Foreign Keys are correctly established.
        with db_conn.cursor() as cur:
            cur.execute(schema_queries[2])
            #Fetch actual keys: (table, type, column)
            actual_keys = {(r[0], r[2], r[3]) for r in cur.fetchall()}

            missing = EXPECTED_KEYS - actual_keys
            
            assert not missing, f"Missing constraints:\n{missing}"


class TestDataQuality:
    """
    Validates Data Content:
    - Kent Geofencing
    - Null Checks
    - Logical Consistency
    """

    def test_kent_data_quality(self, db_conn):
        # Runs the data quality SQL script. Fails if ANY rows are returned.
        with db_conn.cursor() as cur:
            with open(DATA_QUALITY_SQL_PATH) as f:
                # Execute the entire script
                cur.execute(f.read())
            
                issues = cur.fetchall()

                # Build a readable error message if issues exist
                if issues:
                    error_msg = "\n".join(
                        [f"Table: {r[0]} | Col: {r[1]} | Error: {r[2]} | Count: {r[3]}" for r in issues]
                    )
                    # pytest.fail() is used instead of assert as it is processing a specified report about the issue
                    pytest.fail(f"Data Quality Violations Found:\n{error_msg}")