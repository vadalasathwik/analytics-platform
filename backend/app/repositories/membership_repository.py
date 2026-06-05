from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.membership import Membership


async def create_membership(
    db: AsyncSession,
    user_id: str,
    organization_id: str,
    role: str
):
    membership = Membership(
        user_id=user_id,
        organization_id=organization_id,
        role=role
    )

    db.add(membership)

    await db.commit()

    await db.refresh(membership)

    return membership


async def get_memberships(
    db: AsyncSession
):
    result = await db.execute(
        select(Membership)
    )

    return result.scalars().all()

async def get_membership(
    db: AsyncSession,
    user_id: str,
    organization_id: str
):
    result = await db.execute(
        select(Membership).where(
            Membership.user_id == user_id,
            Membership.organization_id == organization_id
        )
    )

    return result.scalar_one_or_none()


async def get_membership(
    db: AsyncSession,
    user_id: str,
    organization_id: str
):
    result = await db.execute(
        select(Membership).where(
            Membership.user_id == user_id,
            Membership.organization_id == organization_id
        )
    )

    return result.scalars().first()