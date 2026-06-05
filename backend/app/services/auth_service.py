from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.hashing import (
    hash_password,
    verify_password
)

from app.repositories.user_repository import (
    get_user_by_email,
    create_user
)

from app.auth.jwt_handler import (
    create_access_token,
    create_refresh_token
)

from app.auth.jwt_handler import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token
)

async def register_user(
    db: AsyncSession,
    name: str,
    email: str,
    password: str
):
    existing_user = await get_user_by_email(
        db,
        email
    )

    if existing_user:
        return None

    hashed_password = hash_password(
        password
    )

    user = await create_user(
    db,
    name,
    email,
    hashed_password,
    "local"
   )

    return user


async def login_user(
    db: AsyncSession,
    email: str,
    password: str
):
    user = await get_user_by_email(
        db,
        email
    )

    if not user:
        return None

    valid_password = verify_password(
        password,
        user.password_hash
    )

    if not valid_password:
        return None

    access_token = create_access_token(
        {
            "sub": user.email,
            "user_id": user.id
        }
    )

    refresh_token = create_refresh_token(
        {
            "sub": user.email,
            "user_id": user.id
        }
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }

async def refresh_access_token(
    refresh_token: str
):

    payload = verify_refresh_token(
        refresh_token
    )

    if not payload:
        return None

    return create_access_token(
        {
            "sub": payload["sub"],
            "user_id": payload["user_id"]
        }
    )