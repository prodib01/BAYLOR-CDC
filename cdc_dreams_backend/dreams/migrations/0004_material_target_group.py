# Generated by Django 5.0.6 on 2024-06-20 13:15

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dreams', '0003_remove_participant_education_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='material',
            name='target_group',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='dreams.agegroup'),
            preserve_default=False,
        ),
    ]