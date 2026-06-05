from fastapi import APIRouter
from fastapi import Depends

from app.auth.permissions import require_role
from app.auth.roles import ADMIN

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/test")
async def admin_test(
    user=Depends(
        require_role(ADMIN)
    )
):
    return {
        "message": "Admin access granted",
        "user": user.email
    }