from fastapi import Depends
from fastapi import HTTPException
from fastapi import Query

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db

from app.auth.dependencies import (
    get_current_user
)

from app.repositories.membership_repository import (
    get_membership
)

from app.models.user import User


async def get_current_organization(
    organization_id: str = Query(...),
    current_user: User = Depends(
        get_current_user
    ),
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

    return {
        "organization_id": organization_id,
        "membership": membership,
        "user": current_user
    }