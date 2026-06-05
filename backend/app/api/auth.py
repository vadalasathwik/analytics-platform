from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.user import (
    UserCreate,
    UserLogin
)

from app.database.session import get_db

from app.services.auth_service import (
    register_user,
    login_user
)

from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

from app.schemas.user import (
    UserCreate,
    UserLogin,
    RefreshTokenRequest
)

from app.services.auth_service import (
    register_user,
    login_user,
    refresh_access_token
)

@router.post("/register")
async def register(
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
):

    new_user = await register_user(
        db,
        user.name,
        user.email,
        user.password
    )

    if not new_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    return {
        "message": "User registered successfully"
    }


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):

    token = await login_user(
        db,
        form_data.username,  # email
        form_data.password
    )

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    return {
    "access_token": token["access_token"],
    "refresh_token": token["refresh_token"],
    "token_type": "bearer"
}


@router.post("/refresh")
async def refresh_token(
    request: RefreshTokenRequest
):

    access_token = await refresh_access_token(
        request.refresh_token
    )

    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }