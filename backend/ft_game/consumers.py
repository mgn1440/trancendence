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
from ft_user.models import CustomUser, SingleGameRecord
from asgiref.sync import sync_to_async

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id_str = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = self.room_id_str
        self.room_id = int(self.room_id_str)
        self.status = 'waiting'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        if self.room_id not in LobbyConsumer.rooms:
            await self.send_error_message('Room does not exist')
            await self.close()
            return

        if LobbyConsumer.rooms[self.room_id]['status'] != 'game':
            await self.send_error_message('Room is not in game status')
            await self.close()
            return

        if self.scope['user'].username not in LobbyConsumer.rooms[self.room_id]['in_game_players']:
            await self.send_error_message('You are not in game')
            await self.close()
            return

        if LobbyConsumer.rooms[self.room_id]['mode'] != 'matchmaking' and \
            LobbyConsumer.rooms[self.room_id]['mode'] != 2:
            await self.send_error_message('Room is not in matchmaking mode')
            await self.close()
            return

        if 'game' not in LobbyConsumer.rooms[self.room_id]:
            LobbyConsumer.rooms[self.room_id]['game'] = {
                'ball': {'x': 600, 'y': 450, 'radius': 10, 'speedX': 10, 'speedY': 10},
                'player_bar': {'left': 360, 'right': 360},
                'scores': {'left': 0, 'right': 0},
                'players': [],
                'roles': {},
                'bar_move': {'left': 0, 'right': 0},
            }

        LobbyConsumer.rooms[self.room_id]['game']['players'].append(self.scope['user'].username)
        if len(LobbyConsumer.rooms[self.room_id]['game']['players']) == 2:
            LobbyConsumer.rooms[self.room_id]['game']['roles'] = {
                'left': LobbyConsumer.rooms[self.room_id]['in_game_players'][0],
                'right': LobbyConsumer.rooms[self.room_id]['in_game_players'][1],
            }
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_start',
                    'game': LobbyConsumer.rooms[self.room_id]['game']
                }
            )
            LobbyConsumer.rooms[self.room_id]['status'] = 'playing'
        self.game = LobbyConsumer.rooms[self.room_id]['game']

    async def send_error_message(self, message):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))
        self.status = 'connect error'

    async def disconnect(self, close_code):
        if self.room_id not in LobbyConsumer.rooms:
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
            LobbyConsumer.rooms[self.room_id]['game']['players'].remove(self.scope['user'].username)
            # 부전승 나는 경우 => 한 명이 일방적으로 나감
            if len(LobbyConsumer.rooms[self.room_id]['game']['players']) == 1:
                winner_name = LobbyConsumer.rooms[self.room_id]['game']['players'][0]
                loser_name = self.scope['user'].username
                game_data = await GameConsumer.get_game_data(winner_name, loser_name, 5, 0)
                await GameConsumer.create_game_records(game_data)
            elif len(LobbyConsumer.rooms[self.room_id]['game']['players']) == 0:
                del LobbyConsumer.rooms[self.room_id]
            await self.update_room_list()

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(data)
        if data['type'] == 'start_game':
            if self.room_id in LobbyConsumer.rooms and len(LobbyConsumer.rooms[self.room_id]['game']['players']) != 2:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'error',
                        'message': 'Not enough players'
                    }
                )
                return
            self.status = 'playing'
            if self.room_id in LobbyConsumer.rooms and self.scope['user'].username == LobbyConsumer.rooms[self.room_id]['game']['roles']['left']:
                asyncio.create_task(self.start_ball_movement())
        elif data['type'] == 'move_bar':
            self.update_bar_position(data['direction'], data['role'])
        elif data['type'] == 'stop_bar':
            self.game['bar_move'][data['role']] = 0

    async def start_ball_movement(self):
        while self.status == 'playing' and self.room_id in LobbyConsumer.rooms and len(LobbyConsumer.rooms[self.room_id]['game']['players']) == 2:
            self.update_ball_position()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_game',
                    'game': LobbyConsumer.rooms[self.room_id]['game']
                }
            )
            await asyncio.sleep(0.03)

    def update_ball_position(self):

        self.game['player_bar']['left'] = min(720, self.game['player_bar']['left'] + self.game['bar_move']['left'])  # Assuming bar height is 200
        self.game['player_bar']['right'] = min(720, self.game['player_bar']['right'] + self.game['bar_move']['right'])  # Assuming bar height is 200
        self.game['player_bar']['left'] = max(0, self.game['player_bar']['left'] + self.game['bar_move']['left'])  # Assuming bar height is 200
        self.game['player_bar']['right'] = max(0, self.game['player_bar']['right'] + self.game['bar_move']['right'])  # Assuming bar height is 200
        self.game['ball']['x'] += self.game['ball']['speedX']
        self.game['ball']['y'] += self.game['ball']['speedY']
        # 위 야래 벽에 부딪히면 방향 바꾸기
        if self.game['ball']['y'] + self.game['ball']['radius'] > 900 or self.game['ball']['y'] - self.game['ball']['radius'] < 0:
            self.game['ball']['speedY'] = -self.game['ball']['speedY']
        # 왼쪽 player bar에 부딪히면 방향 바꾸기
        if self.game['ball']['x'] - self.game['ball']['radius'] < 40:
            if self.game['ball']['y'] > self.game['player_bar']['left'] and self.game['ball']['y'] < self.game['player_bar']['left'] + 180:
                self.game['ball']['speedX'] = -self.game['ball']['speedX']
        # 오른쪽 player bar에 부딪히면 방향 바꾸기
        if self.game['ball']['x'] + self.game['ball']['radius'] > 1160:
            if self.game['ball']['y'] > self.game['player_bar']['right'] and self.game['ball']['y'] < self.game['player_bar']['right'] + 180:
                self.game['ball']['speedX'] = -self.game['ball']['speedX']
        # 왼쪽, 오른쪽 벽에 부딪히면 점수 올리기
        if (self.game['ball']['x'] - self.game['ball']['radius'] < 0) or (self.game['ball']['x'] + self.game['ball']['radius'] > 1200):
            if self.game['ball']['x'] - self.game['ball']['radius'] < 0:
                self.game['scores']['right'] += 1
            else:
                self.game['scores']['left'] += 1
            asyncio.create_task(self.broadcast_scores())
            asyncio.create_task(self.check_game_over())
            self.reset_ball()

    def reset_ball(self):
        self.game['ball']['x'] = 600
        self.game['ball']['y'] = 450
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
        LobbyConsumer.rooms[self.room_id]['status'] = 'room'
        LobbyConsumer.rooms[self.room_id]['in_game_players'] = []
        winner_username = LobbyConsumer.rooms[self.room_id]['game']['roles'][winner]
        loser_username = LobbyConsumer.rooms[self.room_id]['game']['roles'][loser]
        del LobbyConsumer.rooms[self.room_id]['game']
        if LobbyConsumer.rooms[self.room_id]['mode'] == 'matchmaking':
            del LobbyConsumer.rooms[self.room_id]
        winner_score = self.game['scores'][winner]
        loser_score = self.game['scores'][loser]
        game_data = await GameConsumer.get_game_data(winner_username, loser_username, winner_score, loser_score)
        await GameConsumer.create_game_records(game_data)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_over',
                'winner': winner_username,
                'loser': loser_username,
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
            self.game['bar_move'][role] = -10
        elif direction == 'down':
            self.game['bar_move'][role] = 10

    async def game_start(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_start',
            'game': event['game'],
            'you': 'left' if self.scope['user'].username == event['game']['roles']['left'] else 'right'
        }))

    async def update_game(self, event):
        await self.send(text_data=json.dumps({
            'type': 'update_game',
            'game': event['game'],
            'you': 'left' if self.scope['user'].username == event['game']['roles']['left'] else 'right'
        }))

    async def game_over(self, event):
        self.status = 'game_over'
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'winner': event['winner'],
            'loser': event['loser'],
            'room_id': self.room_id
        }))

    async def error(self, event):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': event['message']
        }))

    async def create_game_records(game_data):
        await sync_to_async(SingleGameRecord.objects.create)(
            player1=game_data['player1'],
            player1_score=game_data['player1_score'],
            player2=game_data['player2'],
            player2_score=game_data['player2_score'],
        )

    async def get_game_data(player1_name, player2_name, player1_score, player2_score):
        player1 = await sync_to_async(CustomUser.objects.get)(username=player1_name)
        player2 = await sync_to_async(CustomUser.objects.get)(username=player2_name)
        if (player1_score > player2_score):
            await GameConsumer.update_user_win_or_lose(player1, player2)
        elif (player1_score < player2_score):
            await GameConsumer.update_user_win_or_lose(player2, player1)
        game_data = {
            'player1': player1,
            'player2': player2,
            'player1_score': player1_score,
            'player2_score': player2_score,
        }
        return game_data

    # 동기함수 호출을 비동기 함수로 변경
    @sync_to_async
    def update_user_win_or_lose(self, winner, loser):
        winner.win += 1
        winner.save()
        loser.lose += 1
        loser.save()



