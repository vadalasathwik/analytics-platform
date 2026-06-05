from fastapi import FastAPI
from sqlalchemy import text

from app.database.session import engine

from app.api.auth import router as auth_router
from app.api.organization import router as organization_router
from app.api.membership import router as membership_router
from app.api.analytics import router as analytics_router
from app.api.users import router as users_router

from app.api.admin import router as admin_router

app = FastAPI(
    title="Analytics Platform API"
)

app.include_router(users_router)
app.include_router(auth_router)
app.include_router(organization_router)
app.include_router(membership_router)
app.include_router(analytics_router)

app.include_router(admin_router)

@app.get("/")
async def root():
    return {
        "message": "Analytics Platform API Running"
    }


@app.get("/health/db")
async def db_health():
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))

    return {
        "database": "connected"
    }