from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from app.core.config import settings
from app.core.rate_limiter import check_login_rate_limit

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

from fastapi import Request
from fastapi.responses import RedirectResponse

from app.services.google_oauth_service import oauth


from app.repositories.user_repository import (
    get_user_by_email,
    create_user
)

from app.auth.jwt_handler import (
    create_access_token,
    create_refresh_token
)

from app.core.config import settings

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


@router.post("/login", dependencies=[Depends(check_login_rate_limit)])
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


@router.get("/google/login")
async def google_login(
    request: Request
):
    return await oauth.google.authorize_redirect(
        request,
        settings.GOOGLE_REDIRECT_URI
    )


@router.get("/google/callback")
async def google_callback(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    token = await oauth.google.authorize_access_token(
        request
    )

    user_info = token.get("userinfo")

    email = user_info["email"]
    name = user_info["name"]

    user = await get_user_by_email(
        db,
        email
    )

    is_new_user = False
    if not user:
        is_new_user = True
        user = await create_user(
            db=db,
            name=name,
            email=email,
            password_hash="google_oauth",
            auth_provider="google"
        )

        # Create default organization for new user
        from app.repositories.organization_repository import create_organization
        from app.repositories.membership_repository import create_membership
        
        org = await create_organization(
            db,
            f"{name}'s Organization"
        )
        
        # Add user to organization as owner
        await create_membership(
            db,
            user.id,
            org.id,
            "owner"
        )

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

    frontend_url = (
        f"{settings.FRONTEND_URL}/auth"
        f"?access_token={access_token}"
        f"&refresh_token={refresh_token}"
    )

    return RedirectResponse(url=frontend_url, status_code=302)