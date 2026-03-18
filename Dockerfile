# --- STAGE 1: Build the React Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /build
ARG VITE_TURNSTILE_SITE_KEY
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Inject the real key into the JS build
RUN VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY npm run build

# --- STAGE 2: Build Python/Django ---
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV APP_HOME=/home/app/web
RUN apt-get update && apt-get install -y libpq-dev gcc curl dos2unix && rm -rf /var/lib/apt/lists/*
RUN addgroup --system app && adduser --system --group app
WORKDIR $APP_HOME
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . $APP_HOME
COPY --from=frontend-builder /build/dist $APP_HOME/frontend/dist
RUN dos2unix $APP_HOME/entrypoint.sh && chmod +x $APP_HOME/entrypoint.sh

# --- THE FIX: Provide placeholders for ALL required env vars ---
RUN SECRET_KEY=build-placeholder \
    GEMINI_API_KEY=build-placeholder \
    TURNSTILE_SECRET_KEY=build-placeholder \
    VITE_TURNSTILE_SITE_KEY=build-placeholder \
    ALLOWED_HOSTS=localhost,127.0.0.1 \
    DEBUG=False \
    python manage.py collectstatic --noinput

RUN chown -R app:app /home/app/ && chmod -R 755 /home/app/web/
USER app
ENTRYPOINT ["/home/app/web/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]