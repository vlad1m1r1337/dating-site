import logging

import aiosmtplib
from constants.email import EMAIL

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


async def send_email(email, subject, body, html=None):
    try:
        if "@nofoobar.com" in email or "@example.com" in email:
            return True
        msg = MIMEMultipart("alternative" if html else "mixed")
        msg.preamble = subject
        msg["Subject"] = subject
        msg["From"] = EMAIL["email"]
        msg["To"] = email
        msg.attach(MIMEText(body, "plain", "utf-8"))
        if html:
            msg.attach(MIMEText(html, "html", "utf-8"))
        smtp = aiosmtplib.SMTP(hostname=EMAIL["host"], port=EMAIL["port"], use_tls=True)
        await smtp.connect()
        await smtp.login(EMAIL["email"], EMAIL["password"])
        await smtp.send_message(msg)
        await smtp.quit()
        return True
    except Exception:
        logger.exception(
            "SMTP send failed (host=%s port=%s from=%s to=%s)",
            EMAIL["host"],
            EMAIL["port"],
            EMAIL["email"],
            email,
        )
        return False
