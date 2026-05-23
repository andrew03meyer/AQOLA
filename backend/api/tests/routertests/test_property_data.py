import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from backend.api.routers.property import router

app = FastAPI()
app.include_router(router, prefix="/properties")
client = TestClient(app)

VALID_PROP_ID = "10033173220"
INVALID_PROP_ID = "99999999999"


class TestListProperties:
    def test_status_200_no_params(self):
        """Initial map load layout verification."""
        response = client.get("/properties/")
        assert response.status_code == 200

    def test_returns_property_instance_fields(self):
        """Ensures Pydantic returns all geographic/physical attributes safely."""
        response = client.get("/properties/")
        data = response.json()
        assert len(data) > 0
        
        first = data[0]
        assert "property_id" in first
        assert "full_address" in first
        assert "postcode" in first
        assert "lsoa_id" in first
        assert "property_type" in first
        assert "square_metres" in first
        assert "latitude" in first
        assert "longitude" in first

    def test_filter_by_single_property_id(self):
        """Validates specific targeted identifier lookup functionality."""
        response = client.get(f"/properties/?property_ids={VALID_PROP_ID}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["property_id"] == VALID_PROP_ID

    def test_filter_by_multiple_property_ids(self):
        response = client.get(f"/properties/?property_ids={VALID_PROP_ID}&property_ids=10033173221")
        assert response.status_code == 200
        data = response.json()
        returned_ids = {item["property_id"] for item in data}
        assert VALID_PROP_ID in returned_ids


class TestGetKentWideAverages:
    def test_status_200(self):
        response = client.get("/properties/kent-averages")
        assert response.status_code == 200

    def test_returns_expected_average_metrics_fields(self):
        """Verifies the core trend keys required for D3 charting lines exist."""
        response = client.get("/properties/kent-averages")
        data = response.json()
        assert len(data) > 0
        
        first = data[0]
        assert "property_type" in first
        assert "period" in first
        assert "avg_price" in first
        assert "avg_price_sqm" in first
        assert "count" in first

    def test_numerical_types_are_valid(self):
        response = client.get("/properties/kent-averages")
        data = response.json()
        first = data[0]
        assert isinstance(first["avg_price"], int)
        assert isinstance(first["avg_price_sqm"], int)
        assert isinstance(first["count"], int)


class TestGetPropertyTransactions:
    def test_status_400_when_no_ids_provided(self):
        """Ensures application rejects chart attempts that have no markers selected."""
        response = client.get("/properties/property-transactions")
        assert response.status_code == 400
        assert response.json()["detail"] == "Please select at least one property marker on the map."

    def test_status_200_with_valid_property_id(self):
        response = client.get(f"/properties/property-transactions?property_ids={VALID_PROP_ID}")
        assert response.status_code == 200

    def test_returns_exact_transaction_history_fields(self):
        """Verifies output maps to the updated flat structural signature."""
        response = client.get(f"/properties/property-transactions?property_ids={VALID_PROP_ID}")
        data = response.json()
        assert len(data) > 0
        
        first_tx = data[0]
        assert "property_id" in first_tx
        assert "transaction_id" in first_tx
        assert "is_new_build" in first_tx
        assert "sale_date" in first_tx
        assert "price" in first_tx
        assert "price_per_sqm" in first_tx

    def test_status_404_for_unknown_property_id(self):
        response = client.get(f"/properties/property-transactions?property_ids={INVALID_PROP_ID}")
        assert response.status_code == 404