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