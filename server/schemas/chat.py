"""Схемы для /chat."""

from pydantic import BaseModel, Field


class SendMessageRequest(BaseModel):
    content: str = Field(
        ...,
        min_length=1,
        max_length=400,
        description="Текст сообщения (после санитизации). HTML‑теги вырезаются.",
        examples=["Привет!"],
    )


class ChatRoom(BaseModel):
    id: str
    user_1: str
    user_2: str
    last_message: str | None = None


class ChatRoomsResponse(BaseModel):
    count: int
    rooms: list[ChatRoom]
