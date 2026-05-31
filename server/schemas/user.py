"""Схемы запросов и ответов для /user."""

from typing import Any
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr = Field(..., examples=["alice@example.com"])
    username: str = Field(..., min_length=2, max_length=32, examples=["alice42"])
    firstName: str = Field(..., min_length=1, max_length=64, examples=["Alice"])
    lastName: str = Field(..., min_length=1, max_length=64, examples=["Wonderland"])
    password: str = Field(
        ...,
        min_length=8,
        description="Минимум 8 символов, должен содержать буквы и цифры",
        examples=["Str0ngP@ss"],
    )


class LoginRequest(BaseModel):
    username: str = Field(..., examples=["alice42"])
    password: str = Field(..., examples=["Str0ngP@ss"])


class UpdateProfileRequest(BaseModel):
    email: EmailStr
    firstName: str
    lastName: str
    bio: str = Field("", description="Краткое описание профиля")
    images: list[str] = Field(default_factory=list, description="Список id картинок пользователя")
    tags: dict[str, bool] = Field(
        default_factory=dict,
        description="Словарь тегов: {tag_name: enabled}",
        examples=[{"music": True, "sport": False}],
    )
    orientation: str = Field(..., description="male / female / both", examples=["both"])
    gender: str = Field(..., description="male / female / other", examples=["female"])
    geoloc: list[float] = Field(
        ...,
        min_length=2,
        max_length=2,
        description="[latitude, longitude]",
        examples=[[48.8566, 2.3522]],
    )


class UpdateImageOrderRequest(BaseModel):
    images: list[str] = Field(default_factory=list, description="Новый порядок id картинок пользователя")


class ReportRequest(BaseModel):
    message: str = Field(..., min_length=1, examples=["Fake account"])


class SessionResponse(BaseModel):
    user_id: str = Field(..., examples=["c0ffee00-0000-0000-0000-000000000001"])
    session: str = Field("active", examples=["active"])


class UserPublicResponse(BaseModel):
    id: str
    firstName: str
    bio: str
    images: list[str]
    tags: dict[str, bool]
    orientation: str
    gender: str
    age: int
    elo: int
    distance: float
    matched: bool
    liked: bool
    skipped: bool
    blocked: bool
    commonTags: list[str]
    last_login: int

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "c0ffee00-0000-0000-0000-000000000001",
                "firstName": "Alice",
                "bio": "Hi there",
                "images": ["img1"],
                "tags": {"music": True},
                "orientation": "both",
                "gender": "female",
                "age": 25,
                "elo": 1200,
                "distance": 12.5,
                "matched": False,
                "liked": False,
                "skipped": False,
                "blocked": False,
                "commonTags": ["music"],
                "last_login": 1715600000,
            }
        }
    }


class UserSelfResponse(BaseModel):
    id: str
    firstName: str
    lastName: str
    username: str
    email: EmailStr
    bio: str
    images: list[str]
    tags: dict[str, bool]
    orientation: str
    gender: str
    age: int
    elo: int
    geoloc: str
    completion: int
    last_login: int
