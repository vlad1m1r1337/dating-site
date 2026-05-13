import datetime
import json
import uuid
import bleach
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Request
from database.database import get_database
from responses.success.success_200 import *
from responses.success.success_201 import *
from responses.errors.errors_400 import *
from responses.errors.errors_409 import *
from responses.errors.errors_422 import *
from responses.errors.errors_401 import *
from responses.errors.errors_404 import message_not_found, message_too_long, no_chat_rooms, room_not_found
from utils.parse_request import parse_request
from services.chat_service import check_room, get_chat_rooms
from services.user_service import get_token, search_user_by_token
from controllers.notifications_controller import notification_socket
from schemas import (
    SendMessageRequest,
    ChatRoomsResponse,
    MessageResponse,
    ErrorResponse,
    bearer_security,
    auth_responses,
    body_responses,
)

chat_controller = APIRouter(prefix="/chat", tags=["chat"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[dict] = []

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections.append({'socket': websocket, 'user_id': user_id})

    def disconnect(self, websocket: WebSocket):
        for connection in self.active_connections:
            if connection["socket"] == websocket:
                self.active_connections.remove(connection)
                break

    async def send(self, user_id, message):
        for connection in self.active_connections:
            if connection["user_id"] == user_id:
                await connection["socket"].send_json(message)

    async def broadcast(self, message):
        for connection in self.active_connections:
            await connection["socket"].send_json(message)

chat_socket = ConnectionManager()

@chat_controller.websocket(
    "",
    name="WebSocket чата (token в query)",
)
async def websocket_endpoint(websocket: WebSocket, db=Depends(get_database)):
    if websocket.query_params.get("token") is None:
        await websocket.close(reason="Invalid token")
        return
    user = await search_user_by_token(db, websocket.query_params.get("token"))
    if not user:
        await websocket.close(reason="Invalid token")
        return
    await chat_socket.connect(websocket, user["id"])
    try:
        while True:
            data = await websocket.receive_json()
    except WebSocketDisconnect:
        chat_socket.disconnect(websocket)
        return
    except Exception as e:
        if chat_socket:
            chat_socket.disconnect(websocket)

@chat_controller.get(
    "",
    summary="Список чат‑комнат текущего пользователя",
    description="Возвращает пагинированный список чат-комнат пользователя.",
    response_model=ChatRoomsResponse,
    responses={
        **auth_responses,
        404: {"model": ErrorResponse, "description": "У пользователя нет чат-комнат"},
    },
    openapi_extra={"security": bearer_security},
)
async def get_rooms(request: Request, db=Depends(get_database), limit: int = 50, offset: int = 0):
    token = get_token(request.headers)
    if token is None:
        return empty_token()
    user = await search_user_by_token(db, token)
    if not user:
        return authentication_required()
    limit = max(1, min(limit, 100))
    offset = max(0, offset)
    chat = await get_chat_rooms(db, user, limit=limit, offset=offset)
    if not chat:
        return no_chat_rooms()
    return {"count": len(chat), "rooms": chat}

@chat_controller.post(
    "/{id}/message",
    summary="Отправить сообщение в чат",
    description=(
        "Сохраняет сообщение в комнату с id `{id}` и отправляет его обоим участникам "
        "по WebSocket. HTML-теги вырезаются. Максимум 400 символов."
    ),
    response_model=MessageResponse,
    responses={
        **auth_responses,
        404: {
            "model": ErrorResponse,
            "description": "Комната не найдена / сообщение пустое или слишком длинное",
        },
        **body_responses,
    },
    openapi_extra={
        "security": bearer_security,
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {"schema": SendMessageRequest.model_json_schema()}
            },
        },
    },
)
async def add_message(id, request: Request, db=Depends(get_database)):
    token = get_token(request.headers)
    if token is None:
        return empty_token()
    user = await search_user_by_token(db, token)
    if not user:
        return authentication_required()
    data = await parse_request(request)
    validator = body_validator(data["body"], ["content"], str)
    if validator is not None:
        return validator
    data = data["body"]
    room = await check_room(db, id)
    if room is None:
        return room_not_found()
    data["content"] = bleach.clean(data["content"], tags=[], strip=True)
    if len(data["content"]) < 1:
        return message_not_found()
    elif len(data["content"]) > 400:
        return message_too_long()
    elif room["user_1"] != user["id"] and room["user_2"] != user["id"]:
        return room_not_found()
    else:
        other = room["user_2"] if room["user_1"] == user["id"] else room["user_1"]
        await db.execute(
            """INSERT INTO messages (id, chat_id, user_id, content, date) VALUES ($1, $2, $3, $4, $5)""",
            str(uuid.uuid4()), id, user["id"], data["content"], int(datetime.datetime.now().timestamp())
        )
        content = {"id": str(id), "content": data["content"], "user_id": str(user["id"]), "date": int(datetime.datetime.now().timestamp())}
        await chat_socket.send(other, content)
        await chat_socket.send(user["id"], content)
        await notification_socket.send(other, {"message": f"{user['first_name']} sent you a message", "type": "message", "id": id})
        return message_sent()
