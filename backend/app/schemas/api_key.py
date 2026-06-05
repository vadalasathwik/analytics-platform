from pydantic import BaseModel


class ApiKeyCreate(BaseModel):
    name: str