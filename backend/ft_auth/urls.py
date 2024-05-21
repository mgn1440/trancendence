from django.contrib import admin
from django.urls import path, include
from .views import oauth, callback, check

urlpatterns = [
	path('oauth/', oauth, name='oauth'),
	path('callback/', callback, name='callback'),
	path('check/', check, name='check'),
]