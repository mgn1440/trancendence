from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
from .views import OtpUpdateView, UserDetailView, UserWinUpdateView, UserLoseUpdateView, FriendView, logout

urlpatterns = [
	path('otp/', OtpUpdateView.as_view(), name='otp_update'),
	path('me/', UserDetailView.as_view(), name='me'),
 	path('win/', UserWinUpdateView.as_view(), name='user_win_update'),
    path('lose/', UserLoseUpdateView.as_view(), name='user_lose_update'),
	path('friend/', FriendView.as_view(), name='friend'),
	path('logout/', logout, name='logout')
]