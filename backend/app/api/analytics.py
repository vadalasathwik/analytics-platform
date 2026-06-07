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
    page: int = 1,
    limit: int = 20,
    search: str | None = None,
    event_name: str | None = None,
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    return await get_recent_events(
        db,
        current_org["organization_id"],
        page=page,
        limit=limit,
        search=search,
        event_name=event_name
    )


@router.get("/organizations")
async def analytics_organizations(
    db: AsyncSession = Depends(get_db)
):
    return await organization_stats(db)


@router.get("/activity")
async def activity_feed(
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    return await get_recent_activity(db, current_org["organization_id"])


@router.get("/revenue")
async def revenue_data(
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    return await revenue_trends(db, current_org["organization_id"])


@router.get("/growth")
async def growth_data(
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    return await user_growth(db, current_org["organization_id"])


@router.get("/dashboard")
async def dashboard(
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    org_id = current_org["organization_id"]
    summary = await get_summary(
        db,
        org_id,
        current_org["user"].id,
    )

    return {
        "summary": summary,
        "revenue": await revenue_trends(db, org_id),
        "growth": await user_growth(db, org_id),
        "activity": await get_recent_activity(db, org_id)
    }