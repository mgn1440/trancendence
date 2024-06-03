#!/bin/sh

rm db.sqlite3
find . | grep -E "(__pycache__|\.pyc|\.pyo$)" | xargs rm -rf
find ./*/migrations/ -type f ! -name '__init__.py' -exec rm -f {} +

python manage.py makemigrations
python manage.py migrate
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('${DJANGO_ADMIN}', '${DJANGO_ADMIN_EMAIL}', '${DJANGO_ADMIN_PASSWORD}')" | python manage.py shell