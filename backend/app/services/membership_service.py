from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.membership_repository import (
    create_membership,
    get_memberships
)


async def add_membership(
    db: AsyncSession,
    user_id: str,
    organization_id: str,
    role: str
):
    return await create_membership(
        db,
        user_id,
        organization_id,
        role
    )


async def list_memberships(
    db: AsyncSession
):
    return await get_memberships(
        db
    )