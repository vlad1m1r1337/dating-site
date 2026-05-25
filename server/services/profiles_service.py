import json
from responses.errors.errors_400 import *
from constants.tags import TAGS
import geopy.distance


async def get_profiles_filtered(db, user, _filter):
    if _filter["min_age"] > _filter["max_age"]:
        return invalid_age()
    if _filter["min_elo"] > _filter["max_elo"]:
        return invalid_elo()
    if _filter["min_tags"] < 0 or _filter["min_tags"] > 20:
        return invalid_tags()
    if _filter["min_elo"] < 0 or _filter["min_elo"] > 1000 or _filter["max_elo"] < 0 or _filter["max_elo"] > 1000:
        return invalid_elo()
    if _filter["min_age"] < 18 or _filter["min_age"] > 100 or _filter["max_age"] < 18 or _filter["max_age"] > 99:
        return invalid_age()
    if _filter["distance"] > 1000 or _filter["distance"] < 1:
        return invalid_distance()
    for tag in _filter["wanted_tags"]:
        if tag not in TAGS:
            return invalid_tags()

    result = await db.fetch(
        "SELECT * FROM users WHERE id != $1 AND completion = $2 AND age >= $3 AND age <= $4 AND elo >= $5 AND elo <= $6",
        user["id"], 2,
        _filter["min_age"], _filter["max_age"],
        _filter["min_elo"], _filter["max_elo"],
    )

    # Собираем blacklist одним запросом: заблокировавшие нас + кого заблокировали мы
    blacklist_rows = await db.fetch(
        """SELECT origin, recipient FROM interactions
           WHERE type = 'block'
           AND (origin = $1 OR recipient = $1)""",
        user["id"],
    )
    blocked_ids = set()
    for row in blacklist_rows:
        blocked_ids.add(row["origin"])
        blocked_ids.add(row["recipient"])
    blocked_ids.discard(user["id"])

    # ID пользователей которых мы уже лайкнули или скипнули
    skip_like_rows = await db.fetch(
        "SELECT recipient FROM interactions WHERE origin = $1 AND (type = 'like' OR type = 'skip')",
        user["id"],
    )
    hidden_ids = {row["recipient"] for row in skip_like_rows}

    user_tags = user["tags"] if isinstance(user["tags"], dict) else json.loads(user["tags"])
    new_list = []

    for i in result:
        if i["id"] in blocked_ids or i["id"] in hidden_ids:
            continue

        # Проверка ориентации: показываем только совместимые пары
        other_gender = i["gender"]
        other_orientation = i["orientation"]
        my_gender = user["gender"]
        my_orientation = user["orientation"]

        def compatible(my_o, my_g, other_o, other_g):
            # Я вижу этого пользователя?
            if my_o == "heterosexual" and my_g == other_g:
                return False
            if my_o == "homosexual" and my_g != other_g:
                return False
            # Он видит меня?
            if other_o == "heterosexual" and other_g == my_g:
                return False
            if other_o == "homosexual" and other_g != my_g:
                return False
            return True

        if not compatible(my_orientation, my_gender, other_orientation, other_gender):
            continue

        # Расстояние
        try:
            dist_km = geopy.distance.distance(user["geoloc"], i["geoloc"]).km
        except Exception:
            continue
        if dist_km > _filter["distance"]:
            continue

        # Общие теги
        other_tags = i["tags"] if isinstance(i["tags"], dict) else json.loads(i["tags"])
        common_tags = [k for k in user_tags if user_tags.get(k) and other_tags.get(k)]

        if len(common_tags) < _filter["min_tags"]:
            continue

        # Фильтр по wanted_tags
        if _filter["wanted_tags"]:
            if not all(
                tag in other_tags and other_tags[tag]
                for tag in _filter["wanted_tags"]
            ):
                continue

        new_list.append({
            "id": i["id"],
            "distance": max(round(dist_km, 1), 1),
            "commonTags": common_tags,
            "common_tags_number": len(common_tags),
            "age": i["age"],
            "elo": i["elo"],
            "firstName": i["first_name"],
            "image": i["images"][0] if i["images"] else None,
        })

        if len(new_list) >= 50:
            break

    return {"count": len(new_list), "profiles": new_list}
