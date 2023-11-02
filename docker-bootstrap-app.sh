
#!/bin/sh
DATABASE_URL="postgres://postgres:postgres@db:5432/postgres?sslmode=disable" npx prisma migrate deploy
# start app
DATABASE_URL="postgres://postgres:postgres@db:5432/postgres?sslmode=disable" node server.js