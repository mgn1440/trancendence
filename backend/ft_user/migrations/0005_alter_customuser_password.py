# Generated by Django 5.0.6 on 2024-05-21 07:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ft_user', '0004_emailtotpdevice'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='password',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]