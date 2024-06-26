# chat/routing.py
from django.urls import re_path
from . import consumers

#urls와 동일한 역할로 ws://로 요청한 통신을 consumer와 연결한다.
websocket_urlpatterns = [
    re_path(r"ws/group/(?P<group_id>\w+)-(?P<user_id>[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]\w+)/$", consumers.GroupConsumer.as_asgi()),
]