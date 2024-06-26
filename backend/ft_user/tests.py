from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from .models import CustomUser, FollowList, SingleGameRecord, MultiGameRecord, SingleGameDetail
import json, jwt
from backend.settings import JWT_SECRET_KEY

# class FriendViewTests(APITestCase):
# 	def setUp(self):
# 		# 사용자 생성
# 		self.user1 = CustomUser.objects.create_user(username='user1', uid=1)
# 		self.user2 = CustomUser.objects.create_user(username='user2', uid=2)
# 		self.user3 = CustomUser.objects.create_user(username='user3', uid=3)
# 		self.user4 = CustomUser.objects.create_user(username='user4', uid=4)
# 		# 로그인
# 		self.client.force_authenticate(user=self.user2)
# 		self.client.force_authenticate(user=self.user1)
# 		# FollowList 인스턴스 생성
# 		self.follow = FollowList.objects.create(user=self.user1, following_username=self.user2.username)
# 		self.follow2 = FollowList.objects.create(user=self.user3, following_username=self.user4.username)
# 		self.follow3 = FollowList.objects.create(user=self.user1, following_username=self.user4.username)
# 		# URL 설정
# 		self.url = reverse('follow')
# 	def test_get_friend_list(self):
# 		# GET 요청 테스트
# 		response = self.client.get(self.url)
# 		self.assertEqual(response.status_code, status.HTTP_200_OK)
# 		#print(response.content)
# 	def test_create_follow(self):
# 		# POST 요청 테스트
# 		# 기존 USER1 팔로우 리스트 get
# 		response = self.client.get(self.url)
# 		self.assertEqual(response.status_code, status.HTTP_200_OK)
# 		#print(response.content)
# 		# 3번 유저를 팔로우
# 		data = {'following_username': self.user3.username}
# 		response = self.client.post(self.url, data, format='json')
# 		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
# 		# 팔로우 리스트 get
# 		response = self.client.get(self.url)
# 		self.assertEqual(response.status_code, status.HTTP_200_OK)
# 		#print(response.content)
# 	def test_prevent_self_follow(self):
# 		# 자신을 팔로우하는 것을 방지하는 테스트
# 		data = {'following_username': self.user1.username}
# 		response = self.client.post(self.url, data, format='json')
# 		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
# 	def test_prevent_duplicate_follow(self):
# 		 # 중복 팔로우를 방지하는 테스트
# 		data = {'following_username': self.user2.username}
# 		response = self.client.post(self.url, data, format='json')
# 		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
# 	def test_delete_follow(self):
# 		# 팔로우 삭제 테스트
# 		response = self.client.delete(reverse('follow_detail', kwargs={'username': self.user2.username}))
# 		# 팔로우 리스트 get
# 		response = self.client.get(self.url)
# 		#print('delete', response)
# 		#print('delete', response.content)
# 		self.assertEqual(response.status_code, status.HTTP_200_OK)

# class SingleGameRecordListTest(APITestCase):
# 	def setUp(self):
# 		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
# 		self.user2 = CustomUser.objects.create_user(username="guma", uid=2)
# 		SingleGameRecord.objects.create(id=1, player1=self.user, player1_score=5, player2=self.user2, player2_score=3, is_tournament=False)

# 	def test_get_single_game_records_for_user(self):
# 		url = reverse('single_game_record', kwargs={'username': self.user.username})
# 		#print(url)
# 		response = self.client.get(url)
# 		#print(response.content)
# 		url = reverse('single_game_record', kwargs={'username': self.user2.username})
# 		#print(url)
# 		response = self.client.get(url)
# 		#print(response.content)


# class MultiGameRecordListTest(APITestCase):
# 	def setUp(self):
# 		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
# 		self.user2 = CustomUser.objects.create_user(username="guma", uid=2)
# 		self.user3 = CustomUser.objects.create_user(username="ggomul", uid=3)
# 		self.user4 = CustomUser.objects.create_user(username="pull", uid=4)
# 		MultiGameRecord.objects.create(
# 			id=1,
# 			game1=SingleGameRecord.objects.create(id=1, player1=self.user, player1_score=5, player2=self.user2, player2_score=3, is_tournament=True),
# 			game2=SingleGameRecord.objects.create(id=2, player1=self.user3, player1_score=2, player2=self.user4, player2_score=5, is_tournament=True),
# 			game3=SingleGameRecord.objects.create(id=3, player1=self.user, player1_score=5, player2=self.user4, player2_score=1, is_tournament=True),
# 			player1=self.user,
# 			player2=self.user2,
# 			player3=self.user3,
# 			player4=self.user4
# 		)
# 	def test_get_multi_game_records_for_user(self):
# 		url = reverse('multi_game_record', kwargs={'username': self.user.username})
# 		response = self.client.get(url)
# 		#print('multi', response.content)
# 		self.assertEqual(response.status_code, status.HTTP_200_OK)
# 		url = reverse('multi_game_record', kwargs={'username': self.user2.username})
# 		response = self.client.get(url)

