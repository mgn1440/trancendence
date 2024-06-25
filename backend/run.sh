#!/bin/sh

# rm db.sqlite3
find . | grep -E "(__pycache__|\.pyc|\.pyo$)" | xargs rm -rf
find ./*/migrations/ -type f ! -name '__init__.py' -exec rm -f {} +

python manage.py makemigrations
python manage.py migrate
mkdir log
touch log/django.log
gunicorn backend.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --logger-class backend.logger.UniformLogger 2>&1 | tee -a log/django.log