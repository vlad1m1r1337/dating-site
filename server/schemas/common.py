"""Общие схемы и хелперы для Swagger-документации."""

from typing import Any
from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    """Стандартный ответ-сообщение от API."""
    message: str = Field(..., description="Текст сообщения от сервера", examples=["ok"])


class ErrorResponse(BaseModel):
    """Ответ при ошибке."""
    message: str = Field(..., description="Описание ошибки", examples=["Authentication is required"])


bearer_security = [{"BearerAuth": []}]


auth_responses: dict[int | str, dict[str, Any]] = {
    401: {
        "model": ErrorResponse,
        "description": "Не передан / невалидный токен, либо профиль ещё не дозаполнен",
    },
}


body_responses: dict[int | str, dict[str, Any]] = {
    400: {
        "model": ErrorResponse,
        "description": "Отсутствует/некорректное тело запроса или поля",
    },
    422: {
        "model": ErrorResponse,
        "description": "Семантически невалидные данные (e‑mail, пароль, теги и т.д.)",
    },
}
