"""Схемы для /status."""

from pydantic import BaseModel


class StatusResponse(BaseModel):
    count: int
    users: list[str]
