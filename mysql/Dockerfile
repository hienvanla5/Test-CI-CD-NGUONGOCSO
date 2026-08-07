# syntax=docker/dockerfile:1

# Custom MySQL image for NGUỒN GỐC SỐ.
#
# The app has Flyway disabled (spring.flyway.enabled=false); the canonical
# schema + seed data live in backend/src/main/resources/db/migration (V1..V20).
# MySQL's docker-entrypoint only auto-executes files directly inside
# /docker-entrypoint-initdb.d on first start, so we:
#   1. copy the master init script (which uses SOURCE to load migrations
#      in strict dependency order),
#   2. copy the migration files into the image.
# No bind mounts into /docker-entrypoint-initdb.d are needed, which also
# avoids Docker's mountpoint-creation failure on read-only image layers.

FROM mysql:8.0

COPY mysql-init/init.sql /docker-entrypoint-initdb.d/00-init.sql
COPY backend/src/main/resources/db/migration /docker-entrypoint-initdb.d/migrations

# MySQL recommends utf8mb4
CMD ["mysqld", "--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]

EXPOSE 3306