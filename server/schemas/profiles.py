"""Схемы для /profiles."""

from pydantic import BaseModel, Field


class ProfilesQueryRequest(BaseModel):
    min_age: int = Field(..., ge=18, le=120, examples=[18])
    max_age: int = Field(..., ge=18, le=120, examples=[40])
    min_elo: int = Field(..., ge=0, examples=[0])
    max_elo: int = Field(..., ge=0, examples=[2000])
    distance: int = Field(..., ge=1, description="Радиус поиска в км", examples=[50])
    min_tags: int = Field(..., ge=0, description="Минимальное количество совпадающих тегов", examples=[1])
    wanted_tags: list[str] = Field(
        ...,
        description="Список желаемых тегов",
        examples=[["music", "sport"]],
    )
