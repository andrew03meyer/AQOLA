import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from backend.api.routers.postcodes import router

app = FastAPI()
app.include_router(router, prefix="/postcodes")
client = TestClient(app)

VALID_POSTCODE_STARTS = ["CT", "BR", "TN", "DA", "ME"]
KNOWN_POSTCODE = "CT27QS"
KNOWN_POSTCODE_SPACED = "CT2 7QS"
UNKNOWN_POSTCODE = "ZZ999ZZ"


class TestListPostcodes:
    def test_status_200(self):
        response = client.get("/postcodes/")
        assert response.status_code == 200

    def test_returns_postcode_instance(self):
        response = client.get("/postcodes/")
        data = response.json()
        assert len(data) > 0
        first = data[0]
        assert "postcode" in first
        assert "lsoa_id" in first
        assert "postcode_area" in first
        assert "postcode_district" in first
        assert "postcode_sector" in first
        assert "latitude" in first
        assert "longitude" in first

    def test_filter_by_postcode(self):
        response = client.get(f"/postcodes/?postcodes={KNOWN_POSTCODE_SPACED}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    def test_filter_by_multiple_postcodes(self):
        response = client.get(f"/postcodes/?postcodes={KNOWN_POSTCODE_SPACED}&postcodes=CT27QS")
        assert response.status_code == 200
        data = response.json()
        returned = {item["postcode"] for item in data}
        assert returned.issubset({KNOWN_POSTCODE_SPACED, "CT27QS"})

    def test_latitude_and_longitude_are_numeric(self):
        response = client.get(f"/postcodes/?postcodes={KNOWN_POSTCODE_SPACED}")
        data = response.json()
        assert isinstance(data[0]["latitude"], (int, float))
        assert isinstance(data[0]["longitude"], (int, float))


class TestListPostcodeGeometry:
    def test_status_200(self):
        response = client.get("/postcodes/geometry", params={
            "min_lat": 51.243876,
            "max_lat": 51.2469,
            "min_lng": 1.3500,
            "max_lng": 1.436652,
        })
        assert response.status_code == 200

    def test_returns_geometry_instance(self):
        response = client.get("/postcodes/geometry", params={
            "min_lat": 51.243876,
            "max_lat": 51.2469,
            "min_lng": 1.3500,
            "max_lng": 1.436652,
        })
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            first = data[0]
            assert "postcode" in first
            assert "boundary" in first
            assert "type" in first["boundary"]
            assert "coordinates" in first["boundary"]

    def test_returns_valid_postcode_starts(self):
        response = client.get("/postcodes/geometry", params={
            "min_lat": 51.243876,
            "max_lat": 51.2469,
            "min_lng": 1.3500,
            "max_lng": 1.436652,
        })
        data = response.json()
        for item in data:
            assert item["postcode"][0:2] in VALID_POSTCODE_STARTS

    def test_empty_bounds_returns_empty_list(self):
        response = client.get("/postcodes/geometry", params={
            "min_lat": 0.0,
            "max_lat": 0.001,
            "min_lng": 0.0,
            "max_lng": 0.001,
        })
        assert response.status_code == 404

    def test_missing_bounds_returns_422(self):
        response = client.get("/postcodes/geometry")
        assert response.status_code == 422