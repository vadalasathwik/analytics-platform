from fastapi import Depends
from fastapi import HTTPException
from fastapi import Query

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.auth.roles import ROLE_HIERARCHY

from app.repositories.membership_repository import (
    get_membership
)


def require_role(required_role: str):

    async def role_checker(
        organization_id: str = Query(...),
        current_user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
    ):

        membership = await get_membership(
            db,
            current_user.id,
            organization_id
        )

        if not membership:
            raise HTTPException(
                status_code=403,
                detail="Not a member of organization"
            )

        if ROLE_HIERARCHY[membership.role] < ROLE_HIERARCHY[required_role]:
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions"
            )

        return current_user

    return role_checker