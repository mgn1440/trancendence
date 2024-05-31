import json
from channels.generic.websocket import AsyncWebsocketConsumer

class LobbyConsumer(AsyncWebsocketConsumer):
    rooms = {}

    async def connect(self):
        await self.channel_layer.group_add("lobby", self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'room_list',
            'rooms': list(LobbyConsumer.rooms.values())
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("lobby", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['type'] == 'create_room':
            host = self.scope['user'].username
            room_info = {
                'room_name': data['room_name'],
                'host': host,
                'mode': data['mode'],
                'is_secret': data['is_secret'],
                'password': data.get('password', ''),
                'players': [],
            }
            print(room_info)
            LobbyConsumer.rooms[host] = room_info
            await self.send(text_data=json.dumps({
                'type': 'room_created',
                'host': host,
			}))
            await self.update_room_list()

    async def update_room_list(self):
        await self.channel_layer.group_send(
            "lobby",
            {
                'type': 'room_list_update',
                'rooms': list(LobbyConsumer.rooms.values())
            }
        )

    async def room_list_update(self, event):
        rooms = event['rooms']
        await self.send(text_data=json.dumps({
            'type': 'room_list',
            'rooms': rooms
        }))
