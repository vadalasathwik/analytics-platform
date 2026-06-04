from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.organization_repository import (
    create_organization,
    get_organizations
)


async def create_new_organization(
    db: AsyncSession,
    name: str
):
    return await create_organization(
        db,
        name
    )


async def list_organizations(
    db: AsyncSession
):
    return await get_organizations(
        db
    )