# Generated by Django 5.0.6 on 2024-06-14 06:46

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ft_user', '0004_remove_multigamerecord_created_at_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='singlegamedetail',
            name='game',
            field=models.ForeignKey(db_column='game', on_delete=django.db.models.deletion.CASCADE, to='ft_user.singlegamerecord'),
        ),
    ]