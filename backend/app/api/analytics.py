from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db

from app.services.organization_analytics_service import (
    organization_stats
)

from app.services.dashboard_service import (
    get_recent_activity,
    revenue_trends,
    user_growth
)

from app.auth.current_organization import (
    get_current_organization
)

from app.repositories.analytics_repository import (
    get_summary,
    get_top_events,
    get_recent_events
)
from app.schemas.analytics import AnalyticsSummary

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/summary", response_model=AnalyticsSummary)
async def analytics_summary(
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    return await get_summary(
        db,
        current_org["organization_id"],
        current_org["user"].id,
    )


@router.get("/top-events")
async def top_events(
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    return await get_top_events(
        db,
        current_org["organization_id"]
    )


@router.get("/recent-events")
async def recent_events(
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    return await get_recent_events(
        db,
        current_org["organization_id"]
    )


@router.get("/organizations")
async def analytics_organizations(
    db: AsyncSession = Depends(get_db)
):
    return await organization_stats(db)


@router.get("/activity")
async def activity_feed():
    return await get_recent_activity()


@router.get("/revenue")
async def revenue_data():
    return await revenue_trends()


@router.get("/growth")
async def growth_data():
    return await user_growth()


@router.get("/dashboard")
async def dashboard(
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    summary = await get_summary(
        db,
        current_org["organization_id"],
        current_org["user"].id,
    )

    return {
        "summary": summary,
        "revenue": await revenue_trends(),
        "growth": await user_growth(),
        "activity": await get_recent_activity()
    }