# ==============================================================================
# MediCare Platform — Backend Dockerfile (Multi-stage build)
# Java 21 / Spring Boot 3.3.5 / Alpine Linux
# ==============================================================================

# Stage 1: Build JAR
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source and compile
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Lightweight runtime image
FROM eclipse-temurin:21-jre-alpine AS runtime

# Security: create dedicated non-root user
RUN addgroup -S medicare && adduser -S medicare -G medicare

WORKDIR /app

# Copy executable jar from builder stage
COPY --from=builder /build/target/*.jar app.jar
RUN chown -R medicare:medicare /app

USER medicare

# Port dynamically set by cloud providers (Render, Koyeb) or defaults to 8080
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

# Health check against /api/public/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT:-8080}/api/public/health || exit 1

# Launch JVM with container-aware memory limits
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
