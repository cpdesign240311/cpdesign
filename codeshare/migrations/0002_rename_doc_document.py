# Generated by Django 5.0.3 on 2024-05-13 10:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('codeshare', '0001_initial'),
        ('webapp', '0004_alter_group_modified_date'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Doc',
            new_name='Document',
        ),
    ]
