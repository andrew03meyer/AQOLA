from sqlalchemy import Column, String, Float, Integer, ForeignKey, Index, Boolean, DECIMAL, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
import uuid

from api.database import Base

class Postcode(Base):
    __tablename__ = "postcodes"
    
    postcode = Column(String(10), unique=True, nullable=False, index=True, primary_key=True)
    lsoa_id = Column(String(20), nullable=False, index=True)
    postcode_area = Column(String(4))
    postcode_district = Column(String(4))
    postcode_sector = Column(String(5))
    latitude = Column(Float)
    longitude = Column(Float)
    centroid = Column(Geometry('POINT', srid=4326))
    boundary = Column(Geometry('GEOMETRY', srid=4326))
    
    # # Foreign keys
    # lsoa_id = Column(String(20), ForeignKey('lsoas.id'))
    
    # # Relationships
    # zone = relationship("DisplayZone", back_populates="postcodes")



class Lsoa(Base):
    __tablename__ = "lsoas"
    
    lsoa_id = Column(String(10), unique=True, nullable=False, index=True, primary_key=True)
    area_name = Column(String)
    population = Column(Integer)
    area_sq_km = Column(Float)
    boundary = Column(Geometry('GEOMETRY', srid=4326))
    centroid = Column(Geometry('POINT', srid=4326))

class Crime(Base):
    __tablename__ = "crime_data"
    
    crime_id = Column(Integer, unique=True, nullable=False, primary_key=True)
    lsoa_id = Column(String(20), nullable=False, index=True)
    date = Column(String(8))
    latitude = Column(DECIMAL(9, 6))
    longitude = Column(DECIMAL(9, 6))
    crime_type = Column(String)

class Flood(Base):
    __tablename__ = "flood_data"
    
    postcode = Column(String, unique=True, nullable=False, primary_key=True)
    frs_band = Column(String)
    frs_count_high = Column(Integer)
    frs_count_medium = Column(Integer)
    frs_count_low = Column(Integer)
    frs_count_very_low = Column(Integer)

class FloodOccurrences(Base):
    __tablename__ = "flood_occurrences"

    rec_out_id = Column(Integer, unique=True, nullable=False, primary_key=True)
    rec_grp_id = Column(Integer)
    name = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    flood_src = Column(String)
    flood_caus = Column(String)
    hfm_status = Column(String)
    data_src = Column(String)
    fluvial_f = Column(Boolean)	
    coastal_f = Column(Boolean)
    tidal_f	= Column(Boolean)
    boundary = Column(Geometry('GEOMETRY', srid=4326))

class PostcodeFloodOccurrences(Base):
    __tablename__ = "postcodes_flood_occurrences"

    postcode = Column(String, primary_key=True)
    rec_out_id = Column(String, primary_key=True)

    
class School(Base):
    __tablename__ = "school_data"

    urn = Column(String(20), primary_key=True, nullable=False)
    year_range = Column(String(10), primary_key=True, nullable=False)
    school_name = Column(String(255), nullable=False)
    lsoa_id = Column(String(20), index=True)
    postcode = Column(String(10), index=True)
    is_primary = Column(Boolean, nullable=False)
    is_secondary = Column(Boolean, nullable=False)
    is_post16 = Column(Boolean, nullable=False)
    gender = Column(String(6), nullable=False)
    ofsted_ranking = Column(Integer)
    latitude = Column(DECIMAL(9, 6))
    longitude = Column(DECIMAL(9, 6))
    centroid = Column(Geometry('POINT', srid=4326))
