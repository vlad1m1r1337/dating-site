## подключиться к БД

```
docker compose exec matcha-db psql -U matcha -d matcha

\dt
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM interactions;
SELECT COUNT(*) FROM email_validation;
SELECT COUNT(*) FROM chat;
```

