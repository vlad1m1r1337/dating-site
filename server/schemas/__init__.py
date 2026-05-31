"""Pydantic схемы для документации OpenAPI/Swagger.

Эти модели не используются runtime-валидацией (валидация идёт через body_validator),
а нужны исключительно для генерации красивых схем в Swagger UI (/docs).
"""

from .common import (
    MessageResponse,
    ErrorResponse,
    auth_responses,
    body_responses,
    bearer_security,
)
from .user import (
    RegisterRequest,
    LoginRequest,
    UpdateProfileRequest,
    UpdateImageOrderRequest,
    ReportRequest,
    SessionResponse,
    UserPublicResponse,
    UserSelfResponse,
)
from .email import (
    EmailConfirmRequest,
    AskResetPasswordRequest,
    ResetPasswordRequest,
)
from .profiles import (
    ProfilesQueryRequest,
)
from .chat import (
    SendMessageRequest,
    ChatRoomsResponse,
)
from .geoloc import GeolocResponse
from .status import StatusResponse
from .tags import TagsResponse

__all__ = [
    "MessageResponse",
    "ErrorResponse",
    "auth_responses",
    "body_responses",
    "bearer_security",
    "RegisterRequest",
    "LoginRequest",
    "UpdateProfileRequest",
    "UpdateImageOrderRequest",
    "ReportRequest",
    "SessionResponse",
    "UserPublicResponse",
    "UserSelfResponse",
    "EmailConfirmRequest",
    "AskResetPasswordRequest",
    "ResetPasswordRequest",
    "ProfilesQueryRequest",
    "SendMessageRequest",
    "ChatRoomsResponse",
    "GeolocResponse",
    "StatusResponse",
    "TagsResponse",
]
