import asyncio
import uuid
import hashlib
from datetime import datetime
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.session import AsyncSessionLocal
from sqlalchemy import select
from app.models.user import User
from app.models.organization import Organization
from app.models.membership import Membership
from app.models.api_key import ApiKey
from app.models.event import Event

async def run_smoke_test():
    print("Starting integration smoke test on real database...")
    
    # Generate unique test data to avoid conflicts
    unique_suffix = str(uuid.uuid4())[:8]
    email = f"smoke_user_{unique_suffix}@example.com"
    password = "password123"
    name = f"Smoke User {unique_suffix}"
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        
        # 1. Register user
        print("\n[1/6] Testing Authentication (Register)...")
        reg_response = await client.post("/auth/register", json={
            "name": name,
            "email": email,
            "password": password
        })
        assert reg_response.status_code == 200, f"Register failed: {reg_response.text}"
        print("User registered successfully.")
        
        # 2. Login user
        print("Testing Authentication (Login)...")
        login_response = await client.post("/auth/login", data={
            "username": email,
            "password": password
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        token_data = login_response.json()
        token = token_data["access_token"]
        print("User logged in successfully and retrieved JWT.")
        
        # 3. Retrieve user organizations (default created on register)
        headers = {"Authorization": f"Bearer {token}"}
        orgs_response = await client.get("/organizations/", headers=headers)
        assert orgs_response.status_code == 200, f"Fetch organizations failed: {orgs_response.text}"
        orgs = orgs_response.json()
        assert len(orgs) > 0, "No default organization created on register"
        org_id = orgs[0]["id"]
        print(f"Default organization retrieved: '{orgs[0]['name']}' (ID: {org_id})")
        
        # 4. Generate API Key
        print("\n[2/6] Testing API Key Generation...")
        key_response = await client.post(
            f"/api-keys/generate?organization_id={org_id}",
            json={"name": "Smoke Test Ingestion Key"},
            headers=headers
        )
        assert key_response.status_code == 200, f"API Key generation failed: {key_response.text}"
        key_data = key_response.json()
        plaintext_key = key_data["key"]
        key_id = key_data["id"]
        assert plaintext_key.startswith("sk_live_"), "Plaintext key has incorrect format"
        print(f"API Key generated successfully. Plaintext key: {plaintext_key[:12]}...")
        
        # Verify key preview was stored and hash matches in DB
        async with AsyncSessionLocal() as session:
            db_res = await session.execute(select(ApiKey).where(ApiKey.id == key_id))
            db_key = db_res.scalar_one_or_none()
            assert db_key is not None
            assert db_key.preview.startswith("sk_live_"), "Preview not stored in DB"
            hashed = hashlib.sha256(plaintext_key.encode()).hexdigest()
            assert db_key.key == hashed, "Database key is not securely hashed"
        print("Database verification: Key is securely hashed and preview column is populated.")

        # 5. Event tracking (Single ingestion)
        print("\n[3/6] Testing Single Event Tracking...")
        event_payload = {
            "event_name": "smoke_click",
            "user_id": "usr_smoke_1",
            "properties": {"button": "header_cta", "color": "blue"}
        }
        track_headers = {"x-api-key": plaintext_key}
        track_response = await client.post("/track/", json=event_payload, headers=track_headers)
        assert track_response.status_code == 200, f"Single event tracking failed: {track_response.text}"
        print("Single event ingested successfully.")
        
        # 6. Batch ingestion
        print("\n[4/6] Testing Batch Event Ingestion...")
        batch_payload = [
            {"event_name": "smoke_page_view", "user_id": "usr_smoke_1", "properties": {"url": "/features"}},
            {"event_name": "smoke_purchase", "user_id": "usr_smoke_2", "properties": {"amount": 79.99, "currency": "USD"}}
        ]
        batch_response = await client.post("/track/batch", json=batch_payload, headers=track_headers)
        assert batch_response.status_code == 200, f"Batch ingestion failed: {batch_response.text}"
        assert batch_response.json()["count"] == 2
        print("Batch of 2 events ingested successfully.")
        
        # 7. Event Explorer (Server-side Search/Pagination/Filter)
        print("\n[5/6] Testing Event Explorer...")
        # Search for "usr_smoke_2"
        explorer_res = await client.get(
            f"/analytics/recent-events?organization_id={org_id}&search=usr_smoke_2",
            headers=headers
        )
        assert explorer_res.status_code == 200, f"Event Explorer search failed: {explorer_res.text}"
        explorer_data = explorer_res.json()
        assert explorer_data["total"] == 1, f"Expected 1 matching event, found {explorer_data['total']}"
        assert explorer_data["items"][0]["event_name"] == "smoke_purchase"
        print("Server-side search/filter returned correct result.")

        # Test paging
        explorer_page = await client.get(
            f"/analytics/recent-events?organization_id={org_id}&page=1&limit=2",
            headers=headers
        )
        assert explorer_page.status_code == 200
        assert len(explorer_page.json()["items"]) == 2
        assert explorer_page.json()["total"] == 3
        print("Server-side pagination verified successfully.")

        # 8. Dashboard Analytics (Real aggregates)
        print("\n[6/6] Testing Real Dashboard Analytics...")
        dash_response = await client.get(
            f"/analytics/dashboard?organization_id={org_id}",
            headers=headers
        )
        assert dash_response.status_code == 200, f"Dashboard metrics failed: {dash_response.text}"
        dash_data = dash_response.json()
        assert dash_data["summary"]["total_events"] == 3, f"Expected 3 events in summary, found {dash_data['summary']['total_events']}"
        assert dash_data["summary"]["total_users"] == 2, f"Expected 2 users in summary, found {dash_data['summary']['total_users']}"
        
        # Verify dynamic activity feed has items
        assert len(dash_data["activity"]) == 3
        
        # Verify revenue sum: smoke_purchase contains amount=79.99
        revenue_map = {item["month"]: item["revenue"] for item in dash_data["revenue"]}
        current_month = datetime.utcnow().strftime("%b")
        assert current_month in revenue_map
        assert revenue_map[current_month] == 79.99
        print("Dashboard real aggregates (users count, activity logs, and purchase sums) verified successfully.")
        
        # Cleanup test data to keep the database tidy
        print("\nCleaning up test data from DB...")
        async with AsyncSessionLocal() as session:
            # Delete events
            await session.execute(Event.__table__.delete().where(Event.organization_id == org_id))
            # Delete API Keys
            await session.execute(ApiKey.__table__.delete().where(ApiKey.organization_id == org_id))
            # Delete Memberships
            await session.execute(Membership.__table__.delete().where(Membership.organization_id == org_id))
            # Delete Organization
            await session.execute(Organization.__table__.delete().where(Organization.id == org_id))
            # Delete User
            await session.execute(User.__table__.delete().where(User.email == email))
            await session.commit()
        print("Cleanup completed.")
        
    print("\nALL SMOKE TEST CHECKS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_smoke_test())
