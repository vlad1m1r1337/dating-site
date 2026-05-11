import bleach
from services.user_service import search_user_by_id


async def get_chat_rooms(db, user, limit: int = 50, offset: int = 0):
    rooms = await db.fetch(
        "SELECT * FROM chat WHERE user_1 = $1 OR user_2 = $1", user["id"]
    )
    if not rooms:
        return []

    user_ids = set()
    for room in rooms:
        user_ids.add(room["user_1"])
        user_ids.add(room["user_2"])

    users_rows = await db.fetch(
        "SELECT id, first_name, images FROM users WHERE id = ANY($1::uuid[])",
        list(user_ids)
    )
    users_map = {
        str(u["id"]): {
            "id": str(u["id"]),
            "firstName": u["first_name"],
            "image": u["images"][0] if u["images"] else None,
        }
        for u in users_rows
    }

    room_ids = [room["id"] for room in rooms]
    messages_rows = await db.fetch(
        """
        SELECT chat_id, user_id, content, date
        FROM messages
        WHERE chat_id = ANY($1::uuid[])
        ORDER BY date ASC
        LIMIT $2 OFFSET $3
        """,
        room_ids, limit, offset
    )
    messages_map = {}
    for msg in messages_rows:
        cid = str(msg["chat_id"])
        if cid not in messages_map:
            messages_map[cid] = []
        messages_map[cid].append({
            "user_id": str(msg["user_id"]),
            "content": bleach.clean(msg["content"], tags=[], strip=True),
            "date": msg["date"],
        })

    _rooms = []
    for room in rooms:
        rid = str(room["id"])
        u1 = users_map.get(str(room["user_1"]))
        u2 = users_map.get(str(room["user_2"]))
        if u1 and u1["id"] != str(user["id"]):
            u1, u2 = u2, u1
        _rooms.append({
            "id": rid,
            "user_1": u1,
            "user_2": u2,
            "messages": messages_map.get(rid, []),
        })

    return _rooms


async def check_room(db, room_id):
    try:
        return await db.fetchrow("SELECT * FROM chat WHERE id = $1", room_id)
    except Exception:
        return None
