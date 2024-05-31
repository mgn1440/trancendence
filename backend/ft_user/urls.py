from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
from .views import OtpUpdateView, UserMeView, UserWinUpdateView, UserLoseUpdateView, UserDetailView, GameRecordListView

urlpatterns = [
	path('otp/', OtpUpdateView.as_view(), name='otp_update'),
	path('me/', UserMeView.as_view(), name='me'),
	path('win/', UserWinUpdateView.as_view(), name='user_win_update'),
	path('lose/', UserLoseUpdateView.as_view(), name='user_lose_update'),
	path('<int:uid>/', UserDetailView.as_view(), name='user_detail'),
	path('<int:user_id>/game-records/', GameRecordListView.as_view(), name='game_record'),
]
