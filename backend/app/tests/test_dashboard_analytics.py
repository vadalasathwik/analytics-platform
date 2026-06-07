import pytest
from datetime import datetime
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import create_user
from app.repositories.organization_repository import create_organization
from app.repositories.membership_repository import create_membership
from app.repositories.event_repository import create_event
from app.auth.jwt_handler import create_access_token
from app.models.event import Event

async def create_test_user(db: AsyncSession, name: str, email: str):
    return await create_user(db, name, email, "hashed_pwd", "local")

@pytest.mark.asyncio
async def test_real_dashboard_analytics(client: AsyncClient, db: AsyncSession):
    # Setup test org and user
    user = await create_test_user(db, "Test User", "test@example.com")
    org = await create_organization(db, "Test Org")
    await create_membership(db, user.id, org.id, "Owner")
    await db.commit()

    token = create_access_token({"sub": user.email, "user_id": user.id})
    headers = {"Authorization": f"Bearer {token}"}

    # Seed events with specific timestamps and properties:
    # Event 1: Jan 15, user "usr_1", purchase with amount=150
    ev1 = Event(
        organization_id=org.id,
        event_name="purchase",
        user_id="usr_1",
        properties={"amount": 150.0},
        created_at=datetime(2026, 1, 15, 12, 0, 0)
    )
    # Event 2: Jan 20, user "usr_2", purchase with price=50.0
    ev2 = Event(
        organization_id=org.id,
        event_name="purchase",
        user_id="usr_2",
        properties={"price": 50.0},
        created_at=datetime(2026, 1, 20, 12, 0, 0)
    )
    # Event 3: Feb 10, user "usr_2", click (no amount)
    ev3 = Event(
        organization_id=org.id,
        event_name="click",
        user_id="usr_2",
        properties={},
        created_at=datetime(2026, 2, 10, 12, 0, 0)
    )
    # Event 4: Feb 18, user "usr_3", purchase with revenue=200
    ev4 = Event(
        organization_id=org.id,
        event_name="purchase",
        user_id="usr_3",
        properties={"revenue": 200},
        created_at=datetime(2026, 2, 18, 12, 0, 0)
    )

    db.add_all([ev1, ev2, ev3, ev4])
    await db.commit()

    # Call /analytics/dashboard
    response = await client.get(f"/analytics/dashboard?organization_id={org.id}", headers=headers)
    assert response.status_code == 200
    data = response.json()

    # Verify summary cards are correct
    assert data["summary"]["total_events"] == 4
    assert data["summary"]["total_users"] == 3

    # Verify dynamic activity feed has 4 items
    assert len(data["activity"]) == 4
    assert data["activity"][0]["message"] == "Event 'purchase' tracked for user 'usr_3'"
    assert "2026-02-18" in data["activity"][0]["time"]

    # Verify revenue calculations grouped by month:
    # Jan: 150 + 50 = 200
    # Feb: 200
    revenue_data = {item["month"]: item["revenue"] for item in data["revenue"]}
    assert "Jan" in revenue_data
    assert revenue_data["Jan"] == 200.0
    assert "Feb" in revenue_data
    assert revenue_data["Feb"] == 200.0

    # Verify cumulative user growth calculations grouped by month:
    # Jan: 2 unique users ("usr_1", "usr_2") -> cumulative count = 2
    # Feb: adds "usr_3" (usr_2 is already seen) -> cumulative count = 3
    growth_data = {item["month"]: item["users"] for item in data["growth"]}
    assert "Jan" in growth_data
    assert growth_data["Jan"] == 2
    assert "Feb" in growth_data
    assert growth_data["Feb"] == 3
