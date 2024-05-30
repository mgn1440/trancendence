from django.urls import path
from .views import *

# Create your views here.
urlpatterns = [
    path('room/<int:room_number>/', game_room, name='game_room'),
]