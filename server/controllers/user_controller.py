from fastapi import APIRouter, Depends, Request
import geopy
from database.database import *
from limiter import limiter
from responses.errors.errors_404 import user_not_found
from services.user_service import *
from utils.parse_request import *
from responses.errors.errors_422 import *
from responses.errors.errors_400 import *
from schemas import (
    RegisterRequest,
    LoginRequest,
    UpdateProfileRequest,
    ReportRequest,
    SessionResponse,
    UserPublicResponse,
    UserSelfResponse,
    MessageResponse,
    ErrorResponse,
    bearer_security,
    auth_responses,
    body_responses,
)

user_controller = APIRouter(prefix="/user", tags=["user"])


@user_controller.post(
    "",
    summary="Регистрация нового пользователя",
    description=(
        "Создаёт нового пользователя и отправляет письмо с подтверждением e‑mail. "
        "Ограничено 5 запросами в минуту с IP."
    ),
    response_model=MessageResponse,
    responses={
        201: {"model": MessageResponse, "description": "Пользователь создан"},
        409: {"model": ErrorResponse, "description": "E‑mail или username уже заняты"},
        **body_responses,
    },
    openapi_extra={
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": RegisterRequest.model_json_schema(),
                }
            },
        }
    },
)
@limiter.limit("5/minute")
async def register(request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    # Check if not connected
    validator = body_validator(
        data["body"], ["email", "username", "lastName", "firstName", "password"], str
    )
    if validator is not None:
        return validator
    return await create_user(db, data["body"])


@user_controller.put(
    "",
    summary="Обновить профиль текущего пользователя",
    description="Обновляет публичную информацию профиля. Требует Bearer токен.",
    response_model=MessageResponse,
    responses={
        200: {"model": MessageResponse, "description": "Профиль обновлён"},
        **auth_responses,
        **body_responses,
    },
    openapi_extra={
        "security": bearer_security,
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": UpdateProfileRequest.model_json_schema(),
                }
            },
        },
    },
)
async def profile(request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    validator = body_validator(
        data["body"],
        [
            "email",
            "lastName",
            "firstName",
            "images",
            "bio",
            "tags",
            "orientation",
            "gender",
            "geoloc"
        ],
    )
    if validator is not None:
        return validator
    token = get_token(data["headers"])
    if token is None:
        return empty_token()
    user = await search_user_by_token(db, token)
    if not user:
        return authentication_required()
    if user["completion"] == 0:
        return incomplete_profile()
    return await update_user(db, user, data["body"])


@user_controller.get(
    "",
    summary="Получить свой профиль",
    description="Возвращает полный профиль текущего пользователя по Bearer токену.",
    response_model=UserSelfResponse,
    responses={**auth_responses},
    openapi_extra={"security": bearer_security},
)
async def get_user(request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    token = get_token(data["headers"])
    if token is None:
        return empty_token()
    user = await search_user_by_token(db, token)
    if not user:
        return authentication_required()
    return strip_user(user)


@user_controller.post(
    "/login",
    summary="Вход в систему",
    description=(
        "Возвращает токен сессии при успешной аутентификации. "
        "Ограничено 10 запросами в минуту с IP."
    ),
    responses={
        200: {
            "description": "Успешный логин — выдан токен сессии",
            "content": {
                "application/json": {
                    "example": {
                        "token": "0123abcd-ef45-...",
                        "user_id": "c0ffee00-0000-0000-0000-000000000001",
                    }
                }
            },
        },
        401: {"model": ErrorResponse, "description": "Неверный логин или пароль"},
        **body_responses,
    },
    openapi_extra={
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": LoginRequest.model_json_schema(),
                }
            },
        }
    },
)
@limiter.limit("10/minute")
async def login(request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    validator = body_validator(data["body"], ["username", "password"], str)
    if validator is not None:
        return validator
    return await login_user(db, data["body"])


@user_controller.get(
    "/session",
    summary="Проверка текущей сессии",
    description="Возвращает идентификатор пользователя по Bearer токену, если токен валиден.",
    response_model=SessionResponse,
    responses={**auth_responses},
    openapi_extra={"security": bearer_security},
)
async def get_session(request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    if get_token(data["headers"]) is None:
        return empty_token()
    user_id = await check_token(db, get_token(data["headers"]))
    if user_id is None:
        return invalid_token()
    return session(str(user_id))


@user_controller.post(
    "/logout",
    summary="Выйти из сессии",
    description="Удаляет токен сессии. Требует Bearer токен.",
    response_model=MessageResponse,
    responses={**auth_responses},
    openapi_extra={"security": bearer_security},
)
async def logout(request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    if get_token(data["headers"]) is None:
        return empty_token()
    user_id = await check_token(db, get_token(data["headers"]))
    if user_id is None:
        return invalid_token()
    return await logout_user(db, get_token(data["headers"]))

@user_controller.get(
    "/views",
    summary="Просмотревшие меня пользователи",
    description="Возвращает список пользователей, которые просматривали профиль.",
    responses={**auth_responses},
    openapi_extra={"security": bearer_security},
)
async def get_views(request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    token = get_token(data["headers"])
    if token is None:
        return empty_token()

    user = await search_user_by_token(db, token)
    if not user:
        return authentication_required()
    return await get_views_by_user(db, user)

@user_controller.get(
    "/likes",
    summary="Лайкнувшие меня пользователи",
    description="Возвращает список пользователей, лайкнувших текущего пользователя.",
    responses={**auth_responses},
    openapi_extra={"security": bearer_security},
)
async def get_likes(request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    token = get_token(data["headers"])
    if token is None:
        return empty_token()

    user = await search_user_by_token(db, token)
    if not user:
        return authentication_required()
    return await get_likes_by_user(db, user)

@user_controller.get(
    "/{id}",
    summary="Получить публичный профиль пользователя",
    description=(
        "Возвращает данные другого пользователя: общие теги, дистанцию, "
        "флаги liked/skipped/blocked/matched и т.д. Просмотр фиксируется."
    ),
    response_model=UserPublicResponse,
    responses={
        **auth_responses,
        404: {"model": ErrorResponse, "description": "Пользователь не найден"},
    },
    openapi_extra={"security": bearer_security},
)
async def get_specific_user(id, request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    token = get_token(data["headers"])
    if token is None:
        return empty_token()
    me = await search_user_by_token(db, token)
    if not me:
        return authentication_required()
    user = await search_user_by_id(db, id)
    if not user:
        return user_not_found()
    striped_user = strip_user(user)
    striped_user.pop("username")
    striped_user.pop("email")
    striped_user.pop("geoloc")
    striped_user.pop("lastName")
    striped_user.pop("completion")
    striped_user["liked"] = await is_liked(db, me, user)
    striped_user["skipped"] = await is_skipped(db, me, user)
    striped_user["blocked"] = await is_blocked(db, me, user)
    # if match
    if await is_liked(db, user, me) and await is_liked(db, me, user):
        striped_user["matched"] = True
    else:
        striped_user["matched"] = False
    striped_user["distance"] = geopy.distance.distance(me["geoloc"], user["geoloc"]).km if geopy.distance.distance(me["geoloc"], user["geoloc"]).km > 1 else 1
    striped_user["commonTags"] = []
    striped_user["last_login"] = user["last_activity"]
    me_tags = json.loads(me["tags"])
    user_tags = json.loads(user["tags"])
    for tag in me_tags:
        if me_tags[tag] and user_tags[tag]:
            striped_user["commonTags"].append(tag)
    if await is_viewed(db, me, user) is False:
        await view(db, me, user)
    return striped_user


@user_controller.post(
    "/{id}/like",
    summary="Лайкнуть пользователя",
    response_model=MessageResponse,
    responses={
        **auth_responses,
        404: {"model": ErrorResponse, "description": "Пользователь не найден"},
    },
    openapi_extra={"security": bearer_security},
)
async def like_user(id, request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    token = get_token(data["headers"])
    if token is None:
        return empty_token()
    origin = await search_user_by_token(db, token)
    if not origin:
        return authentication_required()
    recipient = await search_user_by_id(db, id)
    if not recipient:
        return user_not_found()
    if origin["id"] == recipient["id"]:
        return no_self_interact()
    return await like(db, origin, recipient)


@user_controller.delete(
    "/{id}/like",
    summary="Убрать лайк с пользователя",
    response_model=MessageResponse,
    responses={
        **auth_responses,
        404: {"model": ErrorResponse, "description": "Пользователь не найден"},
    },
    openapi_extra={"security": bearer_security},
)
async def unlike_user(id, request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    token = get_token(data["headers"])
    if token is None:
        return empty_token()
    origin = await search_user_by_token(db, token)
    if not origin:
        return authentication_required()
    recipient = await search_user_by_id(db, id)
    if not recipient:
        return user_not_found()
    if origin["id"] == recipient["id"]:
        return no_self_interact()
    return await unlike(db, origin, recipient)


@user_controller.post(
    "/{id}/skip",
    summary="Скипнуть пользователя",
    response_model=MessageResponse,
    responses={
        **auth_responses,
        404: {"model": ErrorResponse, "description": "Пользователь не найден"},
    },
    openapi_extra={"security": bearer_security},
)
async def skip_user(id, request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    token = get_token(data["headers"])
    if token is None:
        return empty_token()
    origin = await search_user_by_token(db, token)
    if not origin:
        return authentication_required()
    recipient = await search_user_by_id(db, id)
    if not recipient:
        return user_not_found()
    if origin["id"] == recipient["id"]:
        return no_self_interact()
    return await skip(db, origin, recipient)


@user_controller.delete(
    "/{id}/skip",
    summary="Убрать скип с пользователя",
    response_model=MessageResponse,
    responses={
        **auth_responses,
        404: {"model": ErrorResponse, "description": "Пользователь не найден"},
    },
    openapi_extra={"security": bearer_security},
)
async def unskip_user(id, request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    token = get_token(data["headers"])
    if token is None:
        return empty_token()
    origin = await search_user_by_token(db, token)
    if not origin:
        return authentication_required()
    recipient = await search_user_by_id(db, id)
    if not recipient:
        return user_not_found()
    if origin["id"] == recipient["id"]:
        return no_self_interact()
    return await unskip(db, origin, recipient)


@user_controller.post(
    "/{id}/block",
    summary="Заблокировать пользователя",
    response_model=MessageResponse,
    responses={
        **auth_responses,
        404: {"model": ErrorResponse, "description": "Пользователь не найден"},
    },
    openapi_extra={"security": bearer_security},
)
async def block_user(id, request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    token = get_token(data["headers"])
    if token is None:
        return empty_token()
    origin = await search_user_by_token(db, token)
    if not origin:
        return authentication_required()
    recipient = await search_user_by_id(db, id)
    if not recipient:
        return user_not_found()
    if origin["id"] == recipient["id"]:
        return no_self_interact()
    return await block(db, origin, recipient)


@user_controller.delete(
    "/{id}/block",
    summary="Разблокировать пользователя",
    response_model=MessageResponse,
    responses={
        **auth_responses,
        404: {"model": ErrorResponse, "description": "Пользователь не найден"},
    },
    openapi_extra={"security": bearer_security},
)
async def unblock_user(id, request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    token = get_token(data["headers"])
    if token is None:
        return empty_token()
    origin = await search_user_by_token(db, token)
    if not origin:
        return authentication_required()
    recipient = await search_user_by_id(db, id)
    if not recipient:
        return user_not_found()
    if origin["id"] == recipient["id"]:
        return no_self_interact()
    return await unblock(db, origin, recipient)


@user_controller.post(
    "/{id}/report",
    summary="Пожаловаться на пользователя",
    description="Отправляет администратору жалобу на профиль с текстом причины.",
    response_model=MessageResponse,
    responses={
        **auth_responses,
        404: {"model": ErrorResponse, "description": "Пользователь не найден"},
        **body_responses,
    },
    openapi_extra={
        "security": bearer_security,
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": ReportRequest.model_json_schema(),
                }
            },
        },
    },
)
async def report_user(id, request: Request, db=Depends(get_database)):
    data = await parse_request(request)
    token = get_token(data["headers"])
    if token is None:
        return empty_token()
    validator = body_validator(data["body"], ["message"], str)
    if validator is not None:
        return validator
    origin = await search_user_by_token(db, token)
    if not origin:
        return authentication_required()
    recipient = await search_user_by_id(db, id)
    if not recipient:
        return user_not_found()
    if origin["id"] == recipient["id"]:
        return no_self_interact()
    return await report(db, origin, recipient, data["body"])
