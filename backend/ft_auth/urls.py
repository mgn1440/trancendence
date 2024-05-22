from django.contrib import admin
from django.urls import path, include
from .views import oauth, Callback, check, test, test_home, number_input_view

urlpatterns = [
	path('login/', oauth, name='oauth'),
	path('callback/', Callback.as_view(), name='callback'),
	path('check/', check, name='check'),
	path('test/', test, name='test'),
	path('test_home/', test_home, name='test_home'),
	path('otp/', number_input_view , name='otp')
]