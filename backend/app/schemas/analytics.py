from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_events: int
    total_api_keys: int