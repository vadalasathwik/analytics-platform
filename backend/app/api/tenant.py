from fastapi import APIRouter
from fastapi import Depends

from app.auth.current_organization import (
    get_current_organization
)

router = APIRouter(
    prefix="/tenant",
    tags=["Tenant"]
)


@router.get("/test")
async def tenant_test(
    current_org=Depends(
        get_current_organization
    )
):
    return {
        "message": "Tenant access granted",
        "organization_id":
            current_org["organization_id"],
        "user":
            current_org["user"].email,
        "role":
            current_org["membership"].role
    }