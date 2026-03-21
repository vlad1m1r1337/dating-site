import bleach
import html

def sanitize_text(value: str) -> str:
    """Убирает HTML теги и экранирует спецсимволы"""
    if not isinstance(value, str):
        return value
    # Сначала убираем все теги
    cleaned = bleach.clean(value, tags=[], attributes={}, strip=True)
    # Затем декодируем HTML entities обратно (bleach их экранирует)
    return cleaned.strip()

def sanitize_body(body: dict, fields: list) -> dict:
    """Санитизирует указанные поля в словаре"""
    if not body:
        return body
    for field in fields:
        if field in body and isinstance(body[field], str):
            body[field] = sanitize_text(body[field])
    return body
