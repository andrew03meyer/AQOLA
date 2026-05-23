from pydantic import BaseModel
from typing import Optional
from datetime import date

class PropertyResponse(BaseModel):
    property_id: str
    full_address: str
    postcode: str
    lsoa_id: str
    property_type: str
    square_metres: int
    latitude: float
    longitude: float

    class Config:
        from_attributes = True


class KentAverageResponse(BaseModel):
    property_type: str
    period: str
    avg_price: int
    avg_price_sqm: Optional[int]
    count: int

    class Config:
        from_attributes = True
        
class PropertyTransactionItem(BaseModel):
    property_id: Optional [str]
    transaction_id: str
    is_new_build: str
    sale_date: date
    price: int
    price_per_sqm: Optional[int]
    
    class Config:
            from_attributes = True 
