from django.urls import path, re_path
from .views import *

# Create your views here.
urlpatterns = [
    path('room/<int:room_number>/', game_room, name='game_room'),
    re_path(r'^(?P<host_username>[\w.@+-]+)/$', game, name='game'),
    re_path(r'^tournament/(?P<host_username>[\w.@+-]+)/$', tournament_game, name='tournament_game'),
    re_path(r'^localgame/(?P<host_username>[\w.@+-]+)/$', local_game, name='local_game')
]