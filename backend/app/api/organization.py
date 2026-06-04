from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db

from app.schemas.organization import (
    OrganizationCreate
)

from app.services.organization_service import (
    create_new_organization,
    list_organizations
)

router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"]
)


@router.post("/")
async def create_org(
    organization: OrganizationCreate,
    db: AsyncSession = Depends(get_db)
):
    org = await create_new_organization(
        db,
        organization.name
    )

    return org


@router.get("/")
async def get_orgs(
    db: AsyncSession = Depends(get_db)
):
    return await list_organizations(
        db
    )