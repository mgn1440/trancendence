from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import GameRecord
from ft_user.models import CustomUser
import json

class GameRecordListTest(APITestCase):
	def setUp(self):
		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
		self.user2 = CustomUser.objects.create_user(username="guma", uid=2)

		GameRecord.objects.create(user=self.user, user_id=self.user.uid, user_score=5, opponent_id=self.user2.uid, opponent_score=1)
		GameRecord.objects.create(user=self.user, user_id=self.user.uid, user_score=3, opponent_id=self.user2.uid, opponent_score=5)
		GameRecord.objects.create(user=self.user2, user_id=self.user2.uid, user_score=1, opponent_id=self.user.uid, opponent_score=5)
		GameRecord.objects.create(user=self.user2, user_id=self.user2.uid, user_score=5, opponent_id=self.user.uid, opponent_score=3)

	def test_get_game_records_for_user(self):
		url = reverse('game-record', kwargs={'user_id': self.user.uid})
		response = self.client.get(url)

		data_dict = json.loads(response.content)
		print(data_dict)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(data_dict), 2)

		url = reverse('game-record', kwargs={'user_id': self.user2.uid})
		response = self.client.get(url)
		data_dict = json.loads(response.content)
		print(data_dict)
		self.assertEqual(response.status_code, status.HTTP_200_OK)

	def test_get_game_records_for_user_404(self):
		url = reverse('game-record', kwargs={'user_id': 100})
		response = self.client.get(url)
		print(response.data)
		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
