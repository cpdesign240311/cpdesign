from django.db import models
from webapp.models import Group

# Create your models here.
class Document(models.Model):
    group_id = models.ForeignKey(Group, related_name="group_ids", on_delete=models.CASCADE)
    doc_name = models.CharField(max_length=100)
    doc_type = models.CharField(max_length=30,default="default")
    class Meta:
        unique_together = (('group_id', 'doc_name'),)

    def __str__(self):
        return f"{self.group_id}-{self.doc_name}"