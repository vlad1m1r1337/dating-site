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


class ChatUser(BaseModel):
    id: str
    firstName: str
    image: str | None = None


class ChatMessage(BaseModel):
    user_id: str
    content: str
    date: int


class ChatRoom(BaseModel):
    id: str
    user_1: ChatUser | None = None
    user_2: ChatUser | None = None
    messages: list[ChatMessage] = []


class ChatRoomsResponse(BaseModel):
    count: int
    rooms: list[ChatRoom]
