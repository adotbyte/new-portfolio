# Use a specific, stable version for reproducibility
FROM python:3.12-slim

# 1. Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HOME=/home/app
ENV APP_HOME=/home/app/web
ENV DEBIAN_FRONTEND=noninteractive

ENV GEMINI_API_KEY=placeholder
ENV ALLOWED_HOSTS=127.0.0.1,localhost
ENV SECRET_KEY=zfXko35q2TkTP1
ENV DEBUG=False

# 2. Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    curl \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# 3. Security: Create a non-root user
RUN addgroup --system app && adduser --system --group app

# 4. Set work directory
WORKDIR $APP_HOME

# 5. Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 6. Copy project files
COPY . $APP_HOME

# 7. DEBUG & FIX (Modified this section)
# We use 'ls' to print the folder content to the logs. 
# If entrypoint.sh isn't in the list, we'll see it in the GitHub Action log.
RUN ls -la /home/app/web/ && \
    dos2unix /home/app/web/entrypoint.sh && \
    chmod +x /home/app/web/entrypoint.sh

# 8. Collect static files
RUN python manage.py collectstatic --noinput

# 9. Final Permissions
RUN chown -R app:app /home/app/ && \
    chmod -R 755 /home/app/web/

# 10. Switch to non-root user
USER app

# 11. Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

# 12. Execution
ENTRYPOINT ["/home/app/web/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]