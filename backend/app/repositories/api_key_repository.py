import secrets

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.api_key import ApiKey


async def create_api_key(
    db: AsyncSession,
    organization_id: str,
    name: str
):
    generated_key = (
        "sk_live_" +
        secrets.token_urlsafe(32)
    )

    api_key = ApiKey(
        organization_id=organization_id,
        name=name,
        key=generated_key
    )

    db.add(api_key)

    await db.commit()

    await db.refresh(api_key)

    return api_key


async def get_api_keys(
    db: AsyncSession,
    organization_id: str
):
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.organization_id == organization_id
        )
    )

    return result.scalars().all()


async def get_api_key_by_value(
    db: AsyncSession,
    key: str
):
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.key == key
        )
    )

    return result.scalar_one_or_none()