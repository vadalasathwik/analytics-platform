import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import create_user
from app.repositories.organization_repository import create_organization
from app.repositories.membership_repository import create_membership
from app.repositories.api_key_repository import create_api_key
from app.models.event import Event
from app.core.rate_limiter import ingest_rate_limiter

async def create_test_user(db: AsyncSession, name: str, email: str):
    return await create_user(db, name, email, "hashed_pwd", "local")

@pytest.fixture(autouse=True)
def reset_ingest_rate_limiter():
    ingest_rate_limiter.history.clear()

@pytest.mark.asyncio
async def test_batch_event_ingestion(client: AsyncClient, db: AsyncSession):
    # Setup test org and api key
    user = await create_test_user(db, "Test User", "test@example.com")
    org = await create_organization(db, "Test Org")
    await create_membership(db, user.id, org.id, "Owner")
    api_key = await create_api_key(db, org.id, "Test Key")
    await db.commit()

    plaintext_key = api_key.plaintext_key

    # Test 1: Batch event ingestion (Should succeed)
    batch_payload = [
        {"event_name": "click_button", "user_id": "usr_1", "properties": {"target": "signup"}},
        {"event_name": "view_page", "user_id": "usr_1", "properties": {"url": "/home"}},
        {"event_name": "purchase", "user_id": "usr_2", "properties": {"amount": 49.99}}
    ]
    headers = {"x-api-key": plaintext_key}

    response = await client.post("/track/batch", json=batch_payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert response.json()["count"] == 3

    # Verify events are stored in DB
    result = await db.execute(
        select(Event).where(Event.organization_id == org.id).order_by(Event.event_name.asc())
    )
    events = result.scalars().all()
    assert len(events) == 3
    assert events[0].event_name == "click_button"
    assert events[0].user_id == "usr_1"
    assert events[1].event_name == "purchase"
    assert events[1].properties["amount"] == 49.99
    assert events[2].event_name == "view_page"

    # Test 2: Ingestion with invalid key (Should fail with 401)
    response = await client.post("/track/batch", json=batch_payload, headers={"x-api-key": "invalid_key"})
    assert response.status_code == 401

    # Test 3: Ingestion with empty list (Should fail with 400)
    response = await client.post("/track/batch", json=[], headers=headers)
    assert response.status_code == 400
    assert "Batch list cannot be empty" in response.json()["detail"]
