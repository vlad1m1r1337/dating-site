"""Схемы для /geoloc."""

from pydantic import BaseModel, Field


class GeolocResponse(BaseModel):
    lat: float = Field(..., examples=[48.8566])
    lng: float = Field(..., examples=[2.3522])
