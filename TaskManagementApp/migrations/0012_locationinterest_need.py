# Generated by Django 3.2.25 on 2025-03-09 17:36

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('TaskManagementApp', '0011_auto_20250305_2142'),
    ]

    operations = [
        migrations.AddField(
            model_name='locationinterest',
            name='need',
            field=models.CharField(default=django.utils.timezone.now, max_length=100),
            preserve_default=False,
        ),
    ]
