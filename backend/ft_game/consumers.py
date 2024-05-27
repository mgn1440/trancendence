import json
import asyncio
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from django.http import JsonResponse
import requests

class GameConsumer(AsyncWebsocketConsumer):
    connected_users = {}
    ready_users = set()
    roles = {}
    scores = {'left': 0, 'right': 0}
    ball = {'x': 400, 'y': 300, 'radius': 10, 'speedX': 5, 'speedY': 5}
    player_bar = {'left': 250, 'right': 250}
    game_started = False  # 게임 시작 상태를 나타내는 플래그 추가

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_number']
        self.room_group_name = f"game_{self.room_name}"
        self.user_id = str(self.scope["user"].id)  # Ensure user_id is a string
        self.username = self.scope["user"].username  # 유저의 닉네임 가져오기

        # 유저 정보 출력
        print(f"User ID: {self.user_id}, Username: {self.username}")

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        self.connected_users[self.user_id] = self.username

        # Assign roles
        if len(self.connected_users) == 1:
            self.roles[self.user_id] = 'left'
        elif len(self.connected_users) == 2:
            self.roles[self.user_id] = 'right'
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'start_game',
                    'message': 'Two players connected. Start the game!',
                    'roles': self.roles,
                    'scores': self.scores,  # Send initial scores
                    'usernames': self.connected_users  # 유저의 닉네임도 전송
                }
            )

        await self.accept()  # 모든 경우에 accept() 호출

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        self.connected_users.pop(self.user_id, None)
        self.ready_users.discard(self.user_id)
        self.roles.pop(self.user_id, None)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')

        if message_type == 'ready':
            self.ready_users.add(self.user_id)
            if len(self.ready_users) == 2 and not self.game_started:
                self.game_started = True  # 게임 시작 상태를 업데이트
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'initiate_game',
                        'message': 'Both players are ready. Start the game!'
                    }
                )
                asyncio.create_task(self.start_ball_movement())  # Start ball movement after both players are ready
        elif message_type == 'move':
            # Ensure position data exists
            position = text_data_json.get('position')
            player = text_data_json.get('player')
            if position is not None and player is not None:
                # Update player bar position
                self.player_bar[player] = position

                # Broadcast the move to other players
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'player_move',
                        'player': player,
                        'position': position
                    }
                )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
    
    async def start_game(self, event):
        message = event['message']
        roles = event['roles']
        scores = event['scores']
        usernames = event['usernames']

        # Send start game message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'start_game',
            'message': message,
            'roles': roles,
            'scores': scores,
            'usernames': usernames  # 유저의 닉네임도 전송
        }))
    
    async def initiate_game(self, event):
        message = event['message']

        # Send initiate game message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'initiate_game',
            'message': message
        }))
    
    async def player_move(self, event):
        player = event['player']
        position = event['position']

        # Send player move to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'move',
            'player': player,
            'position': position
        }))
    
    async def ball_position(self, event):
        ball = event['ball']

        # Send ball position to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'ball_position',
            'ball': ball
        }))
    
    async def update_scores(self, event):
        scores = event['scores']

        print('Scores:', scores)  # 디버깅 메시지 추가
        # Send scores to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'update_scores',
            'scores': scores
        }))

    async def start_ball_movement(self):
        while self.game_started:  # 게임이 시작된 경우에만 공을 움직임
            self.update_ball_position()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'ball_position',
                    'ball': self.ball
                }
            )
            await asyncio.sleep(0.01)

    def update_ball_position(self):
        self.ball['x'] += self.ball['speedX']
        self.ball['y'] += self.ball['speedY']

        # Ball collision with top and bottom walls
        if self.ball['y'] + self.ball['radius'] > 600 or self.ball['y'] - self.ball['radius'] < 0:
            self.ball['speedY'] = -self.ball['speedY']

        # Ball collision with left bar
        if self.ball['x'] - self.ball['radius'] < 10:
            if self.ball['y'] > self.player_bar['left'] and self.ball['y'] < self.player_bar['left'] + 100:
                self.ball['speedX'] = -self.ball['speedX']

        # Ball collision with right bar
        if self.ball['x'] + self.ball['radius'] > 790:
            if self.ball['y'] > self.player_bar['right'] and self.ball['y'] < self.player_bar['right'] + 100:
                self.ball['speedX'] = -self.ball['speedX']

        # Ball out of bounds (left or right)
        if (self.ball['x'] - self.ball['radius'] < 0) or (self.ball['x'] + self.ball['radius'] > 800):
            if self.ball['x'] - self.ball['radius'] < 0:
                self.scores['right'] += 1
            else:
                self.scores['left'] += 1
            print('Broadcasting scores:', self.scores)  # 디버깅 메시지 추가
            asyncio.create_task(self.broadcast_scores())
            self.check_game_over()
            self.reset_ball()

    def reset_ball(self):
        self.ball['x'] = 400
        self.ball['y'] = 300
        self.ball['speedX'] = 2 * (1 if random.random() > 0.5 else -1)
        self.ball['speedY'] = 2 * (1 if random.random() > 0.5 else -1)

    async def broadcast_scores(self):
        print('Sending scores:', self.scores)  # 디버깅 메시지 추가
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'update_scores',
                'scores': self.scores
            }
        )
    
    def check_game_over(self):
        if self.scores['left'] >= 5:
            self.end_game('left', 'right')
        elif self.scores['right'] >= 5:
            self.end_game('right', 'left')

    def end_game(self, winner, loser):
        winner_id = [uid for uid, role in self.roles.items() if role == winner][0]
        loser_id = [uid for uid, role in self.roles.items() if role == loser][0]
        # Update winner and loser in the database
        # requests.post('http://127.0.0.1:8000/api/user/win/', data={'user_id': winner_id})
        # requests.post('http://127.0.0.1:8000/api/user/lose/', data={'user_id': loser_id})
        print(f"Game Over! Winner: {winner}, Loser: {loser}")

        # Send game over message to clients
        asyncio.create_task(self.send_game_over_message(winner))

        # Reset game state
        self.game_started = False
        self.scores = {'left': 0, 'right': 0}
        self.ball = {'x': 400, 'y': 300, 'radius': 10, 'speedX': 5, 'speedY': 5}
        self.player_bar = {'left': 250, 'right': 250}

    async def send_game_over_message(self, winner):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'end_game',
                'winner': winner
            }
        )
