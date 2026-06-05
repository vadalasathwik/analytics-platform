from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event


async def create_event(
    db: AsyncSession,
    organization_id: str,
    event_name: str,
    user_id: str,
    properties: dict | None
):
    event = Event(
        organization_id=organization_id,
        event_name=event_name,
        user_id=user_id,
        properties=properties
    )

    db.add(event)

    await db.commit()

    await db.refresh(event)

    return event


async def get_events(
    db: AsyncSession,
    organization_id: str
):
    result = await db.execute(
        select(Event).where(
            Event.organization_id == organization_id
        )
    )

    return result.scalars().all()