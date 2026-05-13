"""Схемы для /tags."""

from pydantic import BaseModel, Field


class TagsResponse(BaseModel):
    tags: list[str] = Field(..., examples=[["music", "sport", "books"]])
