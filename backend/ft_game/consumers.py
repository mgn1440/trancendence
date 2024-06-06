import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
import django
django.setup()
import json
import asyncio
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from ft_lobby.consumers import LobbyConsumer

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.host_username = self.scope['url_route']['kwargs']['host_username']
        self.room_group_name = self.host_username
        self.status = 'waiting'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        if self.host_username not in LobbyConsumer.rooms:
            await self.send_error_message('Room does not exist')
            await self.close()
            return

        if LobbyConsumer.rooms[self.host_username]['status'] != 'game':
            await self.send_error_message('Room is not in game status')
            await self.close()
            return

        if self.scope['user'].username not in LobbyConsumer.rooms[self.host_username]['in_game_players']:
            await self.send_error_message('You are not in game')
            await self.close()
            return

        if 'game' not in LobbyConsumer.rooms[self.host_username]:
            LobbyConsumer.rooms[self.host_username]['game'] = {
                'ball': {'x': 400, 'y': 200, 'radius': 10, 'speedX': 10, 'speedY': 10},
                'player_bar': {'left': 150, 'right': 150},
                'scores': {'left': 0, 'right': 0},
                'players': [],
                'roles': {},
            }

        LobbyConsumer.rooms[self.host_username]['game']['players'].append(self.scope['user'].username)

        if len(LobbyConsumer.rooms[self.host_username]['game']['players']) == 2:
            LobbyConsumer.rooms[self.host_username]['game']['roles'] = {
                'left': LobbyConsumer.rooms[self.host_username]['in_game_players'][0],
                'right': LobbyConsumer.rooms[self.host_username]['in_game_players'][1],
            }
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_start',
                    'game': LobbyConsumer.rooms[self.host_username]['game']
                }
            )
            LobbyConsumer.rooms[self.host_username]['status'] = 'playing'
        self.game = LobbyConsumer.rooms[self.host_username]['game']

    async def send_error_message(self, message):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))
        self.status = 'connect error'

    async def disconnect(self, close_code):
        if self.host_username not in LobbyConsumer.rooms:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            return

        if self.status == 'connect error':
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            return


        if self.status == 'playing' or self.status == 'waiting':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'error',
                    'message': 'user disconnected'
                }
            )
            LobbyConsumer.rooms[self.host_username]['game']['players'].remove(self.scope['user'].username)
            if len(LobbyConsumer.rooms[self.host_username]['game']['players']) == 0:
                del LobbyConsumer.rooms[self.host_username]
            await self.update_room_list()

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['type'] == 'start_game':
            if self.host_username in LobbyConsumer.rooms and len(LobbyConsumer.rooms[self.host_username]['game']['players']) != 2:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'error',
                        'message': 'Not enough players'
                    }
                )
                return
            self.status = 'playing'
            if self.host_username in LobbyConsumer.rooms and self.scope['user'].username == LobbyConsumer.rooms[self.host_username]['game']['roles']['left']:
                asyncio.create_task(self.start_ball_movement())
        elif data['type'] == 'move_bar':
            self.update_bar_position(data['direction'], data['role'])

    async def start_ball_movement(self):
        while self.status == 'playing' and self.host_username in LobbyConsumer.rooms and len(LobbyConsumer.rooms[self.host_username]['game']['players']) == 2:
            self.update_ball_position()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_game',
                    'game': LobbyConsumer.rooms[self.host_username]['game']
                }
            )
            await asyncio.sleep(0.03)

    def update_ball_position(self):
        self.game['ball']['x'] += self.game['ball']['speedX']
        self.game['ball']['y'] += self.game['ball']['speedY']

        if self.game['ball']['y'] + self.game['ball']['radius'] > 400 or self.game['ball']['y'] - self.game['ball']['radius'] < 0:
            self.game['ball']['speedY'] = -self.game['ball']['speedY']

        if self.game['ball']['x'] - self.game['ball']['radius'] < 20:
            if self.game['ball']['y'] > self.game['player_bar']['left'] and self.game['ball']['y'] < self.game['player_bar']['left'] + 100:
                self.game['ball']['speedX'] = -self.game['ball']['speedX']

        if self.game['ball']['x'] + self.game['ball']['radius'] > 780:
            if self.game['ball']['y'] > self.game['player_bar']['right'] and self.game['ball']['y'] < self.game['player_bar']['right'] + 100:
                self.game['ball']['speedX'] = -self.game['ball']['speedX']

        if (self.game['ball']['x'] - self.game['ball']['radius'] < 0) or (self.game['ball']['x'] + self.game['ball']['radius'] > 800):
            if self.game['ball']['x'] - self.game['ball']['radius'] < 0:
                self.game['scores']['right'] += 1
            else:
                self.game['scores']['left'] += 1
            asyncio.create_task(self.broadcast_scores())
            asyncio.create_task(self.check_game_over())
            self.reset_ball()

    def reset_ball(self):
        self.game['ball']['x'] = 400
        self.game['ball']['y'] = 200
        self.game['ball']['speedX'] = 10 * (1 if random.random() > 0.5 else -1)
        self.game['ball']['speedY'] = 10 * (1 if random.random() > 0.5 else -1)

    async def broadcast_scores(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'update_game',
                'game': self.game,
            }
        )

    async def check_game_over(self):
        if self.game['scores']['left'] >= 3:
            await self.game_end('left', 'right')
        elif self.game['scores']['right'] >= 3:
            await self.game_end('right', 'left')

    async def game_end(self, winner, loser):
        self.status = 'game_over'
        del LobbyConsumer.rooms[self.host_username]['game']
        LobbyConsumer.rooms[self.host_username]['status'] = 'room'
        LobbyConsumer.rooms[self.host_username]['in_game_players'] = []
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_over',
                'winner': winner,
                'loser': loser,
            }
        )
        await self.update_room_list()

    async def update_room_list(self):
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            "lobby",
            {
                'type': 'room_list_update',
                'rooms': list(LobbyConsumer.rooms.values())
            }
        )

    def update_bar_position(self, direction, role):
        if direction == 'up':
            self.game['player_bar'][role] = max(0, self.game['player_bar'][role] - 10)
        elif direction == 'down':
            self.game['player_bar'][role] = min(300, self.game['player_bar'][role] + 10)  # Assuming bar height is 100

    async def game_start(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_start',
            'game': event['game']
        }))

    async def update_game(self, event):
        await self.send(text_data=json.dumps({
            'type': 'update_game',
            'game': event['game']
        }))

    async def game_over(self, event):
        self.status = 'game_over'
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'winner': event['winner'],
            'loser': event['loser'],
        }))
        
    async def error(self, event):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': event['message']
        }))