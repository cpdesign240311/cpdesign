from django.db import models

# Create your models here.

class User(models.Model):
    email = models.CharField(primary_key=True, max_length=50)
    password = models.CharField(max_length=100)
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.email