# 	def test_get_multi_game_records_for_user_404(self):
# 		url = reverse('multi_game_record', kwargs={'username': 'non_exist_user'})
# 		response = self.client.get(url)
# 		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

# class UserMeTest(APITestCase):
# 	def setUp(self):
# 		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
# 		self.client.force_authenticate(user=self.user)
# 		self.jwt_token = jwt.encode(
# 			{'uid': self.user.uid},
# 			JWT_SECRET_KEY,
# 			algorithm='HS256'
# 		)
# 		self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.jwt_token)
# 	def test_get_me(self):
# 		url = reverse('me')
# 		response = self.client.get(url)
# 		# me informations
# 		# print(response.content)
# 		self.assertEqual(response.status_code, status.HTTP_200_OK)

# class UserDeatilByNameViewTest(APITestCase):
# 	def setUp(self):
# 		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
# 		self.client.force_authenticate(user=self.user)
# 		self.jwt_token = jwt.encode(
# 			{'uid': self.user.uid},
# 			JWT_SECRET_KEY,
# 			algorithm='HS256'
# 		)
# 		self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.jwt_token)
# 		self.user2 = CustomUser.objects.create_user(username="guma", uid=2)

# 	def test_get_user_detail(self):
# 		url = reverse('user_detail_by_username', kwargs={'username': self.user.username})
# 		response = self.client.get(url)
# 		self.assertEqual(response.status_code, status.HTTP_200_OK)
# 		# print(response.content)

# 	def test_get_user_detail_other(self):
# 		url = reverse('user_detail_by_username', kwargs={'username': self.user2.username})
# 		response = self.client.get(url)
# 		self.assertEqual(response.status_code, status.HTTP_200_OK)
# 		# print(response.content)

# 	def test_follow_feat(self):
# 		FollowList.objects.create(user=self.user, following_username=self.user2.username)
# 		url = reverse('user_detail_by_username', kwargs={'username': self.user2.username})
# 		response = self.client.get(url)
# 		self.assertEqual(response.status_code, status.HTTP_200_OK)
# 		# print('follow_test', response.content)

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

	# def test_retrive_profile_image(self):
	# 	url = reverse('profile_image', kwargs={'username': self.user.username})
	# 	response = self.client.get(url)
	# 	self.assertEqual(response.status_code, status.HTTP_200_OK)
		# print('image', response.content)

	def test_update_profile_image(self):
		url = reverse('me')
		with open('/Users/sunko/Desktop/jordan.jpeg', 'rb') as image:
			response = self.client.put(url, {'profile_image': image}, format='multipart')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		response = self.client.get(url)
		print('update', response.content)
		response = self.client.delete(url)
		print('delete_image', response.content)
		response = self.client.get(url)
		print('delete_image', response.content)
		# self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
		# url = reverse('user_detail_by_username', kwargs={'username': self.user.username})
		# print(url)
		# response = self.client.get(url)
		# print('delete_image', response.content)


# class SingleGameDetailListViewTest(APITestCase):
# 	def setUp(self):
# 		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
# 		self.user2 = CustomUser.objects.create_user(username="guma", uid=2)
# 		self.game_record = SingleGameRecord.objects.create(id=1, player1=self.user, player1_score=5, player2=self.user2, player2_score=3, is_tournament=False)
# 		self.goal = SingleGameDetail.objects.create(
# 			game=self.game_record,
# 			goal_user_name=self.user.username,
# 			goal_user_position='left',
# 			ball_start_position='A',
# 			ball_end_position='B',
# 			timestamp=10.0
# 		)
# 		self.goal2 = SingleGameDetail.objects.create(
# 			game=self.game_record,
# 			goal_user_name=self.user2.username,
# 			goal_user_position='right',
# 			ball_start_position='C',
# 			ball_end_position='D',
# 			timestamp=20.0
# 		)
# 		self.goal3 = SingleGameDetail.objects.create(
# 			game=self.game_record,
# 			goal_user_name=self.user.username,
# 			goal_user_position='left',
# 			ball_start_position='C',
# 			ball_end_position='D',
# 			timestamp=30.0
# 		)
# 		self.goal4 = SingleGameDetail.objects.create(
# 			game=self.game_record,
# 			goal_user_name=self.user2.username,
# 			goal_user_position='right',
# 			ball_start_position='A',
# 			ball_end_position='B',
# 			timestamp=40.0
# 		)

# 	def test_get_single_game_detail_list(self):
# 		url = reverse('single_game_record_detail', kwargs={'game_id': self.game_record.id})
# 		#print(url)
# 		#print('game_id', self.game_record.id)
# 		response = self.client.get(url)
# 		self.assertEqual(response.status_code, status.HTTP_200_OK)
# 		#print(response.content)


