from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import postcodes
from api.routers import lsoas
from api.routers import crime as crime_full
from api.routers import flood as flood_full
from api.routers import school as school_full
from api.routers import database

origins =[
    "http://localhost:3000",
    "localhost:3000"
]

app = FastAPI(
    title="AQOLA API",
    description="Area Quality of Life Analysis"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://84.8.152.6:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(postcodes.router, prefix="/postcodes")
app.include_router(lsoas.router, prefix="/lsoas")
app.include_router(crime_full.router, prefix="/crime")
app.include_router(flood_full.router, prefix="/flood")
app.include_router(school_full.router, prefix="/school")
app.include_router(database.router, prefix="/database")
