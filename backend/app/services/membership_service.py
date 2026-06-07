from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.membership_repository import (
    create_membership,
    get_organization_memberships
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
    db: AsyncSession,
    organization_id: str
):
    return await get_organization_memberships(
        db,
        organization_id
    )