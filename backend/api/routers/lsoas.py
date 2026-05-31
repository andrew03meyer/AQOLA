from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from api.database import get_db
from sqlalchemy import func
from typing import List, Optional
import json


from geoalchemy2.functions import ST_AsGeoJSON, ST_Intersects, ST_MakeEnvelope

from api.models.response_models.polygon import GeometryModel
from api.models.response_models.lsoa import LsoaResponse, LsoaPolygonResponse
from api.models.db_models import Lsoa
from geoalchemy2.shape import to_shape

router = APIRouter()

def wkb_to_geometry_dict(wkb_element) -> dict:
    shape = to_shape(wkb_element)
    return {
        "type": shape.geom_type,
        "coordinates": list(shape.__geo_interface__["coordinates"])
    }

@router.get("/", response_model=List[LsoaResponse])
async def list_lsoas(
    lsoas: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db)):

    """List all lsoas"""
    query = (
        db.query(Lsoa)
    )

    if lsoas:
        query = query.filter(Lsoa.lsoa_id.in_(lsoas))

    results = query.all()

    if not results:
        raise HTTPException(status_code=404, detail="No records found. Double check the lsoa(s) entered")

    return [
        LsoaResponse(
            lsoa_id=result.lsoa_id,
            area_name=result.area_name,
            population=result.population,
            area_sq_km=result.area_sq_km,
            boundary=wkb_to_geometry_dict(result.boundary),
            centroid=wkb_to_geometry_dict(result.centroid),
        )
        for result in results
    ]

# This endpoint retrieves LSOA boundaries that intersect with a given bounding box defined by min/max latitude and longitude. 
# It returns the LSOA ID and its boundary as GeoJSON.
@router.get("/geometry", response_model=List[LsoaPolygonResponse])
async def list_lsoas(min_lat: float, max_lat: float, min_lng: float, max_lng: float, db: Session = Depends(get_db)):
    """List postcodes"""
    
    print(f"Bounds received: min_lat={min_lat}, max_lat={max_lat}, min_lng={min_lng}, max_lng={max_lng}")

    # Get all LSOAs that intersect with the bounding box defined by the input coordinates. 
    # Use ST_AsGeoJSON to convert the geometry to GeoJSON format for easier handling on the frontend.
    lsoas = (
        db.query(
            Lsoa.lsoa_id,
            ST_AsGeoJSON(Lsoa.boundary).label("boundary")
        ).filter (
            ST_Intersects(
                Lsoa.boundary,
                ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
            )
        )
        .all()
    )

    # If no LSOAs are found that intersect with the bounding box, return a 404 error.
    if not lsoas:
        raise HTTPException(status_code=404, detail="No records found. Double check the lsoa(s) entered")

    lsoa_polygons = []

    # If no LSOAs are found that intersect with the bounding box, return an empty list instead of a 404 error. 
    if len(lsoas) == 0:
        return lsoa_polygons    

    # Return the LSOA ID and its boundary as GeoJSON for each LSOA that intersects with the bounding box.
    for lsoa_record in lsoas:
        boundary_json = json.loads(lsoa_record.boundary)
        lsoa_polygons.append(LsoaPolygonResponse(boundary=GeometryModel(type=boundary_json["type"], coordinates=boundary_json["coordinates"]), lsoa=lsoa_record.lsoa_id))


    return lsoa_polygons
