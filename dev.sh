#!/bin/bash

# 1. Move to frontend and build
echo "🚀 Building React frontend..."
cd frontend
npm run build

# 2. Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Check your React code."
    exit 1
fi

# 3. Go back to root and start Django
cd ..
echo "🐍 Starting Django server..."
# If you use a virtual environment, it will use the active one
python manage.py runserver
