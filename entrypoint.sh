#!/bin/sh
set -e

# Compile Tailwind CSS at startup (works with volume-mounted static/)
/usr/local/bin/tailwindcss -i ./static/input.css -o ./static/styles.css --minify

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
