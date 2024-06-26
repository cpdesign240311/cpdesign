import os
from django.core.asgi import get_asgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'LCD.settings')

django_asgi_app = get_asgi_application()

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from webapp.route.routing import websocket_urlpatterns

#AllowedHostsOriginValidator : origin 출처 검증
#AuthMiddlewareStack : 접속한 경로 인증

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
           AuthMiddlewareStack(
               URLRouter(
                   websocket_urlpatterns
               )
           )
        ),
    }
)
