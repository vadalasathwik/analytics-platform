from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization
from app.models.membership import Membership


async def organization_stats(
    db: AsyncSession
):

    result = await db.execute(
        select(
            Organization.name,
            func.count(Membership.id)
        )
        .join(
            Membership,
            Membership.organization_id == Organization.id
        )
        .group_by(Organization.name)
    )

    rows = result.all()

    return [
        {
            "organization": row[0],
            "members": row[1]
        }
        for row in rows
    ]