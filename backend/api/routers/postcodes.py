from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from geoalchemy2.functions import ST_AsGeoJSON, ST_Intersects, ST_MakeEnvelope
import json

from api.database import get_db
from api.models.db_models import Postcode
from api.models.response_models.postcode import PostcodeResponse, PostcodePolygonResponse
from api.models.response_models.polygon import GeometryModel


router = APIRouter()


@router.get("/", response_model=List[PostcodeResponse])
async def list_postcodes(
    postcodes: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db)):
    """List postcodes"""
    query = (
        db.query(Postcode)
    )

    if postcodes:
        query = query.filter(Postcode.postcode.in_([postcode.replace(" ", "") for postcode in postcodes]))
    
    results = query.all()

    if not results:
        raise HTTPException(status_code=404, detail="No records found. Double check the postcode(s) entered")

    return [
        PostcodeResponse(
            postcode=p.postcode,
            lsoa_id=p.lsoa_id,
            postcode_area=p.postcode_area,
            postcode_district=p.postcode_district,
            postcode_sector=p.postcode_sector,
            latitude=float(p.latitude),
            longitude=float(p.longitude),
            centroid=p.centroid,
            boundary=p.boundary
        )
        for p in results
    ]

@router.get("/geometry", response_model=List[PostcodePolygonResponse])
async def list_postcodes(min_lat: float, max_lat: float, min_lng: float, max_lng: float, db: Session = Depends(get_db)):
    """List postcodes"""
    
    print(f"Bounds received: min_lat={min_lat}, max_lat={max_lat}, min_lng={min_lng}, max_lng={max_lng}")


    postcodes = (
        db.query(
            Postcode.postcode,
            ST_AsGeoJSON(Postcode.boundary).label("boundary")
        ).filter (
            ST_Intersects(
                Postcode.boundary,
                ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
            )
        )
        .all()
    )

    if not postcodes:
        raise HTTPException(status_code=404, detail="No records found. Double check the postcode(s) entered")

    postcode_polygons = []

    if len(postcodes) == 0:
        return postcode_polygons    

    for postcode_record in postcodes:
        boundary_json = json.loads(postcode_record.boundary)
        postcode_polygons.append(PostcodePolygonResponse(boundary=GeometryModel(type=boundary_json["type"], coordinates=boundary_json["coordinates"]), postcode=postcode_record.postcode))


    return postcode_polygons


# @router.get("/{postcode}", response_model=PostcodeResponse)
# async def get_postcode(postcode: str, db: Session = Depends(get_db)):
#     """Get postcode by postcode string"""
#     postcode_record = (
#         db.query(Postcode)
#         .filter(func.lower(Postcode.postcode) == func.lower(postcode))
#         .first()
#     )

#     if not postcode_record:
#         raise HTTPException(status_code=404, detail="Postcode not found")

#     return PostcodeResponse(
#         postcode=postcode_record.postcode,
#         lsoa_id=postcode_record.lsoa_id,
#         postcode_area=postcode_record.postcode_area,
#         postcode_district=postcode_record.postcode_district,
#         postcode_sector=postcode_record.postcode_sector,
#         latitude=postcode_record.latitude,
#         longitude=postcode_record.longitude,
#         centroid=postcode_record.centroid,
#         boundary=postcode_record.boundary
#     )

# @router.get("/{postcode}/geometry", response_model=PostcodePolygonResponse)
# async def get_postcode_polygon(postcode:str, db: Session = Depends(get_db)):
#     """Get postcode by postcode string"""
#     postcode_record = (
#         db.query(
#             Postcode.postcode,
#             ST_AsGeoJSON(Postcode.boundary).label("boundary")
#                  )
#         .filter(func.lower(Postcode.postcode) == func.lower(postcode))
#         .first()
#     )

#     if not postcode_record:
#         raise HTTPException(status_code=404, detail="Postcode not found")
    
#     boundary_json = json.loads(postcode_record.boundary)
#     boundary = GeometryModel(type=boundary_json["type"], coordinates=boundary_json["coordinates"])


    

#     return PostcodePolygonResponse(
#         postcode=postcode_record.postcode,
#         boundary=boundary
#     )