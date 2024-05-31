# Generated by Django 5.0.6 on 2024-05-31 09:13

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ft_user', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SingleGameRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_score', models.IntegerField()),
                ('opponent_id', models.IntegerField()),
                ('opponent_score', models.IntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]