# class DayStatAPIView(APITestCase):
# 	def setUp(self):
# 		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
# 		self.user2 = CustomUser.objects.create_user(username="sunghyun", uid=2)
# 		self.user3 = CustomUser.objects.create_user(username="eunseo", uid=3)
# 		self.user4 = CustomUser.objects.create_user(username="guma", uid=4)
# 		self.game_record1 = SingleGameRecord.objects.create(id=1, player1=self.user, player1_score=5, player2=self.user2, player2_score=3, is_tournament=False)
# 		self.game_record2 = SingleGameRecord.objects.create(id=2, player1=self.user3, player1_score=2, player2=self.user4, player2_score=5, is_tournament=False)
# 		self.game_record3 = SingleGameRecord.objects.create(id=3, player1=self.user, player1_score=5, player2=self.user3, player2_score=3, is_tournament=False)
# 		self.game_record4 = SingleGameRecord.objects.create(id=4, player1=self.user, player1_score=1, player2=self.user3, player2_score=3, is_tournament=False)
# 	def test_get_day_stat(self):
# 		url = reverse('user_stat', kwargs={'username': self.user.username})
# 		response = self.client.get(url)
# 		print(response.content)


# class RecentOpponentsAPIView(APITestCase):
# 	def setUp(self):
# 		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
# 		self.user2 = CustomUser.objects.create_user(username="sunghyun", uid=2)
# 		self.user3 = CustomUser.objects.create_user(username="seo", uid=3)
# 		self.user4 = CustomUser.objects.create_user(username="guma", uid=4)
# 		self.game_record1 = SingleGameRecord.objects.create(id=1, player1=self.user, player1_score=5, player2=self.user2, player2_score=3, is_tournament=False)
# 		self.game_record2 = SingleGameRecord.objects.create(id=2, player1=self.user3, player1_score=2, player2=self.user4, player2_score=5, is_tournament=False)
# 		self.game_record3 = SingleGameRecord.objects.create(id=3, player1=self.user, player1_score=5, player2=self.user3, player2_score=3, is_tournament=False)
# 		self.game_record4 = SingleGameRecord.objects.create(id=4, player1=self.user, player1_score=1, player2=self.user3, player2_score=3, is_tournament=False)
# 	def test_get_recent_opponents(self):
# 		url = reverse('user_recent_opponent', kwargs={'username': self.user.username})
# 		response = self.client.get(url)
# 		# print(response.content)

# class UpdateUserProfileAPIView(APITestCase):
# 	def setUp(self):
# 		self.user = CustomUser.objects.create_user(
# 			username="sunko",
# 			uid=1,
# 			otp_enabled=False,
# 			multi_nickname='sunko_nickname'
# 		)
# 		self.client = APIClient()
# 		self.client.force_authenticate(user=self.user)
# 		self.jwt_token = jwt.encode(
# 			{'uid': self.user.uid},
# 			JWT_SECRET_KEY,
# 			algorithm='HS256'
# 		)
# 		self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.jwt_token)
# 		self.url = reverse('me')
# 		print(self.url)
# 	def test_update_user_info(self):
# 		data = {
# 			'otp_enabled': True,
# 		}
# 		response = self.client.put(self.url, data, format='json')
# 		print(response.content)
# 		self.user.refresh_from_db()
# 		response = self.client.get(self.url)
# 		print(response.content)

# class AverageAPIViewTest(APITestCase):
# 	def setUp(self):
# 		self.user = CustomUser.objects.create_user(username="sunko", uid=1)
# 		self.user2 = CustomUser.objects.create_user(username="sunghyun", uid=2)
# 		self.game_record1 = SingleGameRecord.objects.create(id=1, player1=self.user, player1_score=5, player2=self.user2, player2_score=3, is_tournament=False)
# 		self.game_record2 = SingleGameRecord.objects.create(id=2, player1=self.user, player1_score=2, player2=self.user2, player2_score=5, is_tournament=False)
# 		self.game_record3 = SingleGameRecord.objects.create(id=3, player1=self.user, player1_score=5, player2=self.user2, player2_score=3, is_tournament=False)
# 		self.game_record4 = SingleGameRecord.objects.create(id=4, player1=self.user, player1_score=1, player2=self.user2, player2_score=3, is_tournament=False)
# 		self.game_record5 = SingleGameRecord.objects.create(id=5, player1=self.user, player1_score=5, player2=self.user2, player2_score=3, is_tournament=False)
# 		self.game_record6 = SingleGameRecord.objects.create(id=6, player1=self.user, player1_score=1, player2=self.user2, player2_score=3, is_tournament=False)
# 		self.game_record7 = SingleGameRecord.objects.create(id=7, player1=self.user, player1_score=5, player2=self.user2, player2_score=3, is_tournament=False)
# 		self.game_record8 = SingleGameRecord.objects.create(id=8, player1=self.user, player1_score=1, player2=self.user2, player2_score=3, is_tournament=False)
# 		self.game_record9 = SingleGameRecord.objects.create(id=9, player1=self.user, player1_score=5, player2=self.user2, player2_score=3, is_tournament=False)
# 		self.game_record10 = SingleGameRecord.objects.create(id=10, player1=self.user, player1_score=1, player2=self.user2, player2_score=3, is_tournament=False)
# 	def test_get_average_line(self):
# 		url = reverse('average_line', kwargs={'username': self.user.username})
# 		response = self.client.get(url)
# 		print(response.content)
