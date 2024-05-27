import json
import asyncio
import random
from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    games = {}  # 각 방의 게임 상태를 저장할 딕셔너리

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_number']
        self.room_group_name = f"game_{self.room_name}"
        self.user_id = str(self.scope["user"].id)
        self.username = self.scope["user"].username

        # 게임 상태 초기화
        if self.room_group_name not in self.games:
            self.games[self.room_group_name] = {
                'connected_users': {},
                'ready_users': set(),
                'roles': {},
                'scores': {'left': 0, 'right': 0},
                'ball': {'x': 400, 'y': 300, 'radius': 10, 'speedX': 5, 'speedY': 5},
                'player_bar': {'left': 250, 'right': 250},
                'game_started': False
            }
        self.game = self.games[self.room_group_name]

        # 유저 정보 출력
        print(f"User ID: {self.user_id}, Username: {self.username}")

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        self.game['connected_users'][self.user_id] = self.username

        # Assign roles
        if len(self.game['connected_users']) == 1:
            self.game['roles'][self.user_id] = 'left'
        elif len(self.game['connected_users']) == 2:
            self.game['roles'][self.user_id] = 'right'
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'start_game',
                    'message': 'Two players connected. Start the game!',
                    'roles': self.game['roles'],
                    'scores': self.game['scores'],
                    'usernames': self.game['connected_users']
                }
            )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        self.game['connected_users'].pop(self.user_id, None)
        self.game['ready_users'].discard(self.user_id)
        self.game['roles'].pop(self.user_id, None)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')

        if message_type == 'ready':
            self.game['ready_users'].add(self.user_id)
            if len(self.game['ready_users']) == 2 and not self.game['game_started']:
                self.game['game_started'] = True
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'initiate_game',
                        'message': 'Both players are ready. Start the game!'
                    }
                )
                asyncio.create_task(self.start_ball_movement())
        elif message_type == 'move':
            direction = text_data_json.get('direction')
            player = self.game['roles'][self.user_id]
            if direction == 'up':
                self.game['player_bar'][player] = max(0, self.game['player_bar'][player] - 10)
            elif direction == 'down':
                self.game['player_bar'][player] = min(500, self.game['player_bar'][player] + 10)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_move',
                    'player': player,
                    'position': self.game['player_bar'][player]
                }
            )

    async def player_move(self, event):
        player = event['player']
        position = event['position']

        await self.send(text_data=json.dumps({
            'type': 'move',
            'player': player,
            'position': position
        }))

    async def start_game(self, event):
        message = event['message']
        roles = event['roles']
        scores = event['scores']
        usernames = event['usernames']

        await self.send(text_data=json.dumps({
            'type': 'start_game',
            'message': message,
            'roles': roles,
            'scores': scores,
            'usernames': usernames
        }))
    
    async def initiate_game(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'type': 'initiate_game',
            'message': message
        }))
    
    async def ball_position(self, event):
        ball = event['ball']

        await self.send(text_data=json.dumps({
            'type': 'ball_position',
            'ball': ball
        }))
    
    async def update_scores(self, event):
        scores = event['scores']

        print('Scores:', scores)
        await self.send(text_data=json.dumps({
            'type': 'update_scores',
            'scores': scores
        }))

    async def start_ball_movement(self):
        while self.game['game_started']:
            self.update_ball_position()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'ball_position',
                    'ball': self.game['ball']
                }
            )
            await asyncio.sleep(0.03)

    def update_ball_position(self):
        self.game['ball']['x'] += self.game['ball']['speedX']
        self.game['ball']['y'] += self.game['ball']['speedY']

        if self.game['ball']['y'] + self.game['ball']['radius'] > 600 or self.game['ball']['y'] - self.game['ball']['radius'] < 0:
            self.game['ball']['speedY'] = -self.game['ball']['speedY']

        if self.game['ball']['x'] - self.game['ball']['radius'] < 10:
            if self.game['ball']['y'] > self.game['player_bar']['left'] and self.game['ball']['y'] < self.game['player_bar']['left'] + 100:
                self.game['ball']['speedX'] = -self.game['ball']['speedX']

        if self.game['ball']['x'] + self.game['ball']['radius'] > 790:
            if self.game['ball']['y'] > self.game['player_bar']['right'] and self.game['ball']['y'] < self.game['player_bar']['right'] + 100:
                self.game['ball']['speedX'] = -self.game['ball']['speedX']

        if (self.game['ball']['x'] - self.game['ball']['radius'] < 0) or (self.game['ball']['x'] + self.game['ball']['radius'] > 800):
            if self.game['ball']['x'] - self.game['ball']['radius'] < 0:
                self.game['scores']['right'] += 1
            else:
                self.game['scores']['left'] += 1
            print('Broadcasting scores:', self.game['scores'])
            asyncio.create_task(self.broadcast_scores())
            asyncio.create_task(self.check_game_over())  # 비동기 호출
            # asyncio.create_task(self.send_game_over_message("surkim", "s"))  # 비동기 호출
            self.reset_ball()

    def reset_ball(self):
        self.game['ball']['x'] = 400
        self.game['ball']['y'] = 300
        self.game['ball']['speedX'] = 5 * (1 if random.random() > 0.5 else -1)
        self.game['ball']['speedY'] = 5 * (1 if random.random() > 0.5 else -1)

    async def broadcast_scores(self):
        print('Sending scores:', self.game['scores'])
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'update_scores',
                'scores': self.game['scores']
            }
        )
    
    async def check_game_over(self):
        if self.game['scores']['left'] >= 5:
            await self.end_game('left', 'right')
        elif self.game['scores']['right'] >= 5:
            await self.end_game('right', 'left')

    async def end_game(self, winner, loser):
        print(loser)
        winner_id = [uid for uid, role in self.game['roles'].items() if role == winner][0]
        loser_id = [uid for uid, role in self.game['roles'].items() if role == loser][0]
        winner_name = self.game['connected_users'][winner_id]
        loser_name = self.game['connected_users'][loser_id]
        print(f"Game Over! Winner: {winner_name}, Loser: {loser_name}")

        await self.send_game_over_message(winner_name, loser_name)

        # self.game['game_started'] = False
        self.game['scores'] = {'left': 0, 'right': 0}
        self.game['ball'] = {'x': 400, 'y': 300, 'radius': 10, 'speedX': 5, 'speedY': 5}
        self.game['player_bar'] = {'left': 250, 'right': 250}

    async def send_game_over_message(self, winner_name, loser_name):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'end_game',
                'winner': winner_name,
                'loser': loser_name
            }
        )
