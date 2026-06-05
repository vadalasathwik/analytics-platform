from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from sqlalchemy import text

from app.core.config import settings
from app.database.session import engine

from app.api.auth import router as auth_router
from app.api.organization import router as organization_router
from app.api.membership import router as membership_router
from app.api.analytics import router as analytics_router
from app.api.users import router as users_router
from app.api.admin import router as admin_router
from app.api.tenant import router as tenant_router
from app.api.events import router as events_router

app = FastAPI(
    title="Analytics Platform API"
)

app.include_router(tenant_router)
app.include_router(events_router)

# Session middleware required for Google OAuth
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
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