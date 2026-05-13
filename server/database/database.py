import asyncpg
import os
from pathlib import Path

import dotenv

# Корневой .env при запуске из server/ (иначе не находится postgresql://...@localhost:5433)
_repo_root = Path(__file__).resolve().parents[2]
dotenv.load_dotenv(_repo_root / ".env")
dotenv.load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

_pool = None

async def get_pool():
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=5,
            max_size=20,
            command_timeout=60,
        )
    return _pool

async def get_database():
    pool = await get_pool()
    async with pool.acquire() as connection:
        yield connection
