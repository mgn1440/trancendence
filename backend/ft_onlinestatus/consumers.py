import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"
import django
django.setup()
import json
import asyncio
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from ft_user.models import CustomUser, FollowList


class StatusConsumer(AsyncWebsocketConsumer):
	room_created = False
	user_list = []
	update_need_user = []

	async def connect(self):
		user = self.scope['user']
		if user.is_anonymous:
			await self.close()
			return
		await self.channel_layer.group_add(
			'online_status',
			self.channel_name,
		)
		username = self.scope['user'].username
		if username == 'AnonymousUser':
			await self.close()
			return
		self.user_list.append(username)
		await self.accept()
		await self.channel_layer.group_send(
			'online_status',
			{
				'type': 'global_list',
				'username': self.user_list,
			}
		)

	async def disconnect(self, close_code):
		if self.scope['user'].is_anonymous:
			return
		username = self.scope['user'].username
		self.user_list.remove(username)
		await self.channel_layer.group_send(
			'online_status',
			{
				'type': 'global_list',
				'username': self.user_list,
			}
		)
		await self.channel_layer.group_discard(
			'online_status',
			self.channel_name,
		)

	async def global_list(self, event):
		user = self.scope['user'].username
		user = CustomUser.objects.get(username=user)
		user_list = event['username']
		friend_list = FollowList.objects.filter(user=user).values_list('following_username', flat=True)
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
		data = json.loads(text_data)
		if data['type'] == 'update':
			await self.channel_layer.group_send(
				'online_status',
				{
					'type': 'global_list',
					'username': self.user_list,
				}
			)

