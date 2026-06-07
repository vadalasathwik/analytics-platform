from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.auth.current_organization import get_current_organization
from app.models.user import User
from app.auth.roles import ROLE_HIERARCHY, OWNER, ADMIN, ANALYST, VIEWER
from app.repositories.membership_repository import get_membership

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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Validate target role value
    valid_roles = [OWNER, ADMIN, ANALYST, VIEWER]
    if membership.role not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )

    # Check caller's membership in target organization
    caller_membership = await get_membership(
        db,
        current_user.id,
        membership.organization_id
    )
    if not caller_membership:
        raise HTTPException(
            status_code=403,
            detail="Not a member of organization"
        )

    # Check caller has permission to manage memberships (must be Admin or Owner)
    if ROLE_HIERARCHY[caller_membership.role] < ROLE_HIERARCHY[ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions"
        )

    # If assigning Owner role, caller must be Owner themselves
    if membership.role.lower() == OWNER.lower() and caller_membership.role.lower() != OWNER.lower():
        raise HTTPException(
            status_code=403,
            detail="Only owners can assign the Owner role"
        )

    return await add_membership(
        db,
        membership.user_id,
        membership.organization_id,
        membership.role
    )


@router.get("/")
async def get_memberships_route(
    current_org=Depends(get_current_organization),
    db: AsyncSession = Depends(get_db)
):
    return await list_memberships(db, current_org["organization_id"])