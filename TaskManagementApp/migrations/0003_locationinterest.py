# Generated by Django 4.2.4 on 2023-09-17 02:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('TaskManagementApp', '0002_taskdb_time_date'),
    ]

    operations = [
        migrations.CreateModel(
            name='LocationInterest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('interest', models.TextField()),
            ],
        ),
    ]
