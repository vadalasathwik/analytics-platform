from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.organization import Organization
from app.models.membership import Membership


async def get_summary(db: AsyncSession):

    users_count = await db.scalar(
        select(func.count(User.id))
    )

    organizations_count = await db.scalar(
        select(func.count(Organization.id))
    )

    memberships_count = await db.scalar(
        select(func.count(Membership.id))
    )

    return {
        "total_users": users_count,
        "total_organizations": organizations_count,
        "total_memberships": memberships_count
    }