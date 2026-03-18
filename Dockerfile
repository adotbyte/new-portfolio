# --- STAGE 1: Build the React Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /build

# Define Build Arguments (These must match your GitHub Secrets names)
ARG VITE_TURNSTILE_SITE_KEY

# Copy only package files first to leverage Docker cache
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend
COPY frontend/ ./

# CRITICAL: Vite needs the variable during the 'build' command
RUN VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY npm run build

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

# 5. Copy React Build from Stage 1
COPY --from=frontend-builder /build/dist $APP_HOME/frontend/dist

# 6. Fix line endings and permissions
RUN dos2unix $APP_HOME/entrypoint.sh && chmod +x $APP_HOME/entrypoint.sh

# 7. Collect static files
# Note: Python build-placeholders are fine here as long as the 
# frontend was already built with the real VITE_ key in Stage 1.
RUN SECRET_KEY=build-placeholder \
    ALLOWED_HOSTS=localhost,127.0.0.1 \
    DEBUG=False \
    python manage.py collectstatic --noinput

# 8. Final Permissions
RUN chown -R app:app /home/app/ && chmod -R 755 /home/app/web/

USER app

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

ENTRYPOINT ["/home/app/web/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]