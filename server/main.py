#!/usr/bin/env python3
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
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

app = FastAPI()
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

@app.get("/")
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
