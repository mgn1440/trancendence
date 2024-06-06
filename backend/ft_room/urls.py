from django.urls import path, re_path
from .views import *

urlpatterns = [
    re_path(r'^(?P<host_username>[\w.@+-]+)/$', room, name='room'),
]
