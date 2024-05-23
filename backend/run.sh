#!/bin/sh

rm db.sqlite3
find . | grep -E "(__pycache__|\.pyc|\.pyo$)" | xargs rm -rf
find ./*/migrations/ -type f ! -name '__init__.py' -exec rm -f {} +


python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8000