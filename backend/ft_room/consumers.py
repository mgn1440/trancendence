import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from ft_lobby.consumers import LobbyConsumer

class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.host_username = self.scope['url_route']['kwargs']['host_username']
        self.room_group_name = f'room_{self.host_username}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        LobbyConsumer.rooms[self.host_username]['players'].append(self.scope['user'].username)
        await self.update_room_list()
        
        await self.send(text_data=json.dumps({
            'type': 'room_info',
            'room_name': LobbyConsumer.rooms[self.host_username]['room_name'],
            'host': self.host_username,
            'mode': LobbyConsumer.rooms[self.host_username]['mode'],
        }))

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'connect_user',
                'new_user': self.scope['user'].username,
                'user_list': LobbyConsumer.rooms[self.host_username]['players'],
            }
        )
        

    async def disconnect(self, close_code):
        LobbyConsumer.rooms[self.host_username]['players'].remove(self.scope['user'].username)

        username = self.scope['user'].username
        # 방장이 나갔을 때 현재 그룹유저에게 방이 폭파되었음을 알림
        if username == self.host_username:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'room_destroyed'
                }
            )
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'disconnect_user',
                'disconnected_user': self.scope['user'].username,
                'user_list': LobbyConsumer.rooms[self.host_username]['players'],
            }
        )
        
        await self.update_room_list()
        
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)


            
    async def update_room_list(self):
        channel_layer = get_channel_layer()
        # 룸안에 유저가 없으면 방을 삭제
        if not LobbyConsumer.rooms[self.host_username]['players']:
            print('room is empty')
            del LobbyConsumer.rooms[self.host_username]
        await channel_layer.group_send(
            "lobby",
            {
                'type': 'room_list_update',
                'rooms': list(LobbyConsumer.rooms.values())
            }
        )

    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))

    async def room_destroyed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'room_destroyed'
        }))
        
    async def connect_user(self, event):
        new_user = event['new_user']
        user_list = event['user_list']
        
        await self.send(text_data=json.dumps({
            'type': 'connect_user',
            'new_user': new_user,
            'user_list': user_list,
        }))
        
    async def disconnect_user(self, event):
        disconnected_user = event['disconnected_user']
        user_list = event['user_list']
        
        await self.send(text_data=json.dumps({
            'type': 'disconnect_user',
            'disconnected_user': disconnected_user,
            'user_list': user_list,
        }))