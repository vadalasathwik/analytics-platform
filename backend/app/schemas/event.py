from pydantic import BaseModel

from typing import Dict
from typing import Any


class EventCreate(BaseModel):
    event_name: str
    user_id: str
    properties: Dict[str, Any] | None = None