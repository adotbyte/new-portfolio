# --- STAGE 1: Build the React Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /build
# Copy only package files first to leverage Docker cache
COPY frontend/package*.json ./
RUN npm install
# Copy the rest of the frontend and build
COPY frontend/ ./
RUN npm run build

# --- STAGE 2: Build the Python/Django App ---
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HOME=/home/app
ENV APP_HOME=/home/app/web
ENV DEBIAN_FRONTEND=noninteractive

# 1. Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev gcc curl dos2unix && rm -rf /var/lib/apt/lists/*

# 2. Security: Create a non-root user
RUN addgroup --system app && adduser --system --group app
WORKDIR $APP_HOME

# 3. Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# 4. Copy project files
COPY . $APP_HOME

# --- CRITICAL STEP: Copy React Build from Stage 1 ---
# This pulls the 'dist' folder into your Django project structure
COPY --from=frontend-builder /build/dist $APP_HOME/frontend/dist

# 5. Fix line endings and permissions
RUN dos2unix $APP_HOME/entrypoint.sh && chmod +x $APP_HOME/entrypoint.sh

# 6. Collect static files
RUN SECRET_KEY=build-placeholder \
    GEMINI_API_KEY=build-placeholder \
    ALLOWED_HOSTS=localhost,127.0.0.1 \
    DEBUG=False \
    EMAIL_HOST=localhost \
    EMAIL_PORT=587 \
    EMAIL_USE_TLS=True \
    EMAIL_HOST_USER=none \
    EMAIL_HOST_PASSWORD=none \
    NOTIFY_EMAIL=none \
    python manage.py collectstatic --noinput

# 7. Final Permissions
RUN chown -R app:app /home/app/ && chmod -R 755 /home/app/web/

USER app
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

ENTRYPOINT ["/home/app/web/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]