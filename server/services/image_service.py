import magic
import uuid

from responses.errors.errors_400 import image_invalid, missing_body, too_many_images
from responses.errors.errors_404 import image_not_found
from responses.success.success_201 import image_success
from responses.success.success_200 import success_200

MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_IMAGES_PER_USER = 5
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}


async def image_upload(db, user, form):
    if "image" not in form:
        return missing_body()

    if len(user["images"] or []) >= MAX_IMAGES_PER_USER:
        return too_many_images()

    image = await form["image"].read()

    # Проверяем размер
    if len(image) > MAX_IMAGE_SIZE:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=400,
            content={"message": "Image too large (max 5MB)"}
        )

    # Проверяем реальный тип по содержимому (не по расширению)
    mime = magic.from_buffer(image, mime=True)
    if mime not in ALLOWED_MIME:
        return image_invalid()

    image_id = uuid.uuid4()
    await db.execute(
        "INSERT INTO images (id, user_id, image) VALUES ($1, $2, $3)",
        image_id,
        user["id"],
        image,
    )
    return image_success(url=f"{image_id}")


async def image_delete(db, user, image_id):
    try:
        parsed_image_id = uuid.UUID(image_id)
    except ValueError:
        return image_not_found()

    image = await db.fetchrow(
        "SELECT id FROM images WHERE id = $1 AND user_id = $2",
        parsed_image_id,
        user["id"],
    )
    if not image:
        return image_not_found()

    await db.execute(
        "UPDATE users SET images = array_remove(images, $1) WHERE id = $2",
        parsed_image_id,
        user["id"],
    )
    await db.execute("DELETE FROM images WHERE id = $1", parsed_image_id)
    return success_200()
