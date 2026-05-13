from fastapi import APIRouter, Depends,WebSocket, WebSocketDisconnect, Request
from database.database import get_database
from responses.success.success_200 import *
from responses.success.success_201 import *
from responses.errors.errors_400 import *
from responses.errors.errors_409 import *
from responses.errors.errors_422 import *
from responses.errors.errors_401 import *
from constants.tags import TAGS
from schemas import TagsResponse

tags_controller = APIRouter(prefix="/tags", tags=["tags"])

@tags_controller.get(
    "",
    summary="Список доступных тегов",
    description="Возвращает полный список ключей тегов, которые пользователь может выбрать в профиле.",
    response_model=TagsResponse,
)
async def fetch_tags():
    return JSONResponse(content={"tags": list(TAGS.keys())}, status_code=200)
