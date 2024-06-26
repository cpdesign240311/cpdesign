from django.contrib import admin
from .models import Document, Doc_user_permission

# Register your models here.

admin.site.register(Document)
admin.site.register(Doc_user_permission)