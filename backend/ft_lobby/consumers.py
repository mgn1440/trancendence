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
        print(data)
        if data['type'] == 'create_room':
            host = self.scope['user'].username
            room_info = {
                'room_name': data['room_name'],
                'host': host,
                'mode': data['mode'],
                'is_secret': data['is_secret'],
                'password': data.get('password', ''),
                'players': [],
                'in_game_players': [],
                'status': 'room',
            }
            LobbyConsumer.rooms[host] = room_info
            await self.send(text_data=json.dumps({
                'type': 'room_created',
                'host': host,
			}))
            await self.update_room_list()
        elif data['type'] == 'join_room':
            hostname = data['host']
            if hostname in LobbyConsumer.rooms:
                if LobbyConsumer.rooms[hostname]['status'] != 'room':
                    await self.send(text_data=json.dumps({
                        'type': 'join_denied',
                        'message': 'This room is already playing a game.',
                    }))
                elif len(LobbyConsumer.rooms[hostname]['players']) >= 2:
                    await self.send(text_data=json.dumps({
                        'type': 'join_denied',
                        'message': 'Room is full.',
                    }))
                elif LobbyConsumer.rooms[hostname]['is_secret']:
                    await self.send(text_data=json.dumps({
                        'type': 'password_required',
                        'host': hostname,
                    }))
                else:
                    await self.send(text_data=json.dumps({
                        'type': 'join_approved',
                        'host': hostname,
                    }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'join_denied',
                    'message': 'Room does not exist.',
                }))
        elif data['type'] == 'join_secret_room':
            hostname = data['host']
            if hostname in LobbyConsumer.rooms:
                if data['password'] == LobbyConsumer.rooms[hostname]['password']:
                    await self.send(text_data=json.dumps({
                        'type': 'join_approved',
                        'host': hostname,
                    }))
                else:
                    await self.send(text_data=json.dumps({
                        'type': 'join_denied',
                        'message': 'Wrong password.',
                    }))
   
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
