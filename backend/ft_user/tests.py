from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import CustomUser, FollowList, SingleGameRecord, MultiGameRecord
import json, jwt
from backend.settings import JWT_SECRET_KEY

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
		self.follow = FollowList.objects.create(user=self.user1, following_username=self.user2.username)
		self.follow2 = FollowList.objects.create(user=self.user3, following_username=self.user4.username)
		self.follow3 = FollowList.objects.create(user=self.user1, following_username=self.user4.username)
		# URL 설정
		self.url = reverse('follow')
	def test_get_friend_list(self):
		# GET 요청 테스트
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		#print(response.content)
	def test_create_follow(self):
		# POST 요청 테스트
		# 기존 USER1 팔로우 리스트 get
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		#print(response.content)
		# 3번 유저를 팔로우
		data = {'following_username': self.user3.username}
		response = self.client.post(self.url, data, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		# 팔로우 리스트 get
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		#print(response.content)
	def test_prevent_self_follow(self):
		# 자신을 팔로우하는 것을 방지하는 테스트
		data = {'following_username': self.user1.username}
		response = self.client.post(self.url, data, format='json')
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
	def test_prevent_duplicate_follow(self):
		 # 중복 팔로우를 방지하는 테스트
		data = {'following_username': self.user2.username}
		response = self.client.post(self.url, data, format='json')
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
	def test_delete_follow(self):
		# 팔로우 삭제 테스트
		response = self.client.delete(reverse('follow_detail', kwargs={'username': self.user2.username}))
		# 팔로우 리스트 get
		response = self.client.get(self.url)
		#print('delete', response)
		#print('delete', response.content)
		self.assertEqual(response.status_code, status.HTTP_200_OK)

class SingleGameRecordListTest(APITestCase):
	def setUp(self):
		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
		self.user2 = CustomUser.objects.create_user(username="guma", uid=2)
		SingleGameRecord.objects.create(user=self.user, user_score=5, opponent_name=self.user2.username, opponent_score=3)
		SingleGameRecord.objects.create(user=self.user2, user_score=3, opponent_name=self.user.username, opponent_score=5)

	def test_get_single_game_records_for_user(self):
		url = reverse('single_game_record', kwargs={'username': self.user.username})
		response = self.client.get(url)
		#print(response.content)


class MultiGameRecordListTest(APITestCase):
	def setUp(self):
		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
		self.user2 = CustomUser.objects.create_user(username="guma", uid=2)
		self.user3 = CustomUser.objects.create_user(username="ggomul", uid=3)
		self.user4 = CustomUser.objects.create_user(username="pull", uid=4)
		MultiGameRecord.objects.create(
			user=self.user,
			user_win=True,
			opponent1_name = self.user2.username,
			opponent2_name=self.user3.username,
			opponent3_name=self.user4.username
		)
	def test_get_multi_game_records_for_user(self):
		url = reverse('multi_game_record', kwargs={'username': self.user.username})
		response = self.client.get(url)
		#print('multi', response.content)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		url = reverse('multi_game_record', kwargs={'username': self.user2.username})
		response = self.client.get(url)
	def test_get_multi_game_records_for_user_404(self):
		url = reverse('multi_game_record', kwargs={'username': 'non_exist_user'})
		response = self.client.get(url)
		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class UserMeTest(APITestCase):
	def setUp(self):
		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
		self.client.force_authenticate(user=self.user)
		self.jwt_token = jwt.encode(
			{'uid': self.user.uid},
			JWT_SECRET_KEY,
			algorithm='HS256'
		)
		self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.jwt_token)
	def test_get_me(self):
		url = reverse('me')
		response = self.client.get(url)
		# me informations
		# print(response.content)
		self.assertEqual(response.status_code, status.HTTP_200_OK)

class UserDeatilByNameViewTest(APITestCase):
	def setUp(self):
		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
		self.client.force_authenticate(user=self.user)
		self.jwt_token = jwt.encode(
			{'uid': self.user.uid},
			JWT_SECRET_KEY,
			algorithm='HS256'
		)
		self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.jwt_token)
		self.user2 = CustomUser.objects.create_user(username="guma", uid=2)

	def test_get_user_detail(self):
		url = reverse('user_detail_by_username', kwargs={'username': self.user.username})
		response = self.client.get(url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		# print(response.content)

	def test_get_user_detail_other(self):
		url = reverse('user_detail_by_username', kwargs={'username': self.user2.username})
		response = self.client.get(url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		# print(response.content)

	def test_follow_feat(self):
		FollowList.objects.create(user=self.user, following_username=self.user2.username)
		url = reverse('user_detail_by_username', kwargs={'username': self.user2.username})
		response = self.client.get(url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		# print('follow_test', response.content)

class ProfileImageViewTest(APITestCase):
	def setUp(self):
		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
		self.client.force_authenticate(user=self.user)
		self.jwt_token = jwt.encode(
			{'uid': self.user.uid},
			JWT_SECRET_KEY,
			algorithm='HS256'
		)
		self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.jwt_token)

	def test_retrive_profile_image(self):
		url = reverse('profile_image', kwargs={'username': self.user.username})
		response = self.client.get(url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		print('image', response.content)

	def test_update_profile_image(self):
		url = reverse('profile_image', kwargs={'username': self.user.username})
		with open('/Users/sunko/Desktop/nirvana.jpeg', 'rb') as image:
			response = self.client.put(url, {'profile_image': image}, format='multipart')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		url = reverse('user_detail_by_username', kwargs={'username': self.user.username})
		response = self.client.get(url)
		print('update', response.content)
		url = reverse('profile_image', kwargs={'username': self.user.username})
		response = self.client.delete(url)
		self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
		url = reverse('user_detail_by_username', kwargs={'username': self.user.username})
		print(url)
		response = self.client.get(url)
		print('delete_image', response.content)

