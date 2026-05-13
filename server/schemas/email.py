"""Схемы для /email."""

from pydantic import BaseModel, EmailStr, Field


class EmailConfirmRequest(BaseModel):
    token: str = Field(..., description="Токен подтверждения e‑mail из письма")


class AskResetPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Адрес, на который придёт письмо для сброса пароля")


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="Токен сброса пароля из письма")
    password: str = Field(..., min_length=8, description="Новый пароль")
