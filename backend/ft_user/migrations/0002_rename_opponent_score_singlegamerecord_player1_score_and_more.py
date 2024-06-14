# Generated by Django 5.0.6 on 2024-06-13 13:48

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ft_user', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='singlegamerecord',
            old_name='opponent_score',
            new_name='player1_score',
        ),
        migrations.RenameField(
            model_name='singlegamerecord',
            old_name='user_score',
            new_name='player2_score',
        ),
        migrations.RemoveField(
            model_name='singlegamerecord',
            name='opponent_name',
        ),
        migrations.RemoveField(
            model_name='singlegamerecord',
            name='opponent_profile',
        ),
        migrations.RemoveField(
            model_name='singlegamerecord',
            name='user',
        ),
        migrations.AddField(
            model_name='singlegamerecord',
            name='player1',
            field=models.ForeignKey(blank=True, db_column='player1', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='player1', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='singlegamerecord',
            name='player2',
            field=models.ForeignKey(blank=True, db_column='player2', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='player2', to=settings.AUTH_USER_MODEL),
        ),
    ]