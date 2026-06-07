import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import create_user
from app.repositories.organization_repository import create_organization
from app.repositories.membership_repository import create_membership
from app.repositories.event_repository import create_event
from app.auth.jwt_handler import create_access_token

async def create_test_user(db: AsyncSession, name: str, email: str):
    return await create_user(db, name, email, "hashed_pwd", "local")

@pytest.mark.asyncio
async def test_event_explorer_pagination_and_filters(client: AsyncClient, db: AsyncSession):
    # Setup test org and user
    user = await create_test_user(db, "Test User", "test@example.com")
    org = await create_organization(db, "Test Org")
    await create_membership(db, user.id, org.id, "Owner")
    await db.commit()

    token = create_access_token({"sub": user.email, "user_id": user.id})
    headers = {"Authorization": f"Bearer {token}"}

    # Seed 15 events:
    # 5 user_login events for usr_A
    # 5 purchase events for usr_A with properties {"plan": "premium", "amount": 100}
    # 5 user_signup events for usr_B with properties {"plan": "free"}
    for i in range(5):
        await create_event(db, org.id, "user_login", "usr_A", {"index": i})
        await create_event(db, org.id, "purchase", "usr_A", {"plan": "premium", "amount": 100, "index": i})
        await create_event(db, org.id, "user_signup", "usr_B", {"plan": "free", "index": i})
    await db.commit()

    # Test 1: Fetch recent events default (limit=20)
    response = await client.get(f"/analytics/recent-events?organization_id={org.id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 15
    assert len(data["items"]) == 15

    # Test 2: Pagination page=1 limit=6
    response = await client.get(f"/analytics/recent-events?organization_id={org.id}&page=1&limit=6", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 15
    assert len(data["items"]) == 6

    # Test 3: Pagination page=3 limit=6 (should contain remaining 3 items)
    response = await client.get(f"/analytics/recent-events?organization_id={org.id}&page=3&limit=6", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 15
    assert len(data["items"]) == 3

    # Test 4: Filter by event_name
    response = await client.get(f"/analytics/recent-events?organization_id={org.id}&event_name=purchase", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 5
    assert len(data["items"]) == 5
    for item in data["items"]:
        assert item["event_name"] == "purchase"

    # Test 5: Search term "usr_B" (filters by user_id)
    response = await client.get(f"/analytics/recent-events?organization_id={org.id}&search=usr_B", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 5
    assert len(data["items"]) == 5
    for item in data["items"]:
        assert item["user_id"] == "usr_B"

    # Test 6: Search term "premium" (filters inside properties JSON)
    response = await client.get(f"/analytics/recent-events?organization_id={org.id}&search=premium", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 5
    assert len(data["items"]) == 5
    for item in data["items"]:
        assert item["event_name"] == "purchase"
        assert item["properties"]["plan"] == "premium"
