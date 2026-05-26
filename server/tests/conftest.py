import asyncio
import datetime
import os
import random
import secrets
import string
import uuid

import asyncpg
import dotenv
import requests

str = "".join(
    random.choices(
        string.ascii_uppercase + string.digits + string.ascii_lowercase, k=10
    )
)
token = None
dotenv.load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")


def generate_token():
    global token
    if token is not None:
        return token
    preset_token = os.getenv("LOCAL_TEST_TOKEN")
    if preset_token:
        token = preset_token
        return token

    async def _create_token():
        db = await asyncpg.connect(DATABASE_URL)
        try:
            user = await db.fetchrow(
                """
                SELECT id
                FROM users
                WHERE completion >= 1
                ORDER BY random()
                LIMIT 1
                """
            )
            if not user:
                user = await db.fetchrow("SELECT id FROM users ORDER BY random() LIMIT 1")
            token_id = f"{uuid.uuid4()}"
            token_value = secrets.token_urlsafe(48)
            now = datetime.datetime.now(datetime.timezone.utc).timestamp()
            await db.execute(
                """
                INSERT INTO token (id, token, user_id, creation_date, last_activity)
                VALUES ($1, $2, $3, $4, $5)
                """,
                token_id,
                token_value,
                user["id"],
                now,
                now,
            )
            return token_value
        finally:
            await db.close()

    token = asyncio.run(_create_token())
    return token


async def generate_id():
    db = await asyncpg.connect(DATABASE_URL)
    _id = await db.fetchrow("SELECT id FROM users")
    await db.close()
    return _id["id"]

TAGS = {
    "#cinema" : False,
    "#music" : False,
    "#bar" : False,
    "#hiking" : False,
    "#biking" : False,
    "#cooking" : False,
    "#photography" : False,
    "#gaming" : False,
    "#reading" : False,
    "#dancing" : False,
    "#painting" : False,
    "#skiing" : False,
    "#traveling" : False,
    "#yoga" : False,
    "#gardening" : False,
    "#fishing" : False,
    "#surfing" : False,
    "#golfing" : False,
    "#wine" : False,
    "#beer" : False,
    "#coffee" : False,
    "#tea" : False,
    "#running" : False,
    "#writing" : False,
    "#knitting" : False,
    "#crafting" : False,
    "#theater" : False,
    "#karaoke" : False,
    "#camping" : False,
    "#beach" : False,
    "#concerts" : False,
    "#museums" : False,
    "#boardgames" : False,
    "#puzzles" : False,
    "#astronomy" : False,
    "#stargazing" : False,
    "#fitness" : False,
    "#meditation" : False,
    "#poetry" : False,
    "#DIY" : False,
    "#technology" : False,
    "#vintage" : False,
    "#cars" : False,
    "#pets" : False,
    "#sailing" : False,
    "#rockclimbing" : False,
    "#foodie" : False,
    "#fashion" : False,
    "#history" : False,
    "#languages" : False,
    "#filmlovers" : False,
    "#musicians" : False,
    "#outdoorlife" : False,
    "#bookclub" : False,
    "#gamer" : False,
    "#literature" : False,
    "#art" : False,
    "#winetasting" : False,
    "#brewerytour" : False,
    "#teatime" : False,
    "#journaling" : False,
    "#campfire" : False,
    "#livemusic" : False,
    "#museum" : False,
    "#games" : False,
    "#mindfulness" : False,
    "#adventure" : False
}