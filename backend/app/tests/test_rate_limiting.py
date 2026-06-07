import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import create_user
from app.repositories.organization_repository import create_organization
from app.repositories.membership_repository import create_membership
from app.repositories.api_key_repository import create_api_key
from app.core.rate_limiter import login_rate_limiter, ingest_rate_limiter

async def create_test_user(db: AsyncSession, name: str, email: str):
    return await create_user(db, name, email, "hashed_pwd", "local")

@pytest.fixture(autouse=True)
def reset_rate_limiters():
    # Clear history between tests to prevent tests polluting each other
    login_rate_limiter.history.clear()
    ingest_rate_limiter.history.clear()

@pytest.mark.asyncio
async def test_ingestion_rate_limiting(client: AsyncClient, db: AsyncSession):
    # Setup test org and api key
    user = await create_test_user(db, "Test User", "test@example.com")
    org = await create_organization(db, "Test Org")
    await create_membership(db, user.id, org.id, "Owner")
    api_key = await create_api_key(db, org.id, "Test Key")
    await db.commit()

    plaintext_key = api_key.plaintext_key

    event_payload = {
        "event_name": "button_click",
        "user_id": "usr_999",
        "properties": {}
    }
    headers = {"x-api-key": plaintext_key}

    # Hit `/track/` 10 times (limit is 10)
    for _ in range(10):
        response = await client.post("/track/", json=event_payload, headers=headers)
        assert response.status_code == 200

    # 11th request should be rate-limited (HTTP 429)
    response = await client.post("/track/", json=event_payload, headers=headers)
    assert response.status_code == 429
    assert "Rate limit exceeded" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_rate_limiting(client: AsyncClient):
    # We hit `/auth/login` with form data (username, password)
    # Even if credentials are bad, we should hit rate limiter after 5 attempts
    login_payload = {
        "username": "bad_email@example.com",
        "password": "wrongpassword"
    }

    # First 5 attempts should fail with 401 (Unauthorized)
    for _ in range(5):
        response = await client.post("/auth/login", data=login_payload)
        assert response.status_code == 401

    # 6th attempt should return 429 (Too Many Requests)
    response = await client.post("/auth/login", data=login_payload)
    assert response.status_code == 429
    assert "Too many login attempts" in response.json()["detail"]
