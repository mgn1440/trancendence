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
        
        #방이 없으면 그냥 종료
        if self.host_username not in LobbyConsumer.rooms:
            await self.send(text_data=json.dumps({
                'type': 'room_not_exist',
            }))
            return
        
        
        LobbyConsumer.rooms[self.host_username]['players'].append(self.scope['user'].username)
        
        # 방이 꽉 찼으면 연결 종료
        if len(LobbyConsumer.rooms[self.host_username]['players']) > LobbyConsumer.rooms[self.host_username]['mode']:
            await self.send(text_data=json.dumps({
                'type': 'room_full',
            }))
            await self.close()
            return
        
        # 방 상태가 room이 아니면 연결 종료
        if LobbyConsumer.rooms[self.host_username]['status'] != 'room':
            await self.send(text_data=json.dumps({
                'type': 'room_not_exist',
            }))
            await self.close()
            return
        
        await self.update_room_list()
        
        await self.send(text_data=json.dumps({
            'type': 'room_info',
            'room_name': LobbyConsumer.rooms[self.host_username]['room_name'],
            'host': self.host_username,
            'mode': LobbyConsumer.rooms[self.host_username]['mode'],
            'user_list': LobbyConsumer.rooms[self.host_username]['players'],
        }))

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'connect_user',
                'new_user': self.scope['user'].username,
                'room_name': LobbyConsumer.rooms[self.host_username]['room_name'],
                'host': self.host_username,
                'mode': LobbyConsumer.rooms[self.host_username]['mode'],
                'user_list': LobbyConsumer.rooms[self.host_username]['players'],
            }
        )
        
        if len(LobbyConsumer.rooms[self.host_username]['players']) == LobbyConsumer.rooms[self.host_username]['mode']:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'room_ready',
                    'host': self.host_username,
                }
            )
        
        

    async def disconnect(self, close_code):
        if self.host_username not in LobbyConsumer.rooms: # 방이 없어졌으면 그냥 종료
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            return
        
        LobbyConsumer.rooms[self.host_username]['players'].remove(self.scope['user'].username)
        
        # 게임상태가 game이면 폭파나 연결 끊기 메세지를 보내지 않음
        if LobbyConsumer.rooms[self.host_username]['status'] == 'game':
            await self.update_room_list()
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            return

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
                # 'user_list': LobbyConsumer.rooms[self.host_username]['players'],
                'room_name': LobbyConsumer.rooms[self.host_username]['room_name'],
                'host': self.host_username,
                'mode': LobbyConsumer.rooms[self.host_username]['mode'],
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
        print(data)
        if data['type'] == 'start_game':
            LobbyConsumer.rooms[self.host_username]['status'] = 'game'
            LobbyConsumer.rooms[self.host_username]['in_game_players'].append(LobbyConsumer.rooms[self.host_username]['players'][0])
            LobbyConsumer.rooms[self.host_username]['in_game_players'].append(LobbyConsumer.rooms[self.host_username]['players'][1])
            if LobbyConsumer.rooms[self.host_username]['mode'] == 4:
                LobbyConsumer.rooms[self.host_username]['in_game_players'].append(LobbyConsumer.rooms[self.host_username]['players'][2])
                LobbyConsumer.rooms[self.host_username]['in_game_players'].append(LobbyConsumer.rooms[self.host_username]['players'][3])
            
            print (LobbyConsumer.rooms[self.host_username]['in_game_players'])
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'goto_game',
                    'host': self.host_username,
                }
            )
            await self.update_room_list()
            

    async def update_room_list(self):
        channel_layer = get_channel_layer()
        # 게임중인 방은 제외
        # 룸안에 유저가 없으면 방을 삭제
        if not LobbyConsumer.rooms[self.host_username]['players'] and LobbyConsumer.rooms[self.host_username]['status'] != 'game':
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
            'room_name': LobbyConsumer.rooms[self.host_username]['room_name'],
            'host': self.host_username,
            'mode': LobbyConsumer.rooms[self.host_username]['mode'],
            'user_list': LobbyConsumer.rooms[self.host_username]['players'],
        }))
        
    async def disconnect_user(self, event):
        disconnected_user = event['disconnected_user']
        user_list = event['user_list']
        
        await self.send(text_data=json.dumps({
            'type': 'disconnect_user',
            'disconnected_user': disconnected_user,
            'room_name': LobbyConsumer.rooms[self.host_username]['room_name'],
            'host': self.host_username,
            'mode': LobbyConsumer.rooms[self.host_username]['mode'],
            'user_list': LobbyConsumer.rooms[self.host_username]['players'],
        }))
        
    async def room_ready(self, event):
        host = event['host']
        
        await self.send(text_data=json.dumps({
            'type': 'room_ready',
            'you': self.scope['user'].username,
            'host': host,
        }))
    
    async def goto_game(self, event):
        host = event['host']
        await self.send(text_data=json.dumps({
            'type': 'goto_game',
            'mode': LobbyConsumer.rooms[host]['mode'],
            'host': host,
        }))