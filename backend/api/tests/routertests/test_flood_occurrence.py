import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from api.routers.flood_occurrences import router

app = FastAPI()
app.include_router(router, prefix="/flood-occurrences")
client = TestClient(app)


class TestListFloodOccurrence:
    def test_status_200(self):
        response = client.get("/flood-occurrences/")
        assert response.status_code == 200

    def test_returns_flood_instance(self):
        response = client.get("/flood-occurrences/")
        data = response.json()
        assert len(data) > 0
        first = data[0]
        assert "rec_out_id"  in first
        assert "rec_grp_id"  in first
        assert "name"  in first
        assert "start_date"  in first
        assert "end_date"  in first
        assert "flood_src"  in first
        assert "flood_caus"  in first
        assert "hfm_status"  in first
        assert "data_src" in first
        assert "fluvial_f"  in first
        assert "coastal_f"  in first
        assert "tidal_f"	 in first
        assert "boundary"  in first

