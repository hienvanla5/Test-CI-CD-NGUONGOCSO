# syntax=docker/dockerfile:1

# ============================================================
# Stage 1: Build
# ============================================================
FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /app

# Cache Maven dependencies: copy wrapper + pom first
COPY pom.xml ./
COPY .mvn ./.mvn
COPY mvnw mvnw.cmd ./

RUN chmod +x mvnw \
    && ./mvnw -B dependency:go-offline

# Copy application sources and build the jar (skip tests to avoid DB dependency)
COPY src ./src
RUN ./mvnw -B -DskipTests package

# ============================================================
# Stage 2: Runtime (minimal JRE)
# ============================================================
FROM eclipse-temurin:21-jre-jammy

# curl is used by the health check; mysql clients are used by the
# backup/restore feature (mysqldump / mysql commands)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Run as non-root user
RUN groupadd -r spring && useradd -r -g spring -d /app spring

WORKDIR /app

COPY --from=build /app/target/backend-01.jar app.jar

# Create runtime directories writable by the non-root user
# (uploads/QR/backups are typically bind-mounted from the host)
RUN mkdir -p /app/uploads /app/files/qr /app/backups \
    && chown -R spring:spring /app

USER spring

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
    CMD curl -fsS http://localhost:8080/actuator/health || exit 1

# Database config and secrets are injected at runtime via environment variables
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
