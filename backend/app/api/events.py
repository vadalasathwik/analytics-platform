from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db

from app.schemas.event import EventCreate

from app.repositories.event_repository import (
    create_event,
    get_events
)

from app.auth.current_organization import (
    get_current_organization
)

router = APIRouter(
    prefix="/events",
    tags=["Events"]
)


@router.post("/")
async def create_event_route(
    event: EventCreate,
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    created_event = await create_event(
        db=db,
        organization_id=current_org["organization_id"],
        event_name=event.event_name,
        user_id=event.user_id,
        properties=event.properties
    )

    return created_event


@router.get("/")
async def get_events_route(
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    return await get_events(
        db,
        current_org["organization_id"]
    )