from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization


async def create_organization(
    db: AsyncSession,
    name: str
):
    organization = Organization(
        name=name
    )

    db.add(organization)

    await db.commit()

    await db.refresh(organization)

    return organization


async def get_organizations(
    db: AsyncSession
):
    result = await db.execute(
        select(Organization)
    )

    return result.scalars().all()


async def get_user_organizations(
    db: AsyncSession,
    user_id: str
):
    from app.models.membership import Membership
    result = await db.execute(
        select(Organization).join(
            Membership,
            Organization.id == Membership.organization_id
        ).where(
            Membership.user_id == user_id
        )
    )

    return result.scalars().all()