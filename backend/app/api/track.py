from fastapi import APIRouter
from fastapi import Header
from fastapi import HTTPException
from fastapi import Depends

from app.core.rate_limiter import check_ingest_rate_limit
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db

from app.schemas.event import EventCreate

from app.repositories.api_key_repository import (
    get_api_key_by_value
)

from app.repositories.event_repository import (
    create_event
)

router = APIRouter(
    prefix="/track",
    tags=["Tracking"]
)


@router.post("/", dependencies=[Depends(check_ingest_rate_limit)])
async def track_event(
    event: EventCreate,
    x_api_key: str = Header(...),
    db: AsyncSession = Depends(get_db)
):
    api_key = await get_api_key_by_value(
        db,
        x_api_key
    )

    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="Invalid API Key"
        )

    created_event = await create_event(
        db=db,
        organization_id=api_key.organization_id,
        event_name=event.event_name,
        user_id=event.user_id,
        properties=event.properties
    )

    return created_event