class TournamentGameConsumer(AsyncWebsocketConsumer):
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

        if LobbyConsumer.rooms[self.host_username]['mode'] != 4:
            await self.send_error_message('Room is not in tournament mode')
            await self.close()
            return

        if 'game' not in LobbyConsumer.rooms[self.host_username]:
            LobbyConsumer.rooms[self.host_username]['game'] = {
                'ball': {'x': 600, 'y': 450, 'radius': 10, 'speedX': 10, 'speedY': 10},
                'player_bar': {'left': 360, 'right': 360},
                'scores': {'left': 0, 'right': 0},
                'players': [],
                'roles': {},
                'bar_move': {'left': 0, 'right': 0},
                'current_game': 1,
            }

        LobbyConsumer.rooms[self.host_username]['game']['players'].append(self.scope['user'].username)

        if len(LobbyConsumer.rooms[self.host_username]['game']['players']) == 4:
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
        print(data)
        if data['type'] == 'start_game':
            if self.host_username in LobbyConsumer.rooms and len(LobbyConsumer.rooms[self.host_username]['game']['players']) != 4:
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
        elif data['type'] == 'stop_bar':
            self.game['bar_move'][data['role']] = 0


    async def start_ball_movement(self):
        while self.status == 'playing' and self.host_username in LobbyConsumer.rooms and len(LobbyConsumer.rooms[self.host_username]['game']['players']) == 4:
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

        self.game['player_bar']['left'] = min(720, self.game['player_bar']['left'] + self.game['bar_move']['left'])  # Assuming bar height is 200
        self.game['player_bar']['right'] = min(720, self.game['player_bar']['right'] + self.game['bar_move']['right'])  # Assuming bar height is 200
        self.game['player_bar']['left'] = max(0, self.game['player_bar']['left'] + self.game['bar_move']['left'])  # Assuming bar height is 200
        self.game['player_bar']['right'] = max(0, self.game['player_bar']['right'] + self.game['bar_move']['right'])  # Assuming bar height is 200
        self.game['ball']['x'] += self.game['ball']['speedX']
        self.game['ball']['y'] += self.game['ball']['speedY']
        # 위 야래 벽에 부딪히면 방향 바꾸기
        if self.game['ball']['y'] + self.game['ball']['radius'] > 900 or self.game['ball']['y'] - self.game['ball']['radius'] < 0:
            self.game['ball']['speedY'] = -self.game['ball']['speedY']
        # 왼쪽 player bar에 부딪히면 방향 바꾸기
        if self.game['ball']['x'] - self.game['ball']['radius'] < 40:
            if self.game['ball']['y'] > self.game['player_bar']['left'] and self.game['ball']['y'] < self.game['player_bar']['left'] + 180:
                self.game['ball']['speedX'] = -self.game['ball']['speedX']
        # 오른쪽 player bar에 부딪히면 방향 바꾸기
        if self.game['ball']['x'] + self.game['ball']['radius'] > 1160:
            if self.game['ball']['y'] > self.game['player_bar']['right'] and self.game['ball']['y'] < self.game['player_bar']['right'] + 180:
                self.game['ball']['speedX'] = -self.game['ball']['speedX']
        # 왼쪽, 오른쪽 벽에 부딪히면 점수 올리기
        if (self.game['ball']['x'] - self.game['ball']['radius'] < 0) or (self.game['ball']['x'] + self.game['ball']['radius'] > 1200):
            if self.game['ball']['x'] - self.game['ball']['radius'] < 0:
                self.game['scores']['right'] += 1
            else:
                self.game['scores']['left'] += 1
            asyncio.create_task(self.broadcast_scores())
            asyncio.create_task(self.check_game_over())
            self.reset_ball()

    def reset_ball(self):
        self.game['ball']['x'] = 600
        self.game['ball']['y'] = 450
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
        self.status = 'waiting'
        winner_username = LobbyConsumer.rooms[self.host_username]['game']['roles'][winner]
        loser_username = LobbyConsumer.rooms[self.host_username]['game']['roles'][loser]
        if LobbyConsumer.rooms[self.host_username]['game']['current_game'] == 1:
            LobbyConsumer.rooms[self.host_username]['game']['game1_winner'] = winner_username
            LobbyConsumer.rooms[self.host_username]['game']['roles'] = {
                'left': LobbyConsumer.rooms[self.host_username]['in_game_players'][2],
                'right': LobbyConsumer.rooms[self.host_username]['in_game_players'][3],
            }
            LobbyConsumer.rooms[self.host_username]['game']['current_game'] = 2
            LobbyConsumer.rooms[self.host_username]['game']['scores'] = {'left': 0, 'right': 0}
            LobbyConsumer.rooms[self.host_username]['game']['ball'] = {'x': 600, 'y': 450, 'radius': 10, 'speedX': 10, 'speedY': 10}
            LobbyConsumer.rooms[self.host_username]['game']['player_bar'] = {'left': 360, 'right': 360}
            LobbyConsumer.rooms[self.host_username]['game']['bar_move'] = {'left': 0, 'right': 0}
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_over_1',
                    'winner': winner_username,
                    'loser': loser_username,
                    'game': LobbyConsumer.rooms[self.host_username]['game']
                }
            )
        elif LobbyConsumer.rooms[self.host_username]['game']['current_game'] == 2:
            LobbyConsumer.rooms[self.host_username]['game']['game2_winner'] = winner_username
            LobbyConsumer.rooms[self.host_username]['game']['roles'] = {
                'left': LobbyConsumer.rooms[self.host_username]['game']['game1_winner'],
                'right': LobbyConsumer.rooms[self.host_username]['game']['game2_winner'],
            }
            LobbyConsumer.rooms[self.host_username]['game']['current_game'] = 3
            LobbyConsumer.rooms[self.host_username]['game']['scores'] = {'left': 0, 'right': 0}
            LobbyConsumer.rooms[self.host_username]['game']['ball'] = {'x': 600, 'y': 450, 'radius': 10, 'speedX': 10, 'speedY': 10}
            LobbyConsumer.rooms[self.host_username]['game']['player_bar'] = {'left': 360, 'right': 360}
            LobbyConsumer.rooms[self.host_username]['game']['bar_move'] = {'left': 0, 'right': 0}
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_over_2',
                    'winner': winner_username,
                    'loser': loser_username,
                    'game': LobbyConsumer.rooms[self.host_username]['game']
                }
            )
        elif LobbyConsumer.rooms[self.host_username]['game']['current_game'] == 3:
            LobbyConsumer.rooms[self.host_username]['status'] = 'room'
            LobbyConsumer.rooms[self.host_username]['in_game_players'] = []
            del LobbyConsumer.rooms[self.host_username]['game']
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_over',
                    'winner': winner_username,
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
            self.game['bar_move'][role] = -10
        elif direction == 'down':
            self.game['bar_move'][role] = 10

    async def game_start(self, event):
        you = 'left' if self.scope['user'].username == event['game']['roles']['left'] else \
            'right' if self.scope['user'].username == event['game']['roles']['right'] else \
            'observer'

        await self.send(text_data=json.dumps({
            'type': 'game_start',
            'game': event['game'],
            'you': you,
        }))

    async def update_game(self, event):
        you = 'left' if self.scope['user'].username == event['game']['roles']['left'] else \
            'right' if self.scope['user'].username == event['game']['roles']['right'] else \
            'observer'
        await self.send(text_data=json.dumps({
            'type': 'update_game',
            'game': event['game'],
            'you': you
        }))

    async def game_over_1(self, event):
        you = 'left' if self.scope['user'].username == event['game']['roles']['left'] else \
            'right' if self.scope['user'].username == event['game']['roles']['right'] else \
            'observer'
        await self.send(text_data=json.dumps({
            'type': 'game_over_1',
            'game': event['game'],
            'winner': event['winner'],
            'loser': event['loser'],
            'host_username': self.host_username,
            'you': you
        }))

    async def game_over_2(self, event):
        you = 'left' if self.scope['user'].username == event['game']['roles']['left'] else \
            'right' if self.scope['user'].username == event['game']['roles']['right'] else \
            'observer'
        await self.send(text_data=json.dumps({
            'type': 'game_over_2',
            'game': event['game'],
            'winner': event['winner'],
            'loser': event['loser'],
            'host_username': self.host_username,
            'you': you
        }))

    async def game_over(self, event):
        self.status = 'game_over'
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'winner': event['winner'],
            'host_username': self.host_username
        }))

    async def error(self, event):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': event['message']
        }))



class LocalGameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.host_username = self.scope['url_route']['kwargs']['host_username']
        self.room_group_name = f"local_game_{self.host_username}"
        self.game = {
            'ball': {'x': 600, 'y': 450, 'radius': 10, 'speedX': 10, 'speedY': 10},
            'player_bar': {'left': 360, 'right': 360},
            'scores': {'left': 0, 'right': 0},
            'bar_move': {'left': 0, 'right': 0},
        }

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_start',
                'game': self.game
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(data)
        if data['type'] == 'start_game':
            asyncio.create_task(self.start_ball_movement())
        elif data['type'] == 'move_bar':
            self.update_bar_position(data['direction'], data['role'])
        elif data['type'] == 'stop_bar':
            self.game['bar_move'][data['role']] = 0

    async def start_ball_movement(self):
        while True:
            self.update_ball_position()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_game',
                    'game': self.game
                }
            )
            await asyncio.sleep(0.03)

    def update_ball_position(self):
        self.game['player_bar']['left'] = min(720, self.game['player_bar']['left'] + self.game['bar_move']['left'])  # Assuming bar height is 200
        self.game['player_bar']['right'] = min(720, self.game['player_bar']['right'] + self.game['bar_move']['right'])  # Assuming bar height is 200
        self.game['player_bar']['left'] = max(0, self.game['player_bar']['left'] + self.game['bar_move']['left'])  # Assuming bar height is 200
        self.game['player_bar']['right'] = max(0, self.game['player_bar']['right'] + self.game['bar_move']['right'])  # Assuming bar height is 200
        self.game['ball']['x'] += self.game['ball']['speedX']
        self.game['ball']['y'] += self.game['ball']['speedY']

        # Bounce off top and bottom walls
        if self.game['ball']['y'] + self.game['ball']['radius'] > 900 or self.game['ball']['y'] - self.game['ball']['radius'] < 0:
            self.game['ball']['speedY'] = -self.game['ball']['speedY']

        # Bounce off paddles
        if self.game['ball']['x'] - self.game['ball']['radius'] < 40:
            if self.game['ball']['y'] > self.game['player_bar']['left'] and self.game['ball']['y'] < self.game['player_bar']['left'] + 180:
                self.game['ball']['speedX'] = -self.game['ball']['speedX']
        if self.game['ball']['x'] + self.game['ball']['radius'] > 1160:
            if self.game['ball']['y'] > self.game['player_bar']['right'] and self.game['ball']['y'] < self.game['player_bar']['right'] + 180:
                self.game['ball']['speedX'] = -self.game['ball']['speedX']

        # Score points
        if self.game['ball']['x'] - self.game['ball']['radius'] < 0 or self.game['ball']['x'] + self.game['ball']['radius'] > 1200:
            if self.game['ball']['x'] - self.game['ball']['radius'] < 0:
                self.game['scores']['right'] += 1
            else:
                self.game['scores']['left'] += 1
            self.reset_ball()

    def reset_ball(self):
        self.game['ball']['x'] = 600
        self.game['ball']['y'] = 450
        self.game['ball']['speedX'] = 10 * (1 if random.random() > 0.5 else -1)
        self.game['ball']['speedY'] = 10 * (1 if random.random() > 0.5 else -1)

    def update_bar_position(self, direction, role):
        if direction == 'up':
            self.game['bar_move'][role] = -10
        elif direction == 'down':
            self.game['bar_move'][role] = 10

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
