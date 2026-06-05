from sqlalchemy import select
from sqlalchemy import func

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event
from app.models.api_key import ApiKey


async def get_summary(
    db: AsyncSession,
    organization_id: str
):
    events_result = await db.execute(
        select(func.count(Event.id))
        .where(
            Event.organization_id ==
            organization_id
        )
    )

    api_keys_result = await db.execute(
        select(func.count(ApiKey.id))
        .where(
            ApiKey.organization_id ==
            organization_id
        )
    )

    total_events = events_result.scalar() or 0
    total_api_keys = api_keys_result.scalar() or 0

    return {
        "total_events": total_events,
        "total_api_keys": total_api_keys
    }


async def get_top_events(
    db: AsyncSession,
    organization_id: str
):
    result = await db.execute(
        select(
            Event.event_name,
            func.count(Event.id)
        )
        .where(
            Event.organization_id ==
            organization_id
        )
        .group_by(
            Event.event_name
        )
        .order_by(
            func.count(Event.id).desc()
        )
        .limit(10)
    )

    rows = result.all()

    return [
        {
            "event_name": row[0],
            "count": row[1]
        }
        for row in rows
    ]


async def get_recent_events(
    db: AsyncSession,
    organization_id: str
):
    result = await db.execute(
        select(Event)
        .where(
            Event.organization_id ==
            organization_id
        )
        .order_by(
            Event.created_at.desc()
        )
        .limit(20)
    )

    return result.scalars().all()