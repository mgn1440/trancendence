from django.urls import path
from .views import GameRecordList

urlpatterns = [
	path('<int:user_id>', GameRecordList.as_view(), name='game-record'),
]

