import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from backend.api.routers.crime import router

app = FastAPI()
app.include_router(router, prefix="/crime")
client = TestClient(app)


class TestListCrime:
    def test_status_200(self):
        response = client.get("/crime/")
        assert response.status_code == 200

    def test_returns_crime_instance(self):
        response = client.get("/crime/")
        data = response.json()
        assert len(data) > 0
        first = data[0]
        assert "crime_id" in first
        assert "lsoa_id" in first
        assert "date" in first
        assert "latitude" in first
        assert "longitude" in first
        assert "crime_type" in first


class TestListCrimeTypes:
    def test_status_200(self):
        response = client.get("/crime/types")
        assert response.status_code == 200

    def test_returns_type_instance(self):
        response = client.get("/crime/types")
        data = response.json()
        assert "values" in data
        assert len(data["values"]) > 0


class TestListCrimeMonths:
    def test_status_200(self):
        response = client.get("/crime/months")
        assert response.status_code == 200

    def test_returns_date_instance(self):
        response = client.get("/crime/months")
        data = response.json()
        assert "values" in data
        assert len(data["values"]) > 0


class TestCrimeRateTotal:
    def test_status_200(self):
        response = client.get("/crime/crime-rate-total?lsoas=E01023983")
        assert response.status_code == 200

    def test_returns_lsoa_key(self):
        response = client.get("/crime/crime-rate-total?lsoas=E01023983")
        data = response.json()
        assert "E01023983" in data


class TestCrimeRateByType:
    def test_status_200(self):
        response = client.get("/crime/crime-rate-by-type?lsoas=E01023983")
        assert response.status_code == 200

    def test_returns_lsoa_key(self):
        response = client.get("/crime/crime-rate-by-type?lsoas=E01023983")
        data = response.json()
        assert "E01023983" in data


class TestCrimeTimeseries:
    def test_status_200(self):
        response = client.get("/crime/timeseries?lsoas=E01023983")
        assert response.status_code == 200

    def test_returns_crime_type_key(self):
        response = client.get("/crime/timeseries?lsoas=E01023983")
        data = response.json()
        assert len(data) > 0