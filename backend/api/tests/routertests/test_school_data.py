import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from backend.api.routers.school import router

app = FastAPI()
app.include_router(router, prefix="/school")
client = TestClient(app)


class TestListSchools:
    def test_status_200(self):
        response = client.get("/school/")
        assert response.status_code == 200

    def test_returns_school_instance(self):
        response = client.get("/school/")
        data = response.json()
        assert len(data) > 0
        first = data[0]
        assert "urn" in first
        assert "lsoa_id" in first
        assert "school_name" in first
        assert "postcode" in first
        assert "is_primary" in first
        assert "is_secondary" in first
        assert "is_post16" in first
        assert "gender" in first
        assert "year_range" in first
        assert "ofsted_ranking" in first
        assert "latitude" in first
        assert "longitude" in first

    def test_filter_by_lsoa(self):
        response = client.get("/school/?lsoas=E01024013")
        assert response.status_code == 200
        data = response.json()
        for item in data:
            assert item["lsoa_id"] == "E01024013"

    def test_filter_by_multiple_lsoas(self):
        response = client.get("/school/?lsoas=E01024013&lsoas=E01023984")
        assert response.status_code == 200
        data = response.json()
        returned_lsoas = {item["lsoa_id"] for item in data}
        assert returned_lsoas.issubset({"E01024013", "E01023984"})

    def test_filter_by_postcode(self):
        response = client.get("/school/?postcodes=ME104SE")
        assert response.status_code == 200
        data = response.json()
        for item in data:
            assert item["postcode"] == "ME104SE"

    def test_filter_by_lsoa_and_postcode(self):
        response = client.get("/school/?lsoas=E01024013&postcodes=ME104SE")
        assert response.status_code == 200


class TestGetSchoolOfstedCounts:
    def test_status_200(self):
        response = client.get("/school/ofsted-count")
        assert response.status_code == 200

    def test_returns_ofsted_rankings_key(self):
        response = client.get("/school/ofsted-count")
        data = response.json()
        assert "ofsted_rankings" in data

    def test_returns_ranking_and_count_fields(self):
        response = client.get("/school/ofsted-count")
        data = response.json()
        assert len(data["ofsted_rankings"]) > 0
        first = data["ofsted_rankings"][0]
        assert "ranking" in first
        assert "count" in first

    def test_filter_by_lsoa(self):
        response = client.get("/school/ofsted-count?lsoas=E01024013")
        assert response.status_code == 200
        data = response.json()
        assert "ofsted_rankings" in data

    def test_filter_by_postcode(self):
        response = client.get("/school/ofsted-count?postcodes=ME104SE")
        assert response.status_code == 200
        data = response.json()
        assert "ofsted_rankings" in data

    def test_counts_are_positive_integers(self):
        response = client.get("/school/ofsted-count")
        data = response.json()
        for entry in data["ofsted_rankings"]:
            assert isinstance(entry["count"], int)
            assert entry["count"] > 0

def test_get_school_data_valid():
    response = client.get(f"/school/?postcodes=DA28DH")
    assert response.status_code == 200
    data = response.json()
    assert data[0]["school_name"] == "Darenth Community Primary School"
    assert "ofsted_ranking" in data[0]
    assert "is_primary" in data[0]
    assert "is_secondary" in data[0]
    assert "is_post16" in data[0]
    assert "gender" in data[0]
