from sqlalchemy import select
from sqlalchemy import func

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event
from app.models.api_key import ApiKey
from app.models.membership import Membership


async def get_summary(
    db: AsyncSession,
    organization_id: str,
    user_id: str | None = None
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

    users_result = await db.execute(
        select(func.count(func.distinct(Event.user_id)))
        .where(
            Event.organization_id ==
            organization_id
        )
    )

    memberships_result = await db.execute(
        select(func.count(Membership.id))
        .where(
            Membership.organization_id ==
            organization_id
        )
    )

    total_users = users_result.scalar() or 0
    total_memberships = memberships_result.scalar() or 0

    total_organizations = 0
    if user_id:
        organizations_result = await db.execute(
            select(func.count(func.distinct(Membership.organization_id)))
            .where(
                Membership.user_id == user_id
            )
        )
        total_organizations = organizations_result.scalar() or 0

    return {
        "total_events": total_events,
        "total_api_keys": total_api_keys,
        "total_users": total_users,
        "total_organizations": total_organizations,
        "total_memberships": total_memberships,
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


from sqlalchemy import String

async def get_recent_events(
    db: AsyncSession,
    organization_id: str,
    page: int = 1,
    limit: int = 20,
    search: str | None = None,
    event_name: str | None = None
):
    # Construct base query with tenant isolation
    base_query = select(Event).where(Event.organization_id == organization_id)

    # Apply event name filter
    if event_name and event_name != "all":
        base_query = base_query.where(Event.event_name == event_name)

    # Apply search filter across event_name, user_id, and serialized properties JSON
    if search:
        search_pattern = f"%{search}%"
        base_query = base_query.where(
            Event.event_name.ilike(search_pattern) |
            Event.user_id.ilike(search_pattern) |
            Event.properties.cast(String).ilike(search_pattern)
        )

    # Get total count of matching records
    total_result = await db.execute(
        select(func.count()).select_from(base_query.subquery())
    )
    total = total_result.scalar() or 0

    # Retrieve paginated items
    result = await db.execute(
        base_query.order_by(Event.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    items = result.scalars().all()

    return {
        "items": items,
        "total": total
    }