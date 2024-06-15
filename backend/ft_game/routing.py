from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
	re_path(r"ws/game/room/(?P<room_number>\d+)/$", consumers.GameConsumer.as_asgi()),
	re_path(r"ws/game/(?P<room_id>\d+)/$", consumers.GameConsumer.as_asgi()),
	re_path(r"ws/tournament/(?P<host_username>\w+)/$", consumers.TournamentGameConsumer.as_asgi()),
	re_path(r"ws/localgame/(?P<host_username>\w+)/$", consumers.LocalGameConsumer.as_asgi()),
]