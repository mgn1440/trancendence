# Generated by Django 5.0.6 on 2024-05-21 03:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ft_user', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='uid',
            field=models.IntegerField(unique=True),
        ),
    ]