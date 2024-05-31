from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from .models import CustomUser, SingleGameRecord, MultiGameRecord
from django.urls import reverse
from .serializers import CustomUserSerializer
import json

# Create your tests here.

class UserDetailViewTest(APITestCase):
	def setUp(self):
		self.client = APIClient()
		self.user = CustomUser.objects.create_user(username='test', password='test', uid=1)
		self.url = reverse('user_detail', kwargs={'uid': self.user.uid})

	def test_user_detail_view(self):
		self.client.force_authenticate(user=self.user)
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, 200)

		response_data = response.json()
		user = CustomUser.objects.get(uid=self.user.uid)
		serializer = CustomUserSerializer(user)
		self.assertEqual(response_data['uid'], serializer.data['uid'])
		self.assertEqual(response_data['username'], serializer.data['username'])
		self.assertEqual(response_data['win'], serializer.data['win'])
		self.assertEqual(response_data['lose'], serializer.data['lose'])
		self.assertFalse(response_data['otp_enabled'])

	def test_user_detail_view_empty_uid(self):
		response = self.client.get('/api/user/2')
		self.assertEqual(response.status_code, 301) # permission denied and redirect

class SingleGameRecordListTest(APITestCase):
	def setUp(self):
		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
		self.user2 = CustomUser.objects.create_user(username="guma", uid=2)

		SingleGameRecord.objects.create(user=self.user, user_id=self.user.uid, user_score=5, opponent_id=self.user2.uid, opponent_score=1)
		SingleGameRecord.objects.create(user=self.user, user_id=self.user.uid, user_score=3, opponent_id=self.user2.uid, opponent_score=5)
		SingleGameRecord.objects.create(user=self.user2, user_id=self.user2.uid, user_score=1, opponent_id=self.user.uid, opponent_score=5)
		SingleGameRecord.objects.create(user=self.user2, user_id=self.user2.uid, user_score=5, opponent_id=self.user.uid, opponent_score=3)

	def test_get_game_records_for_user(self):
		url = reverse('single_game_record', kwargs={'user_id': self.user.uid})
		response = self.client.get(url)

		data_dict = json.loads(response.content)
		# print(data_dict)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(data_dict), 2)

		url = reverse('single_game_record', kwargs={'user_id': self.user2.uid})
		response = self.client.get(url)
		data_dict = json.loads(response.content)
		self.assertEqual(response.status_code, status.HTTP_200_OK)

	def test_get_game_records_for_user_404(self):
		url = reverse('single_game_record', kwargs={'user_id': 100})
		response = self.client.get(url)
		# print(response.data)
		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class MultiGameRecordListTest(APITestCase):
	def setUp(self):
		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
		self.user2 = CustomUser.objects.create_user(username="guma", uid=2)
		self.user3 = CustomUser.objects.create_user(username="ggomul", uid=3)
		self.user4 = CustomUser.objects.create_user(username="pull", uid=4)

		MultiGameRecord.objects.create(user=self.user, user_id=self.user.uid, user_win=True, opponent1_id=self.user2.uid, opponent2_id=self.user3.uid, opponent3_id=self.user4.uid)
		MultiGameRecord.objects.create(user=self.user2, user_id=self.user2.uid, user_win=False, opponent1_id=self.user.uid, opponent2_id=self.user3.uid, opponent3_id=self.user4.uid)
		MultiGameRecord.objects.create(user=self.user3, user_id=self.user3.uid, user_win=True, opponent1_id=self.user.uid, opponent2_id=self.user2.uid, opponent3_id=self.user4.uid)
		MultiGameRecord.objects.create(user=self.user4, user_id=self.user4.uid, user_win=False, opponent1_id=self.user.uid, opponent2_id=self.user2.uid, opponent3_id=self.user3.uid)

	def test_get_multi_game_records_for_user(self):
		url = reverse('muti_game_record', kwargs={'user_id': self.user.uid})
		response = self.client.get(url)
		print(response.data)
		data_dict = json.loads(response.content)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(data_dict), 1)

		url = reverse('muti_game_record', kwargs={'user_id': self.user2.uid})
		response = self.client.get(url)
		data_dict = json.loads(response.content)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
