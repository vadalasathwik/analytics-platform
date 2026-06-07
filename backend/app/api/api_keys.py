from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.auth.current_organization import get_current_organization
from app.auth.roles import ROLE_HIERARCHY, ADMIN

from app.schemas.api_key import (
    ApiKeyCreate
)

from app.repositories.api_key_repository import (
    create_api_key,
    get_api_keys,
    get_api_key_by_id,
    delete_api_key
)

router = APIRouter(
    prefix="/api-keys",
    tags=["API Keys"]
)


@router.post("/generate")
async def generate_api_key(
    payload: ApiKeyCreate,
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    # Check caller has permission to generate API keys (must be Admin or Owner)
    if ROLE_HIERARCHY[current_org["membership"].role] < ROLE_HIERARCHY[ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions"
        )

    api_key = await create_api_key(
        db=db,
        organization_id=current_org["organization_id"],
        name=payload.name
    )

    return {
        "id": api_key.id,
        "name": api_key.name,
        "key": api_key.plaintext_key,
        "created_at": api_key.created_at
    }


@router.get("/")
async def list_api_keys(
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    keys = await get_api_keys(
        db,
        current_org["organization_id"]
    )

    # Return key.preview instead of the secure DB hash to the user
    return [
        {
            "id": key.id,
            "name": key.name,
            "key": key.preview,
            "created_at": key.created_at
        }
        for key in keys
    ]


@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: int,
    current_org=Depends(
        get_current_organization
    ),
    db: AsyncSession = Depends(get_db)
):
    # Check caller has permission to manage API keys (must be Admin or Owner)
    if ROLE_HIERARCHY[current_org["membership"].role] < ROLE_HIERARCHY[ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions"
        )

    api_key = await get_api_key_by_id(db, key_id)
    if not api_key or api_key.organization_id != current_org["organization_id"]:
        raise HTTPException(
            status_code=404,
            detail="API Key not found"
        )

    success = await delete_api_key(db, key_id)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Failed to revoke API Key"
        )

    return {
        "message": "API key revoked successfully"
    }