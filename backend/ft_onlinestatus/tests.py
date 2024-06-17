# tests/test_consumers.py
import os
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
import django
django.setup()
import json
from django.test import TestCase, RequestFactory
from django.urls import reverse
from channels.testing import WebsocketCommunicator
from ft_user.models import CustomUser, FollowList
from backend.asgi import application
from ft_user.models import FollowList
from rest_framework.test import APIClient


class StatusConsumerTest(TestCase):
	def setUp(self):
		self.client = APIClient()

	async def connect_communicator(self, user):
		communicator = WebsocketCommunicator(application, "/ws/online/")
		# Set the user and other required information in scope
		communicator.scope['user'] = user
		connected, subprotocol = await communicator.connect()
		self.assertTrue(connected)
		return communicator

	async def disconnect_communicator(self, communicator):
		await communicator.disconnect()

	async def test_online_offline_status(self):
		# user1 = CustomUser.objects.create_user(uid=1, username='user1', email='dafsd@dasf.com', multi_nickname='user1')
		# user2 = CustomUser.objects.create_user(uid=2, username='user2', email='dafsd@ddsf.com', multi_nickname='user2')
		# self.client.force_authenticate(user=self.user1)
		self.user1 = CustomUser.objects.create_user(uid=1, username='user1', email='dafsd@dasf.com', multi_nickname='user1', profile_image='default.jpg')
		self.user2 = CustomUser.objects.create_user(uid=2, username='user2', email='dafsd@ddsf.com', multi_nickname='user2', profile_image='default2.jpg')
		self.user3 = CustomUser.objects.create_user(uid=3, username='user3', email='dasfdsfa@sadf.com', multi_nickname='user3', profile_image='default3.jpg')
		self.client.force_authenticate(user=self.user1)
		response = self.client.post(
			reverse('follow'),  # ensure this name corresponds to your URLconf
			{'following_username': 'user2'},
			format='json',
			HTTP_ORIGIN='http://localhost:5173'
		)
		self.assertEqual(response.status_code, 201)
		response = self.client.post(
			reverse('follow'),  # ensure this name corresponds to your URLconf
			{'following_username': 'user3'},
			format='json',
			HTTP_ORIGIN='http://localhost:5173'
		)
		self.assertEqual(response.status_code, 201)

		communicator1 = await self.connect_communicator(self.user1)
		communicator2 = await self.connect_communicator(self.user2)

		response1 = await communicator1.receive_json_from()
		response2 = await communicator1.receive_json_from()
		assert response1['type'] == 'status'
		assert not response1['online']
		
		assert response1['offline'][0]['username'] == 'user2'
		assert response1['offline'][1]['username'] == 'user3'

		assert response2['type'] == 'add_online'
		assert response2['online'][0]['username'] == 'user2'

		response3 = await communicator2.receive_json_from()
		assert response3['type'] == 'status'
		assert not response3['online']
		assert not response3['offline']

		await communicator1.send_json_to({
			'type': 'update',
		})
		response4 = await communicator1.receive_json_from()
		assert response4['type'] == 'status'
		assert response4['online'][0]['username'] == 'user2'
		assert response4['offline'][0]['username'] == 'user3'

		communicator3 = await self.connect_communicator(self.user3)

		assert await communicator2.receive_nothing() is True

		response5 = await communicator1.receive_json_from()
		assert response5['type'] == 'add_online'
		assert response5['online'][0]['username'] == 'user3'

		# response1 = await communicator1.receive_json_from()
		# print("response1 again")
		# print(response1)
		
		# communicator3 = await self.connect_communicator(self.user3)
		# response3 = await communicator3.receive_json_from()
		# print("response3")
		# print(response3)

		# assert await communicator1.receive_nothing() is True
		# assert await communicator2.receive_nothing() is True



		# response3 = await communicator2.receive_json_from()
		# print("response3")
		# print(response2)
		# self.assertEqual(response1['type'], 'status')
		# self.assertEqual(response1['online'], ['user2'])
		# self.assertEqual(response1['offline'], [])

		# await self.disconnect_communicator(communicator2)

		# self.assertEqual(response2['type'], 'status')
		# self.assertEqual(response2['online'], [])
		# self.assertEqual(response2['offline'], [])

		# await self.disconnect_communicator(communicator1)

# class StatusConsumerAdditionTest(TestCase):
# 	def setUp(self):
# 		self.client = APIClient()

# 	async def connect_communicator(self, user):
# 		communicator = WebsocketCommunicator(application, "/ws/online/")
# 		# Set the user and other required information in scope
# 		communicator.scope['user'] = user
# 		connected, subprotocol = await communicator.connect()
# 		self.assertTrue(connected)
# 		return communicator

# 	async def disconnect_communicator(self, communicator):
# 		await communicator.disconnect()

# 	async def test_friend_addition(self):
# 		user3 = CustomUser.objects.create_user(uid=3, username='user3', email='dafsd@daa.com', multi_nickname='user3')
# 		user4 = CustomUser.objects.create_user(uid=4, username='user4', email='dafsd@ddb.com', multi_nickname='user4')
# 		self.client.force_authenticate(user=user3)
# 		response = self.client.post(
# 			'http://localhost:8000/api/user/follow/',  # ensure this name corresponds to your URLconf
# 			{'following_username': 'user4'},
# 			format='json',
# 			HTTP_ORIGIN='http://localhost:5173'
# 		)
# 		self.assertEqual(response.status_code, 201)

# 		communicator3 = await self.connect_communicator(user3)

# 		response3 = await communicator3.receive_json_from()
# 		self.assertEqual(response3['type'], 'status')
# 		self.assertEqual(response3['online'], [])
# 		self.assertEqual(response3['offline'], ['user4'])

# 		communicator4 = await self.connect_communicator(user4)

# 		response4 = await communicator3.receive_json_from()
# 		self.assertEqual(response4['type'], 'status')
# 		self.assertEqual(response4['online'], ['user4'])
# 		self.assertEqual(response4['offline'], [])

# 		await self.disconnect_communicator(communicator3)
# 		await self.disconnect_communicator(communicator4)