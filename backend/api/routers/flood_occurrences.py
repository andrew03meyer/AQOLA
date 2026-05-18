from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from api.database import get_db
from api.models.db_models import FloodOccurrences, PostcodeFloodOccurrences
from api.models.response_models.flood_occurrences import FloodOccurrencesResponse

from geoalchemy2.shape import to_shape
from shapely.geometry import mapping


router = APIRouter()

@router.get("/")
async def list_flood_occurrences(
    db: Session = Depends(get_db)):
    """List all flood occurrences data"""
    query = (
        db.query(FloodOccurrences)
    )
    
    floodOccurrenceData = query.all()

    if not floodOccurrenceData:
        raise HTTPException(status_code=404, detail="No flood occurrence records found.")

    return [
        FloodOccurrencesResponse(
            rec_out_id = floodOccurrenceRow.rec_out_id,
            rec_grp_id = floodOccurrenceRow.rec_grp_id,
            name = floodOccurrenceRow.name,
            start_date = floodOccurrenceRow.start_date,
            end_date = floodOccurrenceRow.end_date,
            flood_src = floodOccurrenceRow.flood_src,
            flood_caus = floodOccurrenceRow.flood_caus,
            hfm_status = floodOccurrenceRow.hfm_status,
            data_src = floodOccurrenceRow.data_src,
            fluvial_f = floodOccurrenceRow.fluvial_f,
            coastal_f = floodOccurrenceRow.coastal_f,
            tidal_f	= floodOccurrenceRow.tidal_f,
            boundary=mapping(to_shape(floodOccurrenceRow.boundary))
        )
        for floodOccurrenceRow in floodOccurrenceData
    ]

@router.get("/timeline")
async def list_flood_occurrence_timelines(
    postcodes: list[str] = Query(default=[]),
    db: Session = Depends(get_db)
):
    """Return flood occurrence counts per year, optionally filtered by postcodes."""
    query = db.query(
        extract("year", FloodOccurrences.start_date).label("year"),
        func.count(FloodOccurrences.rec_out_id).label("count")
    )

    if postcodes:
        query = query.join(
            PostcodeFloodOccurrences,
            FloodOccurrences.rec_out_id == PostcodeFloodOccurrences.rec_out_id
        ).filter(PostcodeFloodOccurrences.postcode.in_(postcodes))

    query = query.group_by("year").order_by("year")
    results = query.all()

    if not results:
        raise HTTPException(status_code=404, detail="No flood occurrence records found.")

    return {str(int(row.year)): row.count for row in results}
