import secrets
import hashlib

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

    # Hash the key using SHA-256 for secure storage
    hashed_key = hashlib.sha256(generated_key.encode()).hexdigest()
    # Format preview: first 8 chars and last 4 chars (e.g. sk_live_...xxxx)
    preview = f"{generated_key[:8]}...{generated_key[-4:]}"

    api_key = ApiKey(
        organization_id=organization_id,
        name=name,
        key=hashed_key,
        preview=preview
    )

    db.add(api_key)

    await db.commit()

    await db.refresh(api_key)

    # Attach plaintext key temporarily for response model serialization
    api_key.plaintext_key = generated_key

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
    # Hash incoming key for comparison
    hashed_key = hashlib.sha256(key.encode()).hexdigest()
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.key == hashed_key
        )
    )

    return result.scalar_one_or_none()


async def get_api_key_by_id(
    db: AsyncSession,
    api_key_id: int
):
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.id == api_key_id
        )
    )
    return result.scalar_one_or_none()


async def delete_api_key(
    db: AsyncSession,
    api_key_id: int
):
    api_key = await get_api_key_by_id(db, api_key_id)
    if api_key:
        await db.delete(api_key)
        await db.commit()
        return True
    return False