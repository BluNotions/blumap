# Generated by Django 4.2.4 on 2023-09-14 21:24

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='taskDb',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('task', models.CharField(max_length=30)),
                ('priority', models.CharField(max_length=30)),
                ('completed', models.BooleanField(default=False)),
            ],
        ),
    ]
