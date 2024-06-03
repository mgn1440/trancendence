from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import CustomUser, FollowList
# Create your tests here.

class FriendViewTests(APITestCase):

	def setUp(self):
		# 사용자 생성
		self.user1 = CustomUser.objects.create_user(username='user1', uid=1)
		self.user2 = CustomUser.objects.create_user(username='user2', uid=2)
		self.user3 = CustomUser.objects.create_user(username='user3', uid=3)
		self.user4 = CustomUser.objects.create_user(username='user4', uid=4)

		# 로그인
		self.client.force_authenticate(user=self.user2)
		self.client.force_authenticate(user=self.user1)
		# FollowList 인스턴스 생성
		self.follow = FollowList.objects.create(user=self.user1, following_uid=self.user2.uid)
		self.follow2 = FollowList.objects.create(user=self.user3, following_uid=self.user4.uid)
		self.follow3 = FollowList.objects.create(user=self.user1, following_uid=self.user4.uid)
		# URL 설정
		self.url = reverse('friend')
	
	def test_get_friend_list(self):
		# GET 요청 테스트
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)

	def test_create_follow(self):
		# POST 요청 테스트

		# 기존 USER1 팔로우 리스트 get 
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		print(response.data)

		# 3번 유저를 팔로우
		data = {'following_uid': self.user3.uid}
		response = self.client.post(self.url, data, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)

		# 팔로우 리스트 get
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		print(response.data)

	def test_prevent_self_follow(self):
		# 자신을 팔로우하는 것을 방지하는 테스트
		data = {'following_uid': self.user1.uid}
		response = self.client.post(self.url, data, format='json')
		print(response.data)
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

	def test_prevent_duplicate_follow(self):
		 # 중복 팔로우를 방지하는 테스트
		data = {'following_uid': self.user2.uid}
		response = self.client.post(self.url, data, format='json')
		print(response.data)
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

