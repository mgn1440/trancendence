from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/room/(?P<host_username>\w+)/$', consumers.RoomConsumer.as_asgi()),
]
