from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User

from app.schemas.organization import (
    OrganizationCreate
)

from app.services.organization_service import (
    create_new_organization,
    list_organizations,
    list_user_organizations
)

router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"]
)


@router.post("/")
async def create_org(
    organization: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org = await create_new_organization(
        db,
        organization.name
    )

    # Add user as owner of the organization
    from app.repositories.membership_repository import create_membership
    await create_membership(
        db,
        current_user.id,
        org.id,
        "owner"
    )

    return org


@router.get("/")
async def get_orgs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await list_user_organizations(
        db,
        current_user.id
    )