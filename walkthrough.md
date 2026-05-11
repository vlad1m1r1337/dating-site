# 🎯 Matcha — Анализ проекта и Гайд к защите

## Найденные и исправленные ошибки

### 🔴 Критические баги

| # | Файл | Проблема | Исправление |
|---|------|----------|------------|
| 1 | [chat_service.py](file:///home/maxkram/42-Matcha/server/services/chat_service.py#L47) | REST API возвращал `sender`, а WebSocket — `user_id`. Клиент (`ChatModel.tsx`) ожидает `user_id`. **Все исторические сообщения показывались на неправильной стороне чата.** | `sender` → `user_id` |
| 2 | [user_service.py](file:///home/maxkram/42-Matcha/server/services/user_service.py#L710) | `get_views_by_user` выбирал ВСЕ interactions (likes, blocks, reports...) вместо только `view`. Во вкладке "Views" показывались все, кто взаимодействовал. | Добавлен фильтр `AND type = 'view'` |
| 3 | [user_service.py](file:///home/maxkram/42-Matcha/server/services/user_service.py#L498) | Функция `like` не проверяла наличие фото у пользователя. **PDF требует: "If the current user does not have a profile picture, they cannot perform this action."** | Добавлена проверка `origin["images"]` |
| 4 | [user_service.py](file:///home/maxkram/42-Matcha/server/services/user_service.py#L45) | Не было проверки пароля по словарю. **PDF требует: "Commonly used dictionary words should not be accepted as passwords."** | Создан `common_passwords.py`, добавлена проверка |
| 5 | [user_service.py](file:///home/maxkram/42-Matcha/server/services/user_service.py#L699) | Хардкод email `theo.nard18@gmail.com` в функции report. Личные данные разработчика в коде. | Заменён на `EMAIL["email"]` из env |

### 🟡 Косметические правки

| # | Файл | Проблема | Исправление |
|---|------|----------|------------|
| 6 | [image_controller.py](file:///home/maxkram/42-Matcha/server/controllers/image_controller.py#L20) | OpenAPI-тег стоял `"email"` вместо `"image"` | Исправлен |
| 7 | [App.tsx](file:///home/maxkram/42-Matcha/client/src/App.tsx#L40) | Не было `<footer>` и `<main>`. **PDF: "header, main section, and footer"** | Добавлены семантические HTML-элементы `<main>` и `<footer>` |

---

## ✅ Чеклист соответствия требованиям matcha.pdf

### III. General Instructions

| Требование | Статус | Где реализовано |
|------------|--------|-----------------|
| Docker Compose для запуска | ✅ | `docker-compose.yaml` — 3 сервиса: client, server, db |
| Совместимость Firefox/Chrome | ✅ | React + MUI — кроссбраузерный стек |
| Header, Main, Footer | ✅ | `Header.tsx` + `<main>` + `<footer>` в `App.tsx` |
| Mobile-friendly layout | ✅ | Bootstrap grid + MUI responsive components |
| Валидация всех форм | ✅ | Client-side (regex) + Server-side (body_validator + sanitize) |
| Пароли не в открытом виде | ✅ | bcrypt хеширование (`bcrypt.hashpw`) |
| Защита от XSS/HTML injection | ✅ | `bleach.clean()` + `sanitize_body()` |
| Защита от SQL injection | ✅ | Параметризованные запросы `$1, $2...` через asyncpg |
| Проверка загружаемого контента | ✅ | MIME-проверка через `python-magic`, whitelist: jpeg/png/webp |
| .env не в Git | ✅ | `.gitignore` содержит `.env`, `git ls-files .env` — пусто |

### IV.1 Registration & Sign-in

| Требование | Статус | Где |
|------------|--------|-----|
| Регистрация: email, username, lastName, firstName, password | ✅ | `user_controller.py` POST `/user` |
| Словарные пароли запрещены | ✅ | `common_passwords.py` + `check_password()` |
| Email подтверждение с уникальной ссылкой | ✅ | `email_validation` таблица, `validate_email()` |
| Вход по username + password | ✅ | POST `/user/login`, bcrypt |
| Сброс пароля по email | ✅ | `/email/password/new` + `/email/password` |
| Logout одним кликом с любой страницы | ✅ | Кнопка в `Header.tsx`, POST `/user/logout` |

### IV.2 User Profile

| Требование | Статус | Где |
|------------|--------|-----|
| Gender, Sexual preferences | ✅ | `Profile.tsx` — Select: male/female, hetero/homo/bi |
| Bio | ✅ | Textarea с лимитом 200 символов |
| Tags (reusable) | ✅ | 68 предустановленных тегов, хранятся как JSON boolean map |
| До 5 фото, одно — профильное | ✅ | `images[]`, первое = профильное, лимит 5 |
| Редактирование профиля | ✅ | PUT `/user` |
| Кто смотрел профиль | ✅ | GET `/user/views` — вкладка "Views" |
| Кто лайкнул | ✅ | GET `/user/likes` — вкладка "Likes" |
| Fame rating (elo) | ✅ | Числовое значение, +1 за лайк, -1 за анлайк |
| GPS-геолокация | ✅ | `navigator.geolocation` + fallback на IP через `ip-api.com` |
| Ручное указание локации | ✅ | Draggable маркер на карте Leaflet |

### IV.3 Browsing

| Требование | Статус | Где |
|------------|--------|-----|
| Список предлагаемых профилей | ✅ | `Browsing.tsx` → POST `/profiles/queries` |
| Учёт orientation (гетеро, гомо, би) | ✅ | `compatible()` в `profiles_service.py` |
| Bisexual по умолчанию | ✅ | Значение `"bisexual"` в БД |
| Matching по proximity + tags + elo | ✅ | `get_profiles_filtered()` — фильтрация и подсчёт |
| Приоритет по географии | ✅ | Фильтр distance, сортировка по расстоянию |
| Сортировка: age, location, elo, tags | ✅ | `sortProfiles.tsx` — 4 критерия с asc/desc |
| Фильтрация: age, location, elo, tags | ✅ | Sliders в модалке фильтров |

### IV.4 Research (Advanced Search)

| Требование | Статус | Где |
|------------|--------|-----|
| Поиск по возрасту | ✅ | Slider min_age / max_age |
| Поиск по elo | ✅ | Slider min_elo / max_elo |
| Поиск по расстоянию | ✅ | Slider distance |
| Поиск по тегам | ✅ | Chips с wanted_tags в `Search.tsx` |
| Сортировка и фильтрация результатов | ✅ | Одинаковые компоненты Sort/Filter |

### IV.5 Profile View

| Требование | Статус | Где |
|------------|--------|-----|
| Просмотр профилей других пользователей | ✅ | `ProfileViewer.tsx` через GET `/user/{id}` |
| Вся информация кроме email и password | ✅ | `strip_user()` + удаление `email`, `username`, `geoloc` |
| Запись в историю просмотров | ✅ | `view()` вызывается при GET `/user/{id}` |
| Like/Unlike | ✅ | POST/DELETE `/user/{id}/like` |
| Взаимный лайк = match + chat | ✅ | Автосоздание записи в `chat` при mutual like |
| Нет фото — нельзя лайкать | ✅ | Проверка `origin["images"]` в `like()` |
| Fame rating видна | ✅ | Elo + звёзды в `ProfileViewer.tsx` |
| Online-статус / last login | ✅ | WebSocket `/status`, Chip Online/Offline |
| Report as fake | ✅ | POST `/user/{id}/report` + модалка |
| Block user | ✅ | POST `/user/{id}/block`, скрывает из поиска |
| Видно, лайкнул ли тебя / connected | ✅ | `liked`, `matched` поля в ответе |

### IV.6 Chat

| Требование | Статус | Где |
|------------|--------|-----|
| Real-time чат между connected пользователями | ✅ | WebSocket `/chat`, `ConnectionManager` |
| Видно новые сообщения с любой страницы | ✅ | WebSocket notifications: "sent you a message" |
| Задержка ≤ 10 сек | ✅ | WebSocket — мгновенно |

### IV.7 Notifications

| Требование | Статус | Где |
|------------|--------|-----|
| Получил лайк | ✅ | `notification()` в `like()` |
| Профиль просмотрен | ✅ | `notification()` в `view()` |
| Получил сообщение | ✅ | `notification_socket.send()` в `add_message()` |
| Взаимный лайк (match) | ✅ | `notification()` при mutual like |
| Connected user unlike | ✅ | `notification()` в `unlike()` |
| Видно уведомления с любой страницы | ✅ | WebSocket в `Header.tsx`, SuccessAlert |

---

## 🛡️ Архитектура безопасности (для объяснения на защите)

### Пароли
```
bcrypt.hashpw(password.encode(), bcrypt.gensalt())
```
- **bcrypt** — адаптивный хеш с salt
- Проверка: `bcrypt.checkpw(input, stored_hash)`
- Сложность: regex `(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[спецсимвол]).{8,30}`
- Словарная проверка: список 100+ частых паролей

### SQL Injection
```python
await db.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
```
- **Параметризованные запросы** через asyncpg
- НИ ОДНОГО f-string/format в SQL-запросах

### XSS / HTML Injection
```python
# Серверная сторона:
bleach.clean(value, tags=[], strip=True)    # utils/sanitize.py
bleach.clean(data["content"], tags=[], strip=True)  # chat messages
```
- Все текстовые поля санитизируются при сохранении
- Сообщения чата чистятся от тегов

### Upload Protection
```python
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
mime = magic.from_buffer(image, mime=True)  # проверка по содержимому, не по расширению
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
```

### Rate Limiting
```python
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
# Registration: 5/minute, Image upload: 20/minute, Login: 10/minute
```

### Token Management
- UUID-based session tokens (`secrets.token_urlsafe(48)`)
- Токен истекает через 6 часов
- Макс 5 активных сессий на пользователя
- При каждом запросе обновляется `last_activity`

---

## 🏗️ Архитектура проекта

```
42-Matcha/
├── docker-compose.yaml          # Оркестрация 3 сервисов
├── .env                         # Переменные окружения (в .gitignore)
│
├── client/                      # React + TypeScript + Vite + MUI
│   ├── Dockerfile               # Node 18, pnpm, serve
│   └── src/
│       ├── App.tsx              # Роутинг, Header + Main + Footer
│       └── src/
│           ├── api/Instance.tsx  # Axios с auto-Bearer token
│           ├── pages/           # Login, Register, Profile, Home...
│           ├── components/      # Browsing, Chat, Search, ProfileViewer...
│           └── utils/           # Filters, time helpers
│
├── server/                      # Python FastAPI + asyncpg + WebSocket
│   ├── Dockerfile               # Python 3.11
│   ├── main.py                  # FastAPI app, CORS, routers
│   ├── controllers/             # REST + WebSocket endpoints
│   ├── services/                # Business logic
│   ├── database/                # asyncpg connection pool
│   ├── utils/                   # sanitize, parse_request
│   ├── constants/               # tags, email, domain, passwords
│   └── responses/               # Structured JSON responses
│
└── db/                          # PostgreSQL 14.3
    ├── Dockerfile               # Seed из db.tar.gz
    └── db.tar.gz                # Начальный дамп (500 пользователей)
```

### Стек технологий

| Компонент | Технология |
|-----------|-----------|
| Frontend | React 18 + TypeScript + Vite + MUI (Material UI) |
| Backend | Python 3.11 + FastAPI + Uvicorn |
| Database | PostgreSQL 14.3 + asyncpg |
| Real-time | WebSocket (FastAPI native) — 3 канала: chat, notifications, status |
| Auth | Bearer token (session-based, UUID) |
| Email | SMTP через Gmail (aiosmtplib) |
| Geolocation | GPS (browser) + IP fallback (ip-api.com) + Leaflet карта |
| Security | bcrypt, bleach, python-magic, slowapi |
| Container | Docker Compose, 3 сервиса |

---

## 📋 Гайд по подготовке к защите

### 🚀 Запуск проекта

```bash
# 1. Убедиться что .env на месте
cat .env

# 2. Собрать и запустить
docker-compose up --build

# 3. Открыть
# Frontend: http://localhost:8080
# Backend:  http://localhost:8765
# DB:       localhost:5433
```

### 🎤 Возможные вопросы и ответы на защите

---

#### **Q: Как хранятся пароли?**

> Пароли хешируются с помощью **bcrypt** с автоматически генерируемой солью. В базе хранится только хеш. При логине: `bcrypt.checkpw(input, stored_hash)`. Bcrypt — адаптивный алгоритм, устойчивый к brute-force благодаря cost factor.

#### **Q: Как защищены от SQL injection?**

> Используем **параметризованные запросы** через библиотеку asyncpg. Все значения передаются как `$1, $2, $3...` — база данных сама экранирует их. В проекте нет ни одного SQL-запроса, собранного через string concatenation или f-string.

#### **Q: Как защищены от XSS?**

> Двойная защита:
> 1. **Серверная**: все текстовые поля (имя, фамилия, bio, email, сообщения чата) проходят через `bleach.clean()` с `tags=[]` — удаляются все HTML-теги.
> 2. **Клиентская**: React по умолчанию экранирует JSX-выражения (auto-escaping).

#### **Q: Как проверяются загружаемые файлы?**

> Тройная проверка:
> 1. **MIME-тип по содержимому** (не по расширению): `magic.from_buffer(image, mime=True)` — только jpeg, png, webp
> 2. **Размер**: максимум 5MB
> 3. **Количество**: максимум 5 фото на пользователя

#### **Q: Как работает matching/browsing?**

> Алгоритм в `profiles_service.py`:
> 1. Фильтрация по возрасту, elo, completion = 2
> 2. Исключение заблокированных, уже лайкнутых/скипнутых
> 3. Проверка **сексуальной ориентации**: гетеросексуалы видят только противоположный пол, гомосексуалы — свой, бисексуалы — всех
> 4. Фильтр по расстоянию (geopy.distance)
> 5. Проверка общих тегов и wanted_tags
> 6. Лимит 50 профилей

#### **Q: Как работает real-time (чат и уведомления)?**

> Используются **WebSocket** через FastAPI. Есть 3 отдельных WebSocket-канала:
> - `/chat` — сообщения в чате
> - `/notifications` — уведомления (лайки, просмотры, матчи)
> - `/status` — online/offline статус
>
> Каждый канал управляется своим `ConnectionManager`, который хранит список активных соединений и может отправлять сообщения конкретному пользователю. Задержка < 1 секунды (требование PDF — ≤ 10 сек).

#### **Q: Как работает авторизация?**

> Session-based tokens:
> 1. При логине генерируется `secrets.token_urlsafe(48)` и сохраняется в таблицу `token`
> 2. Клиент хранит токен в `localStorage` и отправляет в заголовке `Authorization: Bearer <token>`
> 3. Каждый запрос проверяет токен: `search_user_by_token()` → находит запись → проверяет `last_activity` (6 часов TTL) → обновляет `last_activity`
> 4. Максимум 5 активных сессий на пользователя

#### **Q: Как работает fame rating (elo)?**

> Числовое значение у каждого пользователя:
> - При лайке: получатель +1, отправитель -0.25
> - При анлайке: получатель -1, и если был взаимный лайк — ещё -1 отправителю
> - Отображается как звёзды: < 20 = пустая, < 100 = половина, < 500 = полная, ≥ 500 = медаль
> - Используется для фильтрации и сортировки при поиске

#### **Q: Как работает геолокация?**

> Двойной подход с уважением приватности:
> 1. **GPS через браузер**: `navigator.geolocation.getCurrentPosition()` — запрашивает разрешение
> 2. **Fallback по IP**: если пользователь отказал — `ip-api.com` определяет примерное расположение
> 3. **Ручное указание**: пользователь может перетащить маркер на карте Leaflet
> 4. Расстояние между пользователями считается через `geopy.distance`

#### **Q: Как работает Docker Compose?**

> 3 сервиса:
> - **matcha-db** (PostgreSQL 14.3) — стартует первым, healthcheck через `pg_isready`
> - **matcha-server** (Python FastAPI) — ждёт healthcheck БД (`condition: service_healthy`)
> - **matcha-client** (React, serve) — ждёт server
>
> Все в одной сети `matcha-network`, переменные окружения из `.env` передаются через `build.args`

#### **Q: Какие данные видны в профиле другого пользователя?**

> Всё кроме email и пароля. В `get_specific_user()` дополнительно скрываются: `username`, `email`, `geoloc` (raw), `lastName`, `completion`. Вместо geoloc показывается рассчитанное расстояние.

#### **Q: Что происходит при unlike?**

> 1. Отправляется уведомление "unliked your profile"
> 2. Elo получателя -1
> 3. Если был взаимный лайк: elo отправителя тоже -1, удаление обоих лайков
> 4. Удаление чата между пользователями
> 5. Удаление skip если был

#### **Q: Как работает блокировка?**

> 1. Создаётся запись `type='block'` в `interactions`
> 2. Автоматический unlike обоих пользователей (удаление чата)
> 3. Заблокированный не появляется в результатах поиска/browsing (проверка `blocked_ids`)
> 4. Чат становится невозможен (чат удалён)
> 5. Уведомления не приходят (нет лайков/просмотров)

#### **Q: В .env какие переменные?**

> - `DATABASE_URL` — подключение к PostgreSQL
> - `DB_USER/PASSWORD/NAME` — для Dockerfile базы
> - `EMAIL/EMAIL_PASSWORD` — для SMTP (Gmail)
> - `URL_FRONT/URL_BACK` — адреса фронта и бэка
> - `VITE_URL_API/VITE_WS_API` — для клиента (build-time)
>
> Все в `.gitignore`, не попадают в Git.

---

### 📌 Важные детали для запоминания

> [!IMPORTANT]
> **Ключевые числа**: 5 фото max, 68 тегов, 50 профилей за запрос, 5 активных сессий, 6 часов TTL токена, 5MB max для фото, 400 символов max сообщение, 200 символов max bio

> [!TIP]
> **База данных** уже содержит ~500 сгенерированных пользователей (db.tar.gz), что позволяет сразу демонстрировать browsing/search без ручной регистрации множества аккаунтов

> [!WARNING]
> Для реального email (подтверждение, сброс пароля) нужно настроить Gmail App Password в `.env`. Для тестовых аккаунтов с доменами `@nofoobar.com` и `@example.com` отправка скипается.

---

### 🔄 Демонстрация на защите — рекомендуемый порядок

1. **Запуск** — `docker-compose up --build`, показать 3 контейнера
2. **Регистрация** — показать валидацию форм, отправку email
3. **Логин** — показать ввод username/password
4. **Профиль** — заполнить gender, orientation, tags, bio, фото, карта
5. **Browsing** — показать предложенные профили, фильтры, сортировку
6. **Like/Skip/Match** — продемонстрировать взаимный лайк
7. **Chat** — отправить сообщение, показать real-time
8. **Notifications** — при лайке/сообщении всплывает SuccessAlert
9. **Online Status** — показать зелёный/красный индикатор
10. **Views/Likes** — вкладки с проcмотрами и лайками
11. **Report/Block** — показать модалку, объяснить последствия
12. **Security** — объяснить bcrypt, parameterized queries, bleach, MIME check
13. **Code tour** — показать структуру: controllers → services → database
