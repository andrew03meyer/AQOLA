import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from backend.api.routers.flood import router

app = FastAPI()
app.include_router(router, prefix="/flood")
client = TestClient(app)


class TestListFlood:
    def test_status_200(self):
        response = client.get("/flood/")
        assert response.status_code == 200

    def test_returns_flood_instance(self):
        response = client.get("/flood/")
        data = response.json()
        assert len(data) > 0
        first = data[0]
        assert "postcode" in first
        assert "frs_band" in first
        assert "frs_count_high" in first
        assert "frs_count_medium" in first
        assert "frs_count_low" in first
        assert "frs_count_very_low" in first

    def test_filter_by_postcode(self):
        response = client.get("/flood/?postcodes=CT31HP")
        assert response.status_code == 200
        data = response.json()
        for item in data:
            assert item["postcode"] == "CT31HP"

    def test_filter_by_multiple_postcodes(self):
        response = client.get("/flood/?postcodes=CT31HP&postcodes=SW1A2AA")
        assert response.status_code == 200
        data = response.json()
        returned_postcodes = {item["postcode"] for item in data}
        assert returned_postcodes.issubset({"CT31HP", "SW1A2AA"})


class TestGetRiskBand:
    def test_status_200(self):
        response = client.get("/flood/risk-band?postcodes=CT31HP")
        assert response.status_code == 200

    def test_returns_risk_band_instance(self):
        response = client.get("/flood/risk-band?postcodes=CT31HP")
        data = response.json()
        assert "postcode" in data[0]
        assert "frs_band" in data[0]

    def test_returns_correct_postcode(self):
        response = client.get("/flood/risk-band?postcodes=CT31HP")
        data = response.json()
        assert data[0]["postcode"] == "CT31HP"

    def test_404_for_unknown_postcode(self):
        response = client.get("/flood/risk-band?postcodes=ZZ99ZZ")
        assert response.status_code == 404