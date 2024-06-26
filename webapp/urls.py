from django.urls import path
from . import views

urlpatterns = [
    path("", views.webapp, name='webapp'), #home
    path("mygroup", views.mygroup, name='mygroup'),
    path("forum", views.forum, name='forum'),
    path("forum/join_group", views.join_group, name='join_group'),
    path("mygroup/create_group", views.create_group, name='create_group'),
    path("mygroup/delete_group", views.delete_group, name='delete_group'),
    path("mygroup/access_group", views.access_group, name='access_group'),
    path("manage_permission", views.manage_permission, name='manage_permission'),
    path("accept_member", views.accept_member, name='accept_member'),
    path("sign_out", views.signOut, name="signOut"),
    path("error", views.error_page, name="error_page"),
    path('chat/', views.chat, name='chat'),
    #group 변경 이전 코드
    path("forum/create_document", views.forum_create_document, name='create_document'),
    path("forum/delete_document", views.forum_delete_document, name='delete_document'),
]
