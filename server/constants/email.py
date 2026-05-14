import dotenv
import os

dotenv.load_dotenv()


def _normalize_smtp_password(raw: str | None) -> str:
    """Yandex/Gmail app passwords are shown as four groups; SMTP expects one string."""
    if not raw:
        return ""
    return raw.strip().replace(" ", "")


EMAIL = {
    "email": (os.getenv("EMAIL") or "").strip(),
    "password": _normalize_smtp_password(os.getenv("EMAIL_PASSWORD")),
    "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
    "port": int(os.getenv("SMTP_PORT", "465")),
}
