from pydantic import BaseModel
from typing import Optional
from datetime import date
from api.models.response_models.polygon import GeometryModel

class FloodOccurrencesResponse(BaseModel):
    rec_out_id: int
    rec_grp_id: int
    name: str
    start_date: date 
    end_date: date
    flood_src :str
    flood_caus: str
    hfm_status: str
    data_src: str
    fluvial_f: bool
    coastal_f: bool
    tidal_f: bool
    boundary: GeometryModel

    class Config:
        from_attributes = True # aAllows SQL Alchemy to convert to this.
