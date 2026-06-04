from pydantic import BaseModel


class MembershipCreate(BaseModel):
    user_id: str
    organization_id: str
    role: str