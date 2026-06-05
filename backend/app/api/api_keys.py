from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db

from app.auth.current_organization import (
    get_current_organization
)

from app.schemas.api_key import (
    ApiKeyCreate
)

from app.repositories.api_key_repository import (
    create_api_key,
    get_api_keys
)

router = APIRouter(
    prefix="/api-keys",
    tags=["API Keys"]
)


@router.post("/generate")
async def generate_api_key(
    payload: ApiKeyCreate,
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    return await create_api_key(
        db=db,
        organization_id=current_org[
            "organization_id"
        ],
        name=payload.name
    )


@router.get("/")
async def list_api_keys(
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    return await get_api_keys(
        db,
        current_org["organization_id"]
    )