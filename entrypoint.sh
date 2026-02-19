#!/bin/sh

# 1. Wait for the database (optional but recommended)
# if you use Postgres, you'd wait for the port here.

# 2. Run Migrations automatically
echo "Applying database migrations..."
python manage.py migrate --noinput

# 3. Collect Static files (if you didn't do it in the Dockerfile)
echo "Collecting static files..."
python manage.py collectstatic --noinput

# 4. Start the server
# This 'exec "$@"' tells Docker to run whatever is in your Dockerfile CMD
exec "$@"