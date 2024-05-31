from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
from .views import OtpUpdateView, UserMeView, UserWinUpdateView, UserLoseUpdateView, UserDetailView, SingleGameRecordListView, MultiGameRecordListView

urlpatterns = [
	path('otp/', OtpUpdateView.as_view(), name='otp_update'),
	path('me/', UserMeView.as_view(), name='me'),
	path('win/', UserWinUpdateView.as_view(), name='user_win_update'),
	path('lose/', UserLoseUpdateView.as_view(), name='user_lose_update'),
	path('<int:uid>/', UserDetailView.as_view(), name='user_detail'),
	path('<int:user_id>/single-game-records/', SingleGameRecordListView.as_view(), name='single_game_record'),
	path('<int:user_id>/multi-game-records/', MultiGameRecordListView.as_view(), name='muti_game_record'),
]
