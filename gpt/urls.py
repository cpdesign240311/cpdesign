from django.urls import path
from . import views

urlpatterns = [
    path("chat", views.initChatPage, name='init_chat_page'),
    path("chat/user_msg", views.handleUserMsg, name='handle_user_msg'),
]
