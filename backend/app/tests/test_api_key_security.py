import pytest
import hashlib
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import create_user
from app.repositories.organization_repository import create_organization
from app.repositories.membership_repository import create_membership
from app.auth.jwt_handler import create_access_token
from app.models.api_key import ApiKey

async def create_test_user(db: AsyncSession, name: str, email: str):
    user = await create_user(db, name, email, "hashed_pwd", "local")
    return user

@pytest.mark.asyncio
async def test_api_key_hashing_and_revocation(client: AsyncClient, db: AsyncSession):
    # Setup users and organization
    owner_user = await create_test_user(db, "Owner User", "owner@example.com")
    analyst_user = await create_test_user(db, "Analyst User", "analyst@example.com")
    org = await create_organization(db, "Test Org")

    await create_membership(db, owner_user.id, org.id, "Owner")
    await create_membership(db, analyst_user.id, org.id, "Analyst")
    await db.commit()

    owner_token = create_access_token({"sub": owner_user.email, "user_id": owner_user.id})
    analyst_token = create_access_token({"sub": analyst_user.email, "user_id": analyst_user.id})

    # Test 1: Generate API Key (Owner - Should succeed)
    headers = {"Authorization": f"Bearer {owner_token}"}
    response = await client.post(
        f"/api-keys/generate?organization_id={org.id}",
        json={"name": "Production Ingestion Key"},
        headers=headers
    )
    assert response.status_code == 200
    res_data = response.json()
    assert "key" in res_data
    plaintext_key = res_data["key"]
    assert plaintext_key.startswith("sk_live_")
    key_id = res_data["id"]

    # Test 2: Verify it is NOT saved in plaintext in the DB, but the hash is
    db_result_plain = await db.execute(
        select(ApiKey).where(ApiKey.key == plaintext_key)
    )
    assert db_result_plain.scalar_one_or_none() is None

    hashed_key = hashlib.sha256(plaintext_key.encode()).hexdigest()
    db_result_hash = await db.execute(
        select(ApiKey).where(ApiKey.key == hashed_key)
    )
    db_key = db_result_hash.scalar_one_or_none()
    assert db_key is not None
    assert db_key.name == "Production Ingestion Key"
    assert db_key.preview == f"{plaintext_key[:8]}...{plaintext_key[-4:]}"

    # Test 3: List keys (Should show preview, not plaintext and not hash)
    response = await client.get(
        f"/api-keys/?organization_id={org.id}",
        headers=headers
    )
    assert response.status_code == 200
    keys_list = response.json()
    assert len(keys_list) == 1
    assert keys_list[0]["key"] == db_key.preview
    assert keys_list[0]["key"] != plaintext_key
    assert keys_list[0]["key"] != hashed_key

    # Test 4: Ingest event using plaintext key (Should succeed)
    event_payload = {
        "event_name": "user_signup",
        "user_id": "usr_123456",
        "properties": {"plan": "premium", "referrer": "google"}
    }
    ingest_headers = {"x-api-key": plaintext_key}
    response = await client.post("/track/", json=event_payload, headers=ingest_headers)
    assert response.status_code == 200
    assert response.json()["event_name"] == "user_signup"

    # Test 5: Ingest event using hash or preview key (Should fail with 401)
    response = await client.post("/track/", json=event_payload, headers={"x-api-key": hashed_key})
    assert response.status_code == 401
    response = await client.post("/track/", json=event_payload, headers={"x-api-key": db_key.preview})
    assert response.status_code == 401

    # Test 6: Revocation permissions - Analyst trying to revoke (Should fail with 403)
    response = await client.delete(
        f"/api-keys/{key_id}?organization_id={org.id}",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert response.status_code == 403
    assert "Insufficient permissions" in response.json()["detail"]

    # Test 7: Revoke API Key (Owner - Should succeed)
    response = await client.delete(
        f"/api-keys/{key_id}?organization_id={org.id}",
        headers=headers
    )
    assert response.status_code == 200
    assert response.json()["message"] == "API key revoked successfully"

    # Test 8: Verify key is gone from DB
    db_result_revoked = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id)
    )
    assert db_result_revoked.scalar_one_or_none() is None

    # Test 9: Ingest event using revoked key (Should fail with 401)
    response = await client.post("/track/", json=event_payload, headers=ingest_headers)
    assert response.status_code == 401
    assert "Invalid API Key" in response.json()["detail"]
