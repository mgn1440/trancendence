import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
import django
django.setup()
import json
import asyncio
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from ft_user.models import CustomUser


class StatusConsumer(AsyncWebsocketConsumer):
	room_created = False
	user_list = []

	async def connect(self):
		await self.channel_layer.group_add(
			'online_status',
			self.channel_name,
		)
		username = self.scope['user'].username
		self.user_list.append(username)
		await self.accept()
		await self.channel_layer.group_send(
			'online_status',
			{
				'type': 'global_list',
				'username': self.user_list,
			}
		)

	async def disconnect(self):
		await self.channel_layer.group_discard(
			'online_status',
			self.channel_name,
		)
		username = self.scope['user'].username
		self.user_list.remove(username)
		await self.channel_layer.group_send(
			'online_status',
			{
				'type': 'global_list',
				'username': self.user_list,
			}
		)

	async def global_list(self, event):
		user = self.scope['user'].username
		user = CustomUser.objects.get(username=user)
		user_list = event['username']
		friend_list = user.friend.all()
		online_list = []
		offline_list = []
		for man in friend_list:
			if man in user_list:
				online_list.append(man)
			else:
				offline_list.append(man)
		await self.send(text_data=json.dumps({
			'type' : 'status',
			'online': online_list,
			'offline': offline_list,
		}))
 
	async def receive(self, text_data):
		pass

