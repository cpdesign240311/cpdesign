from django.db import models
from login.models import User
import uuid

# Create your models here.

#그룹으로 변경
class Group(models.Model):
    group_id = models.AutoField(primary_key=True)
    group_password = models.CharField(max_length=81, null=True, default=None)
    title = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)
    address = models.TextField()

    def __str__(self):
        return f"{self.title} (group_id : {self.group_id})"

class Grp_user_permission(models.Model):
    group_id = models.ForeignKey(Group, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    readable = models.BooleanField(default=True)
    writable = models.BooleanField(default=True)

    class Meta:
        unique_together = (('group_id', 'user_id'),)

    def __str__(self):
        return f"group_id : {self.group_id}, user_id : {self.user_id}"

#그룹 가입 요청
class Grp_join_request(models.Model):
    group_id = models.ForeignKey(Group, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    request_date = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (('group_id', 'user_id'),)
    
    def __str__(self):
        return f"group_id : {self.group_id}, user_id : {self.user_id}"



#기존 코드
class Document(models.Model):
    doc_id = models.AutoField(primary_key=True)
    doc_password = models.CharField(max_length=81, null=True, default=None)
    title = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now_add=True)
    address = models.TextField()

    def __str__(self):
        return f"{self.title} (doc_id : {self.doc_id})"

class Doc_user_permission(models.Model):
    doc_id = models.ForeignKey(Document, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    readable = models.BooleanField(default=True)
    writable = models.BooleanField(default=True)

    class Meta:
        unique_together = (('doc_id', 'user_id'),)

    def __str__(self):
        return f"doc_id : {self.doc_id}, user_id : {self.user_id}"