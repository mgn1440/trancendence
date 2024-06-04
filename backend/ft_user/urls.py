from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
from .views import OtpUpdateView, UserDetailView, UserWinUpdateView, UserLoseUpdateView, FriendView, logout, test_friend, SingleGameRecordListView, FriendDetailView, MultiGameRecordListView

urlpatterns = [
	path('otp/', OtpUpdateView.as_view(), name='otp_update'),
	path('me/', UserDetailView.as_view(), name='me'),
 	path('win/', UserWinUpdateView.as_view(), name='user_win_update'),
  path('lose/', UserLoseUpdateView.as_view(), name='user_lose_update'),
	path('friend/', FriendView.as_view(), name='friend'),
	path('friend/<int:friend_id>/', FriendDetailView.as_view(), name='friend_detail'),
	path('test_friend/', test_friend, name='test_friend'),
	path('logout/', logout, name='logout'),
	path('<int:uid>/', UserDetailView.as_view(), name='user_detail'),
	path('<int:user_id>/single-game-records/', SingleGameRecordListView.as_view(), name='single_game_record'),
	path('<int:user_id>/multi-game-records/', MultiGameRecordListView.as_view(), name='multi_game_record'),
]
