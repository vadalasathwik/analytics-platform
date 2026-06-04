from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_user_by_email(
    db: AsyncSession,
    email: str
):
    result = await db.execute(
        select(User).where(User.email == email)
    )

    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    name: str,
    email: str,
    password_hash: str
):
    user = User(
        name=name,
        email=email,
        password_hash=password_hash
    )

    db.add(user)

    await db.commit()

    await db.refresh(user)

    return user