from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from api.database import get_db
from api.models.db_models import Crime
from api.models.response_models.crime import ListStringsResponse, CrimeResponse, ListDatesResponse, CrimeRateResponse
from datetime import date
from typing import List, Optional
from sqlalchemy import func
from collections import defaultdict
from datetime import datetime
from dateutil.relativedelta import relativedelta

router = APIRouter()

@router.get("/", response_model=List[CrimeResponse])
async def list_crime(
    lsoas: Optional[List[str]] = None,
    db: Session = Depends(get_db)
):
    """List all crime"""
    query = db.query(Crime)

    if lsoas:
        query = query.filter(Crime.lsoa_id.in_(lsoas))

    crimes = query.all()

    if not crimes:
        raise HTTPException(status_code=404, detail="No records found. Double check the lsoa(s) entered")

    return [
        CrimeResponse(
            crime_id=crime.crime_id,
            lsoa_id=crime.lsoa_id,
            date=crime.date,
            latitude=crime.latitude,
            longitude=crime.longitude,
            crime_type=crime.crime_type
        )
        for crime in crimes
    ]

@router.get("/types")
async def list_crime_types(db: Session = Depends(get_db), response_model= ListStringsResponse):
    crimeTypes = (
        db.query(Crime.crime_type)
        .distinct()
        .all()
    )
    
    crimeList = [ct[0] for ct in crimeTypes]
    
    return ListStringsResponse(values=crimeList)

@router.get("/months")
async def list_crime_months(db: Session = Depends(get_db), response_model= ListDatesResponse):
    crimeTypes = (
        db.query(Crime.date)
        .distinct()
        .all()
    )
    
    crimeList = [ct[0] for ct in crimeTypes]
    
    return ListDatesResponse(values=crimeList)


@router.get("/crime-rate-total")
async def get_total_crime_rate(
    lsoas: List[str] = Query(None),
    db: Session = Depends(get_db)):

    
    query = (
        db.query(Crime.lsoa_id, Crime.date, func.count().label("count"))
        .group_by(Crime.lsoa_id, Crime.date)
        .order_by(Crime.date)
    )

    if lsoas:
        query = query.filter(Crime.lsoa_id.in_(lsoas))

    results = query.all()

    dataDict = defaultdict(list)

    for result in results:
        coords = [result.date, result.count]
        dataDict[result.lsoa_id].append(coords)

    return dataDict

@router.get("/crime-rate-by-type")
async def get_crime_rate_by_type(
    lsoas: List[str] = Query(None),
    db: Session = Depends(get_db)):

    query = (db.query(Crime.lsoa_id, Crime.crime_type, func.count().label("count"))
        
        .group_by(Crime.crime_type, Crime.lsoa_id)
    )

    if lsoas:
        query = query.filter(Crime.lsoa_id.in_(lsoas))
        
    results = query.all()

    dataDict = defaultdict(list)

    for result in results:
        values = [result.crime_type, result.count]
        dataDict[result.lsoa_id].append(values)

    reordered_dict = {k: dataDict[k] for k in lsoas}

    return reordered_dict

@router.get("/timeseries")
async def crime_timeseries(
    lsoas: Optional[List[str]] = Query(None),
    crimeType: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(
        Crime.date,
        Crime.crime_type,
        func.count().label("count")
    )

    if crimeType:
        query = query.filter(Crime.crime_type.in_(crimeType))
    
    if lsoas:
        query = query.filter(Crime.lsoa_id.in_(lsoas))
    
    query = query.group_by(Crime.date, Crime.crime_type)
    query = query.order_by(Crime.date)
    results = query.all()

    results = query.all()

    dataDict = defaultdict(dict)

    min_date = None
    max_date = None

    # fill in missing 0s
    def generate_months(start, end):
        months = []
        current = start.replace(day=1)

        while current <= end:
            months.append(current)
            current += relativedelta(months=1)

        return months

    for result in results:
        date = result.date
        crime_type = result.crime_type
        count = result.count

        dataDict[crime_type][date] = count

        if not min_date or date < min_date:
            min_date = date
        if not max_date or date > max_date:
            max_date = date

        months = generate_months(min_date, max_date)

        finalDict = {}

        for crime_type, values in dataDict.items():
            coords = []

            for month in months:
                count = values.get(month, 0)
                coords.append([month, count])

            finalDict[crime_type] = coords

    return finalDict

