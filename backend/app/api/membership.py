from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db

from app.schemas.membership import (
    MembershipCreate
)

from app.services.membership_service import (
    add_membership,
    list_memberships
)

router = APIRouter(
    prefix="/memberships",
    tags=["Memberships"]
)


@router.post("/")
async def create_membership_route(
    membership: MembershipCreate,
    db: AsyncSession = Depends(get_db)
):
    return await add_membership(
        db,
        membership.user_id,
        membership.organization_id,
        membership.role
    )


@router.get("/")
async def get_memberships_route(
    db: AsyncSession = Depends(get_db)
):
    return await list_memberships(db)