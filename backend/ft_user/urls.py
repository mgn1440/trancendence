from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
from .views import OtpUpdateView, UserDetailView, FriendView, FriendPage, FriendRequestView

urlpatterns = [
	path('otp/', OtpUpdateView.as_view(), name='otp_update'),
	path('me/', UserDetailView.as_view(), name='me'),
	path('friend-list/', FriendPage, name='friend-list'),
	path('friend/', FriendView.as_view(), name='friend'),
	path('friend-request/', FriendRequestView.as_view(), name='friend-request'),
]