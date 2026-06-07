import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import create_user
from app.repositories.organization_repository import create_organization
from app.repositories.membership_repository import create_membership
from app.auth.jwt_handler import create_access_token

async def create_test_user(db: AsyncSession, name: str, email: str):
    user = await create_user(db, name, email, "hashed_pwd", "local")
    return user

@pytest.mark.asyncio
async def test_membership_endpoints_rbac(client: AsyncClient, db: AsyncSession):
    # Create test users
    owner_user = await create_test_user(db, "Owner User", "owner@example.com")
    admin_user = await create_test_user(db, "Admin User", "admin@example.com")
    analyst_user = await create_test_user(db, "Analyst User", "analyst@example.com")
    other_user = await create_test_user(db, "Other User", "other@example.com")

    # Create an organization
    org = await create_organization(db, "Test Org")

    # Setup memberships
    await create_membership(db, owner_user.id, org.id, "Owner")
    await create_membership(db, admin_user.id, org.id, "Admin")
    await create_membership(db, analyst_user.id, org.id, "Analyst")

    # Commit changes so database has them
    await db.commit()

    # Generate JWT tokens
    owner_token = create_access_token({"sub": owner_user.email, "user_id": owner_user.id})
    admin_token = create_access_token({"sub": admin_user.email, "user_id": admin_user.id})
    analyst_token = create_access_token({"sub": analyst_user.email, "user_id": analyst_user.id})
    other_token = create_access_token({"sub": other_user.email, "user_id": other_user.id})

    # Test 1: GET /memberships/ without organization_id query parameter
    # get_current_organization requires organization_id as a query param.
    headers = {"Authorization": f"Bearer {owner_token}"}
    response = await client.get("/memberships/", headers=headers)
    assert response.status_code == 422  # validation error since organization_id query param is missing

    # Test 2: GET /memberships/ for member of the organization
    response = await client.get(f"/memberships/?organization_id={org.id}", headers=headers)
    assert response.status_code == 200
    memberships = response.json()
    assert len(memberships) == 3

    # Test 3: GET /memberships/ for outsider user
    response = await client.get(f"/memberships/?organization_id={org.id}", headers={"Authorization": f"Bearer {other_token}"})
    assert response.status_code == 403  # Not a member of organization

    # Test 4: POST /memberships/ - Owner adding an Admin (Should succeed)
    payload = {
        "user_id": other_user.id,
        "organization_id": org.id,
        "role": "Admin"
    }
    response = await client.post("/memberships/", json=payload, headers={"Authorization": f"Bearer {owner_token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "Admin"
    assert data["user_id"] == other_user.id

    # Test 5: POST /memberships/ - Admin trying to add an Owner (Should fail with 403)
    payload_owner = {
        "user_id": other_user.id,
        "organization_id": org.id,
        "role": "Owner"
    }
    response = await client.post("/memberships/", json=payload_owner, headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 403
    assert "Only owners can assign the Owner role" in response.json()["detail"]

    # Test 6: POST /memberships/ - Admin adding an Analyst (Should succeed)
    payload_analyst = {
        "user_id": other_user.id,
        "organization_id": org.id,
        "role": "Analyst"
    }
    # First, let's delete the existing membership we just added to keep it clean, or just use another role/user
    # We can just change role or add another test user
    test_user_2 = await create_test_user(db, "Test User 2", "test2@example.com")
    await db.commit()
    payload_analyst["user_id"] = test_user_2.id
    response = await client.post("/memberships/", json=payload_analyst, headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200

    # Test 7: POST /memberships/ - Analyst trying to add anyone (Should fail with 403)
    test_user_3 = await create_test_user(db, "Test User 3", "test3@example.com")
    await db.commit()
    payload_analyst["user_id"] = test_user_3.id
    response = await client.post("/memberships/", json=payload_analyst, headers={"Authorization": f"Bearer {analyst_token}"})
    assert response.status_code == 403
    assert "Insufficient permissions" in response.json()["detail"]
