from django.urls import path
from . import views

urlpatterns = [
    path("", views.login, name='login'),
    path("sign_out", views.signOut, name='signOUt'),
    path("sign_up", views.signUp, name='signUp'),
    path("reset_password", views.pwReset, name='pwReset'),
]
