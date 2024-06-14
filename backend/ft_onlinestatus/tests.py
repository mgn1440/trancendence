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
		self.user1 = CustomUser.objects.create_user(uid=1, username='user1', email='dafsd@dasf.com', multi_nickname='user1')
		self.user2 = CustomUser.objects.create_user(uid=2, username='user2', email='dafsd@ddsf.com', multi_nickname='user2')
		self.client.force_authenticate(user=self.user1)
		response = self.client.post(
			reverse('follow'),  # ensure this name corresponds to your URLconf
			{'following_username': 'user2'},
			format='json',
			HTTP_ORIGIN='http://localhost:5173'
		)
		self.assertEqual(response.status_code, 201)

		communicator1 = await self.connect_communicator(self.user1)
		communicator2 = await self.connect_communicator(self.user2)

		response1 = await communicator1.receive_json_from()
		response1 = await communicator1.receive_json_from()
		response2 = await communicator2.receive_json_from()
		# print(response2)
		self.assertEqual(response1['type'], 'status')
		self.assertEqual(response1['online'], ['user2'])
		self.assertEqual(response1['offline'], [])

		await self.disconnect_communicator(communicator2)

		self.assertEqual(response2['type'], 'status')
		self.assertEqual(response2['online'], [])
		self.assertEqual(response2['offline'], [])

		await self.disconnect_communicator(communicator1)

class StatusConsumerAdditionTest(TestCase):
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

	async def test_friend_addition(self):
		user3 = CustomUser.objects.create_user(uid=3, username='user3', email='dafsd@daa.com', multi_nickname='user3')
		user4 = CustomUser.objects.create_user(uid=4, username='user4', email='dafsd@ddb.com', multi_nickname='user4')
		self.client.force_authenticate(user=user3)
		response = self.client.post(
			'http://localhost:8000/api/user/follow/',  # ensure this name corresponds to your URLconf
			{'following_username': 'user4'},
			format='json',
			HTTP_ORIGIN='http://localhost:5173'
		)
		self.assertEqual(response.status_code, 201)

		communicator3 = await self.connect_communicator(user3)

		response3 = await communicator3.receive_json_from()
		self.assertEqual(response3['type'], 'status')
		self.assertEqual(response3['online'], [])
		self.assertEqual(response3['offline'], ['user4'])

		communicator4 = await self.connect_communicator(user4)

		response4 = await communicator3.receive_json_from()
		self.assertEqual(response4['type'], 'status')
		self.assertEqual(response4['online'], ['user4'])
		self.assertEqual(response4['offline'], [])

		await self.disconnect_communicator(communicator3)
		await self.disconnect_communicator(communicator4)