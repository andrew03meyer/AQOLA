from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from api.database import get_db
from api.models.db_models import Property, PropertyTransaction, KentPropertyAverage
from api.models.response_models.property import (
    PropertyResponse,
    PropertyTransactionItem,
    KentAverageResponse
)
from sqlalchemy import func
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[PropertyResponse])
async def list_properties(
    property_ids: Optional[List[str]] = Query(default=None),
    db: Session = Depends(get_db)
):
    """Lists property records."""
    query = db.query(Property)

    if property_ids: 
        query = query.filter(Property.property_id.in_(property_ids))

    results = query.all()
    if not results:
        raise HTTPException(status_code=404, detail="No property records discovered for specified inputs.")
    return results


@router.get("/kent-averages", response_model=List[KentAverageResponse])
async def get_kent_wide_averages(db: Session = Depends(get_db)):
    """Fetches non-dynamic static baseline metrics covering the whole of Kent, sorted chronologically."""
    
    year_part = func.substr(KentPropertyAverage.period, 4, 4)
    
    quarter_part = func.substr(KentPropertyAverage.period, 1, 2)

    results = (
        db.query(KentPropertyAverage)
        .order_by(
            year_part.asc(),                    
            quarter_part.asc(),                 
            KentPropertyAverage.property_type  
        )
        .all()
    )
    
    if not results:
        raise HTTPException(status_code=404, detail="Kent baseline averages table missing entries.")
        
    return results


@router.get("/property-transactions", response_model=List[PropertyTransactionItem])
async def get_property_transactions(
    property_ids: Optional[List[str]] = Query(default=None),
    db: Session = Depends(get_db)
):
    """Fetches the distinct transaction history for specific chosen property markers."""
    if not property_ids:
        raise HTTPException(status_code=400, detail="Please select at least one property marker on the map.")

    results = (
        db.query(PropertyTransaction)
        .filter(PropertyTransaction.property_id.in_(property_ids))
        .order_by(PropertyTransaction.sale_date.asc())
        .all()
    )

    if not results:
        raise HTTPException(status_code=404, detail="No transaction history found for the selected properties.")

    return results