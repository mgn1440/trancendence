from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render
from .views import OtpUpdateView, UserDetailView, UserWinUpdateView, UserLoseUpdateView, FollowView,\
	logout, test_friend, SingleGameRecordListView, FollowDetailView, MultiGameRecordListView, UserMeView, UserNameDetailView

urlpatterns = [
	path('otp/', OtpUpdateView.as_view(), name='otp_update'),
	path('me/', UserMeView.as_view(), name='me'),
	path('win/', UserWinUpdateView.as_view(), name='user_win_update'),
	path('lose/', UserLoseUpdateView.as_view(), name='user_lose_update'),
	path('friend/', FollowView.as_view(), name='friend'),
	path('friend/<int:friend_id>/', FollowDetailView.as_view(), name='friend_detail'),
	path('test_friend/', test_friend, name='test_friend'),
	path('logout/', logout, name='logout'),
	path('<int:uid>/', UserDetailView.as_view(), name='user_detail'),
	path('<int:user_id>/record/single/', SingleGameRecordListView.as_view(), name='single_game_record'),
	path('<int:user_id>/record/multi/', MultiGameRecordListView.as_view(), name='multi_game_record'),
	path('<str:username>/', UserNameDetailView.as_view(), name='user_detail_by_username'),
]
