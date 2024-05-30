from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
	re_path(r"ws/game/room/(?P<room_number>\d+)/$", consumers.GameConsumer.as_asgi()),
]