#!/usr/bin/env python3
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from limiter import limiter
from controllers.user_controller import user_controller
from controllers.profiles_controller import profiles_controller
from controllers.email_controller import email_controller
from controllers.image_controller import image_controller
from controllers.geoloc_controller import geoloc_controller
from controllers.notifications_controller import notifications_controller
from controllers.chat_controller import chat_controller
from controllers.status_controller import status_controller
from controllers.tags_controller import tags_controller
import os
import dotenv
import logging

dotenv.load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("matcha")


tags_metadata = [
    {
        "name": "user",
        "description": (
            "Регистрация, аутентификация, профиль пользователя, "
            "лайки/скипы/блоки/репорты."
        ),
    },
    {
        "name": "profiles",
        "description": "Поиск/подбор анкет с фильтрами по возрасту, elo, тегам и дистанции.",
    },
    {
        "name": "email",
        "description": "Подтверждение e‑mail, запрос и сброс пароля.",
    },
    {
        "name": "image",
        "description": "Загрузка фотографий пользователя и отдача по id.",
    },
    {
        "name": "geoloc",
        "description": "Определение геолокации пользователя по IP.",
    },
    {
        "name": "notifications",
        "description": "WebSocket уведомлений (новые лайки, сообщения и т.д.).",
    },
    {
        "name": "chat",
        "description": "Список чат-комнат, отправка сообщений и WebSocket чата.",
    },
    {
        "name": "status",
        "description": "Список пользователей онлайн и broadcast по WS.",
    },
    {
        "name": "tags",
        "description": "Список доступных тегов интересов.",
    },
]


app = FastAPI(
    title="Matcha API",
    description=(
        "Backend API для dating-приложения **Matcha**.\n\n"
        "Большинство ручек требуют заголовок `Authorization: Bearer <token>`, "
        "который выдаётся при `POST /user/login`.\n\n"
        "WebSocket'ы (`/chat`, `/notifications`, `/status`) принимают токен "
        "в query-параметре `?token=...`."
    ),
    version="1.0.0",
    openapi_tags=tags_metadata,
    contact={"name": "Matcha team"},
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_parameters={"persistAuthorization": True},
)


def custom_openapi():
    """Расширяем сгенерированную OpenAPI-схему: добавляем BearerAuth."""
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        tags=tags_metadata,
    )
    components = openapi_schema.setdefault("components", {})
    security_schemes = components.setdefault("securitySchemes", {})
    security_schemes["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "session-token",
        "description": (
            "Токен сессии, выдаваемый `POST /user/login`. "
            "Передаётся в заголовке `Authorization: Bearer <token>`."
        ),
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("URL_FRONT").strip("/"),
        os.getenv("URL_BACK").strip("/"),
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "PUT"],
    allow_headers=["Authorization", "Content-Type", "Access-Control-Allow-Origin"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"}
    )

@app.get(
    "/",
    tags=["health"],
    summary="Health check",
    description="Простой эндпоинт для проверки, что сервер запущен.",
    responses={200: {"content": {"application/json": {"example": {"status": "ok"}}}}},
)
async def root():
    return {"status": "ok"}

app.include_router(user_controller)
app.include_router(email_controller)
app.include_router(profiles_controller)
app.include_router(image_controller)
app.include_router(geoloc_controller)
app.include_router(notifications_controller)
app.include_router(chat_controller)
app.include_router(status_controller)
app.include_router(tags_controller)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8765, reload=True)
