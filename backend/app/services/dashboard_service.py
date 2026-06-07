from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event import Event


async def get_recent_activity(
    db: AsyncSession,
    organization_id: str
):
    result = await db.execute(
        select(Event)
        .where(Event.organization_id == organization_id)
        .order_by(Event.created_at.desc())
        .limit(5)
    )
    recent_events = result.scalars().all()

    activity = []
    for event in recent_events:
        activity.append({
            "type": "event_tracked",
            "message": f"Event '{event.event_name}' tracked for user '{event.user_id}'",
            "time": event.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return activity


async def revenue_trends(
    db: AsyncSession,
    organization_id: str
):
    result = await db.execute(
        select(Event)
        .where(Event.organization_id == organization_id)
        .order_by(Event.created_at.asc())
    )
    events = result.scalars().all()

    monthly_revenue = {}
    for event in events:
        month = event.created_at.strftime("%b")
        props = event.properties or {}
        amount = 0.0
        # Check standard properties fields that hold transaction value
        for key in ["amount", "price", "value", "revenue"]:
            if key in props:
                try:
                    amount = float(props[key])
                    break
                except (ValueError, TypeError):
                    continue

        if amount > 0:
            monthly_revenue[month] = monthly_revenue.get(month, 0.0) + amount

    return [
        {"month": m, "revenue": round(r, 2)}
        for m, r in monthly_revenue.items()
    ]


async def user_growth(
    db: AsyncSession,
    organization_id: str
):
    result = await db.execute(
        select(Event)
        .where(Event.organization_id == organization_id)
        .order_by(Event.created_at.asc())
    )
    events = result.scalars().all()

    monthly_users = {}
    seen_users = set()
    for event in events:
        month = event.created_at.strftime("%b")
        seen_users.add(event.user_id)
        monthly_users[month] = len(seen_users)

    return [
        {"month": m, "users": u}
        for m, u in monthly_users.items()
    ]