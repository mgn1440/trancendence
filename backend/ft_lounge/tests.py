from django.test import TestCase
from django.core.cache import cache
from channels.testing import WebsocketCommunicator
from ft_game.consumers import GameConsumer
from .consumers import GameLoungeConsumer
from .manager import GameRoomManager
from channels.routing import URLRouter, ProtocolTypeRouter
from django.urls import re_path, path, reverse
from rest_framework.test import APITestCase
from rest_framework import status
import json

application = ProtocolTypeRouter({
	"websocket": URLRouter([
		re_path(r"ws/game/room/(?P<room_number>\d+)/$", GameConsumer.as_asgi()),
		path(r"ws/game/rooms/", GameLoungeConsumer.as_asgi()),
	]),
})

class GameRoomManagerTest(TestCase):
	def setUp(self):
		cache.clear()

	def test_create_room(self):
		GameRoomManager.create_room('room1', '1vs1', None)
		room = GameRoomManager.get_room(1)
		self.assertIsNotNone(room)
		self.assertEqual(room['room_number'], 1)
		self.assertEqual(room['room_size'], 2)
		self.assertEqual(room['current_players'], 0)

	def test_add_player(self):
		GameRoomManager.create_room('room1', '1vs1', None)
		GameRoomManager.add_player(1)
		room = GameRoomManager.get_room(1)
		self.assertEqual(room['current_players'], 1)

	def test_add_player_room_full(self):
		GameRoomManager.create_room('room1', '1vs1', None)
		GameRoomManager.add_player(1)
		GameRoomManager.add_player(1)
		with self.assertRaises(Exception) as context:
			GameRoomManager.add_player(1)
		self.assertTrue('Room is full' in str(context.exception))

	def test_remove_player(self):
		GameRoomManager.create_room('room1', '1vs1', None)
		GameRoomManager.add_player(1)
		GameRoomManager.add_player(1)
		GameRoomManager.remove_player(1)
		room = GameRoomManager.get_room(1)
		self.assertEqual(room['current_players'], 1)

	def test_remove_room_at_zero_player(self):
		GameRoomManager.create_room('room1', '1vs1', None)
		GameRoomManager.add_player(1)
		GameRoomManager.remove_player(1)
		room = GameRoomManager.get_room(1)
		self.assertIsNone(room)

	def test_remove_player_room_empty(self):
		GameRoomManager.create_room('room1', '1vs1', None)
		with self.assertRaises(Exception) as context:
			GameRoomManager.remove_player(1)
		self.assertTrue('Room is empty' in str(context.exception))

	def test_get_all_rooms(self):
		GameRoomManager.create_room('room1', '1vs1', None)
		GameRoomManager.create_room('room2', '1vs1', None)
		rooms = GameRoomManager.get_all_rooms()
		self.assertEqual(len(rooms), 2)

class GameLoungeConsumerTest(TestCase):
	def setUp(self):
		cache.clear()

	async def test_connect(self):
		communicator = WebsocketCommunicator(application, "/ws/game/rooms/")
		connected, _ = await communicator.connect()
		assert connected
		await communicator.disconnect()


class CreateGameRoomViewTestCase(APITestCase):
	def test_create_game_room(self):
		url = reverse('create_game_room')
		data = {
			'room_name': 'sunko_room',
			'is_secret': False,
			'mode': '1v1',
		}
		response = self.client.post(url, data, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		response_data = json.loads(response.json())
		print(response_data)
		self.assertEqual(response_data['room_name'], 'sunko_room')
		self.assertEqual(response_data['room_size'], 2)
		self.assertEqual(response_data['current_players'], 0)
