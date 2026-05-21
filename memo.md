## подключиться к БД

```
docker compose exec matcha-db psql -U matcha -d matcha

\dt
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM interactions;
SELECT COUNT(*) FROM email_validation;
SELECT COUNT(*) FROM chat;
```

## сборка с VITE

```
docker compose build --build-arg ARG_VITE_URL_API=http://localhost:8765 --build-arg ARG_VITE_WS_API=ws://localhost:8765 matcha-client
```