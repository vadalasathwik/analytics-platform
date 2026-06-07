from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_events: int
    total_api_keys: int
    total_users: int
    total_organizations: int
    total_memberships: int
