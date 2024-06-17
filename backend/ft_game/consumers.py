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
        LobbyConsumer.rooms[self.room_id]['in_game_players'].remove(self.scope['user'].username)
        if LobbyConsumer.rooms[self.room_id]['mode'] != 4:
            await self.send_error_message('Room is not in tournament mode')
            await self.close()
            return

        if 'game' not in LobbyConsumer.rooms[self.room_id]:
            LobbyConsumer.rooms[self.room_id]['game'] = {
                'a' : {
                    'ball': {'x': 600, 'y': 450, 'radius': 10, 'speedX': 10, 'speedY': 10},
                    'player_bar': {'left': 360, 'right': 360},
                    'scores': {'left': 0, 'right': 0},
                    'bar_move': {'left': 0, 'right': 0},
                    'players' : [],
                },
                'b' : {
                    'ball': {'x': 600, 'y': 450, 'radius': 10, 'speedX': 10, 'speedY': 10},
                    'player_bar': {'left': 360, 'right': 360},
                    'scores': {'left': 0, 'right': 0},
                    'bar_move': {'left': 0, 'right': 0},
                    'players' : [],
                },
                'f' : {
                    'ball': {'x': 600, 'y': 450, 'radius': 10, 'speedX': 10, 'speedY': 10},
                    'player_bar': {'left': 360, 'right': 360},
                    'scores': {'left': 0, 'right': 0},
                    'bar_move': {'left': 0, 'right': 0},
                    'players' : [],
                    'waiting_players' : [],
                },
                'players': [],
                'roles' : {},
                'match' : {},
                'record' : {},
                'winner_a' : None,
                'winner_b' : None,
                'winner_f' : None,
            }

        LobbyConsumer.rooms[self.room_id]['game']['players'].append(self.scope['user'].username)

        if len(LobbyConsumer.rooms[self.room_id]['game']['players']) == 4:
            LobbyConsumer.rooms[self.room_id]['game']['roles'] = {
                LobbyConsumer.rooms[self.room_id]['game']['players'][0]: 'left',
                LobbyConsumer.rooms[self.room_id]['game']['players'][1]: 'right',
                LobbyConsumer.rooms[self.room_id]['game']['players'][2]: 'left',
                LobbyConsumer.rooms[self.room_id]['game']['players'][3]: 'right',
            }
            LobbyConsumer.rooms[self.room_id]['game']['match'] = {
                LobbyConsumer.rooms[self.room_id]['game']['players'][0]: 'a',
                LobbyConsumer.rooms[self.room_id]['game']['players'][1]: 'a',
                LobbyConsumer.rooms[self.room_id]['game']['players'][2]: 'b',
                LobbyConsumer.rooms[self.room_id]['game']['players'][3]: 'b',
            }
            LobbyConsumer.rooms[self.room_id]['game']['a']['players'] = [LobbyConsumer.rooms[self.room_id]['game']['players'][0], LobbyConsumer.rooms[self.room_id]['game']['players'][1]]
            LobbyConsumer.rooms[self.room_id]['game']['b']['players'] = [LobbyConsumer.rooms[self.room_id]['game']['players'][2], LobbyConsumer.rooms[self.room_id]['game']['players'][3]]
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_start',
                    'game': LobbyConsumer.rooms[self.room_id]['game']
                }
            )
            LobbyConsumer.rooms[self.room_id]['status'] = 'playing'
        self.game = LobbyConsumer.rooms[self.room_id]['game']
        await self.update_room_list()

    async def send_error_message(self, message):
        self.status = 'connect error'
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))

    async def disconnect(self, close_code):
        
        if self.room_id not in LobbyConsumer.rooms:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            return


        if 'game' not in LobbyConsumer.rooms[self.room_id]:
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
        
        if self.status == 'waiting':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'error',
                    'message': 'user disconnected'
                }
            )
                
        if LobbyConsumer.rooms[self.room_id]['status'] == 'room':
            del LobbyConsumer.rooms[self.room_id]['game']
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            return
            
        if self.scope['user'].username in LobbyConsumer.rooms[self.room_id]['game']['players']:
            LobbyConsumer.rooms[self.room_id]['game']['players'].remove(self.scope['user'].username)

        if self.status == 'error':
            del LobbyConsumer.rooms[self.room_id]
            await self.update_room_list()
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            return
        
        if len(LobbyConsumer.rooms[self.room_id]['game']['players']) == 0:
            del LobbyConsumer.rooms[self.room_id]['game']
            await self.update_room_list()
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            return
        
        
        match = LobbyConsumer.rooms[self.room_id]['game']['match'][self.scope['user'].username]
        role = LobbyConsumer.rooms[self.room_id]['game']['roles'][self.scope['user'].username]
        
        if role == 'observer':
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            return
        

        if match == 'f':
            
            if self.scope['user'].username in LobbyConsumer.rooms[self.room_id]['game']['f']['waiting_players']:
                LobbyConsumer.rooms[self.room_id]['game']['f']['waiting_players'].remove(self.scope['user'].username)
                if len(LobbyConsumer.rooms[self.room_id]['game']['f']['waiting_players']) == 0:
                    await self.channel_layer.group_discard(
                        self.room_group_name,
                        self.channel_name
                    )
                    return
            
            LobbyConsumer.rooms[self.room_id]['game']['f']['players'].remove(self.scope['user'].username)
            winner = LobbyConsumer.rooms[self.room_id]['game']['f']['players'][0] # 얘가 없으면 지금 매치중인 winner가 우승자
            LobbyConsumer.rooms[self.room_id]['game']['f']['players'] = []
            loser = self.scope['user'].username
            winner_role = LobbyConsumer.rooms[self.room_id]['game']['roles'][winner]
            loser_role = LobbyConsumer.rooms[self.room_id]['game']['roles'][loser]
            LobbyConsumer.rooms[self.room_id]['game']['f']['scores'][loser_role] = 0
            LobbyConsumer.rooms[self.room_id]['game']['f']['scores'][winner_role] = 3
            LobbyConsumer.rooms[self.room_id]['game']['winner_f'] = winner
            
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_over',
                    'winner': winner,
                    'loser': loser,
                    'score': LobbyConsumer.rooms[self.room_id]['game']['f']['scores'],
                    'match': 'f',
                }
            )
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            return
        
        if match == 'a':
            LobbyConsumer.rooms[self.room_id]['game']['a']['players'].remove(self.scope['user'].username)
            winner = LobbyConsumer.rooms[self.room_id]['game']['a']['players'][0]
            
            LobbyConsumer.rooms[self.room_id]['game']['f']['waiting_players'].append(winner)
            
            
            LobbyConsumer.rooms[self.room_id]['game']['a']['players'] = []
            loser = self.scope['user'].username
            winner_role = LobbyConsumer.rooms[self.room_id]['game']['roles'][winner]
            loser_role = LobbyConsumer.rooms[self.room_id]['game']['roles'][loser]
            LobbyConsumer.rooms[self.room_id]['game']['a']['scores'][loser_role] = 0
            LobbyConsumer.rooms[self.room_id]['game']['a']['scores'][winner_role] = 3
            LobbyConsumer.rooms[self.room_id]['game']['winner_a'] = winner
            LobbyConsumer.rooms[self.room_id]['game']['roles'][winner] = 'left'
            LobbyConsumer.rooms[self.room_id]['game']['match'][winner] = 'f'
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_over',
                    'winner': winner,
                    'loser': loser,
                    'score': LobbyConsumer.rooms[self.room_id]['game']['a']['scores'],
                    'match': 'a',
                }
            )
        
        elif match == 'b':
            LobbyConsumer.rooms[self.room_id]['game']['b']['players'].remove(self.scope['user'].username)
            winner = LobbyConsumer.rooms[self.room_id]['game']['b']['players'][0]
            
            
            LobbyConsumer.rooms[self.room_id]['game']['f']['waiting_players'].append(winner)
            
            
            LobbyConsumer.rooms[self.room_id]['game']['b']['players'] = []
            loser = self.scope['user'].username
            winner_role = LobbyConsumer.rooms[self.room_id]['game']['roles'][winner]
            loser_role = LobbyConsumer.rooms[self.room_id]['game']['roles'][loser]
            LobbyConsumer.rooms[self.room_id]['game']['b']['scores'][loser_role] = 0
            LobbyConsumer.rooms[self.room_id]['game']['b']['scores'][winner_role] = 3
            LobbyConsumer.rooms[self.room_id]['game']['winner_b'] = winner
            LobbyConsumer.rooms[self.room_id]['game']['roles'][winner] = 'right'
            LobbyConsumer.rooms[self.room_id]['game']['match'][winner] = 'f'
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_over',
                    'winner': winner,
                    'loser': loser,
                    'score': LobbyConsumer.rooms[self.room_id]['game']['b']['scores'],
                    'match': 'b',
                }
            )

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        
    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['type'] == 'start_game':
            self.status = 'playing'
            if self.room_id in LobbyConsumer.rooms and data['role'] == 'left' and data['match'] == 'a':
                asyncio.create_task(self.start_ball_movement('a'))
            if self.room_id in LobbyConsumer.rooms and data['role'] == 'left' and data['match'] == 'b':
                asyncio.create_task(self.start_ball_movement('b'))
        elif data['type'] == 'move_bar':
            self.update_bar_position(data['direction'], data['role'], data['match'])
        elif data['type'] == 'stop_bar':
            self.game[data['match']]['bar_move'][data['role']] = 0
        elif data['type'] == 'final_ready':
            if self.scope['user'].username == self.game['winner_a'] or self.scope['user'].username == self.game['winner_b']:    
                LobbyConsumer.rooms[self.room_id]['game']['f']['players'].append(self.scope['user'].username)
            if len(LobbyConsumer.rooms[self.room_id]['game']['f']['players']) == 2:
                if len(LobbyConsumer.rooms[self.room_id]['game']['f']['waiting_players']) != 2:
                    winner = self.scope['user'].username
                    loser = LobbyConsumer.rooms[self.room_id]['game']['f']['players'][0]
                    winner_role = LobbyConsumer.rooms[self.room_id]['game']['roles'][winner]
                    loser_role = LobbyConsumer.rooms[self.room_id]['game']['roles'][loser]
                    LobbyConsumer.rooms[self.room_id]['game']['f']['scores'][loser_role] = 0
                    LobbyConsumer.rooms[self.room_id]['game']['f']['scores'][winner_role] = 3
                    LobbyConsumer.rooms[self.room_id]['game']['winner_f'] = winner
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'game_over',
                            'winner': winner,
                            'loser': loser,
                            'score': LobbyConsumer.rooms[self.room_id]['game']['f']['scores'],
                            'match': 'f',
                        }
                    )
                    return
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'final_game_start',
                        'game': LobbyConsumer.rooms[self.room_id]['game']
                    }
                )
        elif data['type'] == 'start_final_game':
            self.status = 'playing'
            if self.room_id in LobbyConsumer.rooms and data['role'] == 'left' and data['match'] == 'f':
                asyncio.create_task(self.start_ball_movement('f'))
        elif data['type'] == 'disconnect':
            print (self.scope['user'])
            print('disconnect game ' + self.scope['user'].username)
            await self.close()
                    
    async def start_ball_movement(self, match):
        while self.status == 'playing' and self.room_id in LobbyConsumer.rooms and len(LobbyConsumer.rooms[self.room_id]['game'][match]['players']) == 2:
            self.update_ball_position(match)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_game',
                    'game': LobbyConsumer.rooms[self.room_id]['game']
                }
            )
            await asyncio.sleep(0.03)

    def update_ball_position(self, match):
        self.match = self.game[match]
        self.match['player_bar']['left'] = min(720, self.match['player_bar']['left'] + self.match['bar_move']['left'])  # Assuming bar height is 200
        self.match['player_bar']['right'] = min(720, self.match['player_bar']['right'] + self.match['bar_move']['right'])  # Assuming bar height is 200
        self.match['player_bar']['left'] = max(0, self.match['player_bar']['left'] + self.match['bar_move']['left'])  # Assuming bar height is 200
        self.match['player_bar']['right'] = max(0, self.match['player_bar']['right'] + self.match['bar_move']['right'])  # Assuming bar height is 200
        self.match['ball']['x'] += self.match['ball']['speedX']
        self.match['ball']['y'] += self.match['ball']['speedY']
        # 위 야래 벽에 부딪히면 방향 바꾸기
        if self.match['ball']['y'] + self.match['ball']['radius'] > 900 or self.match['ball']['y'] - self.match['ball']['radius'] < 0:
            self.match['ball']['speedY'] = -self.match['ball']['speedY']
        # 왼쪽 player bar에 부딪히면 방향 바꾸기
        if self.match['ball']['x'] - self.match['ball']['radius'] < 40:
            if self.match['ball']['y'] > self.match['player_bar']['left'] and self.match['ball']['y'] < self.match['player_bar']['left'] + 180:
                self.match['ball']['speedX'] = -self.match['ball']['speedX']
        # 오른쪽 player bar에 부딪히면 방향 바꾸기
        if self.match['ball']['x'] + self.match['ball']['radius'] > 1160:
            if self.match['ball']['y'] > self.match['player_bar']['right'] and self.match['ball']['y'] < self.match['player_bar']['right'] + 180:
                self.match['ball']['speedX'] = -self.match['ball']['speedX']
        # 왼쪽, 오른쪽 벽에 부딪히면 점수 올리기
        if (self.match['ball']['x'] - self.match['ball']['radius'] < 0) or (self.match['ball']['x'] + self.match['ball']['radius'] > 1200):
            if self.match['ball']['x'] - self.match['ball']['radius'] < 0:
                self.match['scores']['right'] += 1
            else:
                self.match['scores']['left'] += 1
            asyncio.create_task(self.broadcast_scores())
            asyncio.create_task(self.check_game_over(match))
            self.reset_ball(match)

    def reset_ball(self, match):
        self.game[match]['ball']['x'] = 600
        self.game[match]['ball']['y'] = 450
        self.game[match]['ball']['speedX'] = 10 * (1 if random.random() > 0.5 else -1)
        self.game[match]['ball']['speedY'] = 10 * (1 if random.random() > 0.5 else -1)

    async def broadcast_scores(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'update_game',
                'game': self.game,
            }
        )

    async def check_game_over(self, match):
        if self.game[match]['scores']['left'] >= 3:
            await self.game_end('left', 'right', match)
        elif self.game[match]['scores']['right'] >= 3:
            await self.game_end('right', 'left', match)

    async def game_end(self, winner, loser, match):
        winner_username = self.game[match]['players'][0] if winner == 'left' else self.game[match]['players'][1]
        loser_username = self.game[match]['players'][0] if loser == 'left' else self.game[match]['players'][1]
        
        LobbyConsumer.rooms[self.room_id]['game']['f']['waiting_players'].append(winner_username)
        
        if match == 'a':
            LobbyConsumer.rooms[self.room_id]['game']['winner_a'] = winner_username
            LobbyConsumer.rooms[self.room_id]['game'][match]['players'] = []
            LobbyConsumer.rooms[self.room_id]['game']['roles'][winner_username] = 'left'
            LobbyConsumer.rooms[self.room_id]['game']['roles'][loser_username] = 'observer'
            LobbyConsumer.rooms[self.room_id]['game']['match'][winner_username] = 'f'
            LobbyConsumer.rooms[self.room_id]['game']['match'][loser_username] = 'f'
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_over',
                    'winner': winner_username,
                    'loser': loser_username,
                    'score': self.game[match]['scores'],
                    'match': match,
                }
            )
        elif match == 'b':
            LobbyConsumer.rooms[self.room_id]['game']['winner_b'] = winner_username
            LobbyConsumer.rooms[self.room_id]['game'][match]['players'] = []
            LobbyConsumer.rooms[self.room_id]['game']['roles'][winner_username] = 'right'
            LobbyConsumer.rooms[self.room_id]['game']['roles'][loser_username] = 'observer'
            LobbyConsumer.rooms[self.room_id]['game']['match'][winner_username] = 'f'
            LobbyConsumer.rooms[self.room_id]['game']['match'][loser_username] = 'f'
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_over',
                    'winner': winner_username,
                    'loser': loser_username,
                    'score': self.game[match]['scores'],
                    'match': match,
                }
            )
        elif match == 'f':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_over',
                    'winner': winner_username,
                    'loser': loser_username,
                    'score': self.game[match]['scores'],
                    'match': match,
                }
            )
                        
    async def update_room_list(self):
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            "lobby",
            {
                'type': 'room_list_update',
                'rooms': list(LobbyConsumer.rooms.values())
            }
        )

    def update_bar_position(self, direction, role, match):
        if direction == 'up':
            self.game[match]['bar_move'][role] = -10
        elif direction == 'down':
            self.game[match]['bar_move'][role] = 10

    async def game_start(self, event):
        match = event['game']['match'][self.scope['user'].username]
        role = event['game']['roles'][self.scope['user'].username]
        self.status = 'game_waiting'
        await self.send(text_data=json.dumps({
            'type': 'game_start',
            'game': event['game'][match],
            'role': role,
            'match': match,
        }))
        
    async def final_game_start(self, event):
        match = 'f'
        role = event['game']['roles'][self.scope['user'].username]
        await self.send(text_data=json.dumps({
            'type': 'final_game_start',
            'game': event['game'][match],
            'role': role,
            'match': match,
        }))

    async def update_game(self, event):
        match = event['game']['match'][self.scope['user'].username]
        role = event['game']['roles'][self.scope['user'].username]
        await self.send(text_data=json.dumps({
            'type': 'update_game',
            'game': event['game'][match],
            'role': role,
            'match': match,
        }))
        
    async def game_over(self, event):
        if event['winner'] == self.scope['user'].username or event['loser'] == self.scope['user'].username:    
            self.status = 'game_waiting'
        if event['match'] == 'f':
            LobbyConsumer.rooms[self.room_id]['status'] = 'room'
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'winner': event['winner'],
            'loser': event['loser'],
            'score': event['score'],
            'match': event['match'],
            'you': self.scope['user'].username,
        }))

    async def error(self, event):
        self.status = 'error'
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
