from django.urls import path
from . import views

urlpatterns = [
    path("create_document", views.create_document, name='create_document'),
    path("delete_document", views.delete_document, name='delete_document'),
    path("check_in_group", views.checkInGroup, name='check_in_group'),
    path("main", views.main, name='codeshare_main'),
    path("entry_codepage", views.entry_codepage, name='entry_codepage'),
    path("entry_textpage", views.entry_textpage, name='entry_textpage'),
    #path("out_of_group_session", views.out_of_group_session, name='out_of_group_session'),
]
