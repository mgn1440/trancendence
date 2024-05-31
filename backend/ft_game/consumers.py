import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
import django
django.setup()
import json
import asyncio
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from ft_user.models import CustomUser
from ft_lounge.manager import GameRoomManager

class GameConsumer(AsyncWebsocketConsumer):
    games = {}
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_number']
        self.room_group_name = f'game_{self.room_name}'
        self.user = self.scope['user']
        self.username = self.user.username
    
        #그룹을 처음 만들었으면 게임을 초기화
        if self.room_group_name not in self.games:
            self.games[self.room_group_name] = {
                'connected_users': set(),
                'ready_users': set(),
                'game_started': False,
                'scores': {'left': 0, 'right': 0},
                'ball': {'x': 500, 'y': 500, 'radius': 10, 'speedX': 8, 'speedY': 8},
                'player_bar': {'left': 450, 'right': 450},
                'roles': {},
                'refused_user': set(),
            }
        self.game = self.games[self.room_group_name]
           
        #그룹에 채널 추가
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        print(f"{self.username} connected")
        
        
        
        #connected_users에 사용자 추가
        self.game['connected_users'].add(self.username)
        
        
        #이미 게임이 시작중인 게임이거나 게임에 참가한 사용자가 2명 이상이면 연결 거부
        if self.game['game_started'] or len(self.game['connected_users']) >= 3:
            await self.accept()
            self.game['refused_user'].add(self.username)
            await self.send(text_data=json.dumps({
                'type': 'connection_refused',
                'message': '게임이 시작 중이거나 방이 꽉 찼습니다',
            }))
            await self.close()
            return
        
        #그룹 전체에게 사용자가 접속했다고 알림
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'connect_user',
                'new_user': self.username,
                'connected_users': list(self.game['connected_users']),
            }
        )
        
        #방 인원이 차면 그룹인원에게 알림
        if len(self.game['connected_users']) == 2:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'full_room',
                }
            )
        
        await self.accept()
        
    async def disconnect(self, close_code):
        print(f"{self.username} disconnected")
        self.game['connected_users'].remove(self.username)
        
        # 연결 거부된 사용자가 나갔을 때는 그 사람에게만 알림
        if self.username in self.game['refused_user']:
            self.game['refused_user'].remove(self.username)
            await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
            )
            return
        
        # 그룹 전체에게 사용자가 접속을 끊었다고 알림
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'disconnect_user',
                'disconnected_user': self.username,
                'connected_users': list(self.game['connected_users']),
            }
        )
        
        # 게임 시작전에 나갔을때 레디 상태 초기화, roles 초기화, 다 초기화
        if self.game['game_started'] == False:
            self.game['ready_users'].clear()
            self.game['roles'] = {}
            self.game['scores'] = {'left': 0, 'right': 0}
            self.game['ball'] = {'x': 500, 'y': 500, 'radius': 10, 'speedX': 8, 'speedY': 8}
            self.game['player_bar'] = {'left': 450, 'right': 450}
        
        # 게임 시작 후에 나갔을 때 게임 종료
        if self.game['game_started']:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_out',
                    'message': '게임이 종료되었습니다' + self.username + ' 님이 나갔습니다',
                    'out_user': self.username,
                }
            )
            self.game['game_started'] = False
            self.game['ready_users'].clear()
            self.game['roles'] = {}
            self.game['scores'] = {'left': 0, 'right': 0}
            self.game['ball'] = {'x': 500, 'y': 500, 'radius': 10, 'speedX': 8, 'speedY': 8}
            self.game['player_bar'] = {'left': 450, 'right': 450}
            
        
        # 마지막 사용자가 나갔을 때 게임 삭제
        if not self.game['connected_users']:
            del self.games[self.room_group_name]
        
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if (text_data_json['type'] == 'ready'):                      # 이벤트 타입이 ready일 때
            if self.username in self.game['ready_users']:            # 이미 레디 상태면 return
                return
            self.game['ready_users'].add(self.username)              # 레디 상태로 변경
            if len(self.game['ready_users']) == 2:                   # 두명 다 레디 상태면
                ready_users = list(self.game['ready_users'])    
                self.game['roles'][ready_users[0]] = 'left'          # 두명에게 역할 할당
                self.game['roles'][ready_users[1]] = 'right'
                await self.channel_layer.group_send(                 # 두명에게 게임 레디 상태 알림
                    self.room_group_name,
                    {
                        'type': 'all_ready',
                    }
                )
        elif (text_data_json['type'] == 'get_init_data'):            # 이벤트 타입이 get_init_data일 때
            role = self.game['roles'][self.username]
            await self.send(text_data=json.dumps({                   # 사용자에게 초기 데이터 전송
                'type': 'init_data',
                'ball': self.game['ball'],
                'left_bar': self.game['player_bar']['left'],
                'right_bar': self.game['player_bar']['right'],
                'left_user': list(self.game['roles'].keys())[0],
                'right_user': list(self.game['roles'].keys())[1],
                'scores': self.game['scores'],
                'user_side': role,
            }))
        elif (text_data_json['type'] == 'start_game'):               # 이벤트 타입이 start_game일 때
            if len(self.game['connected_users']) != 2:               # 방 인원이 2명이 아니면 return
                return
            self.game['game_started'] = True
            if self.game['roles'][self.username] == 'left':          # 왼쪽 사용자가 게임 시작하면 공 이동 시작
                asyncio.create_task(self.start_ball_movement())
        elif (text_data_json['type'] == 'move_bar'):
            if text_data_json['direction'] == 'up':
                self.game['player_bar'][text_data_json['side']] = max(0, self.game['player_bar'][text_data_json['side']] - 20)
            else:
                self.game['player_bar'][text_data_json['side']] = min(900, self.game['player_bar'][text_data_json['side']] + 20)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_bar',
                    'player_bar': self.game['player_bar'],
                }
            )


    async def start_ball_movement(self):
        while self.game['game_started']:
            self.update_ball_position()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_ball',
                    'ball': self.game['ball'],
                }
            )
            await asyncio.sleep(0.03)
            
    def update_ball_position(self):                                  # 공의 위치를 업데이트 [동기적으로 처리] 왜냐 하면 공의 위치를 업데이트 하고 나서 다음 공의 위치를 업데이트 해야하기 때문
        self.game['ball']['x'] += self.game['ball']['speedX']
        self.game['ball']['y'] += self.game['ball']['speedY']

        if self.game['ball']['y'] + self.game['ball']['radius'] > 1000 or self.game['ball']['y'] - self.game['ball']['radius'] < 0:  # 공이 위 아래 벽에 부딪히면
            self.game['ball']['speedY'] = -self.game['ball']['speedY']

        if self.game['ball']['x'] - self.game['ball']['radius'] < 30: # 바 두께 30
            if self.game['ball']['y'] > self.game['player_bar']['left'] and self.game['ball']['y'] < self.game['player_bar']['left'] + 100:     # 공이 왼쪽 바에 부딪히면
                self.game['ball']['speedX'] = -self.game['ball']['speedX']

        if self.game['ball']['x'] + self.game['ball']['radius'] > 970:
            if self.game['ball']['y'] > self.game['player_bar']['right'] and self.game['ball']['y'] < self.game['player_bar']['right'] + 100:   # 공이 오른쪽 바에 부딪히면
                self.game['ball']['speedX'] = -self.game['ball']['speedX']

        if (self.game['ball']['x'] - self.game['ball']['radius'] < 0) or (self.game['ball']['x'] + self.game['ball']['radius'] > 1000): # 공이 왼쪽 오른쪽 벽에 부딪히면
            if self.game['ball']['x'] - self.game['ball']['radius'] < 0:
                self.game['scores']['right'] += 1
            else:
                self.game['scores']['left'] += 1
            print(self.game['scores'])
            asyncio.create_task(self.broadcast_score())
            asyncio.create_task(self.check_game_over())
            self.reset_ball()        
    
    def reset_ball(self):
        self.game['ball']['x'] = 400
        self.game['ball']['y'] = 300
        self.game['ball']['speedX'] = 5 * (1 if random.random() > 0.5 else -1)
        self.game['ball']['speedY'] = 5 * (1 if random.random() > 0.5 else -1)

    async def broadcast_score(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'update_score',
                'scores': self.game['scores'],
            }
        )
    
    async def check_game_over(self):
        if self.game['scores']['left'] >= 3:
            await self.game_over('left')
        elif self.game['scores']['right'] >= 3:
            await self.game_over('right')
    
    async def game_over(self, winner):
        winner_user = list(self.game['roles'].keys())[0] if winner == 'left' else list(self.game['roles'].keys())[1]
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_end',
                'message': '게임이 종료되었습니다. ' + winner_user + ' 플레이어가 승리했습니다.',
                'winner_user': winner_user,
            }
        )
        self.game['game_started'] = False
        self.game['ready_users'].clear()
        self.game['roles'] = {}
        self.game['scores'] = {'left': 0, 'right': 0}
        self.game['ball'] = {'x': 500, 'y': 500, 'radius': 10, 'speedX': 8, 'speedY': 8}
        self.game['player_bar'] = {'left': 450, 'right': 450}
        if len(self.game['connected_users']) == 2:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'full_room',
                }
            )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))
        
    async def connect_user(self, event):
        connected_users = event['connected_users']
        new_user = event['new_user']
        await self.send(text_data=json.dumps({
            'type': 'connect_user',
            'new_user': new_user,
            'userlist': connected_users,
        }))
        
    async def disconnect_user(self, event):
        connected_users = event['connected_users']
        disconnected_user = event['disconnected_user']
        await self.send(text_data=json.dumps({
            'type': 'disconnect_user',
            'disconnected_user': disconnected_user,
            'userlist': connected_users,
        }))
        
    async def full_room(self, event):
        await self.send(text_data=json.dumps({ 
            'type': 'full_room',
        }))
        
    async def all_ready(self, event):
        await self.send(text_data=json.dumps({ 
            'type': 'all_ready',
        }))
        
    async def update_ball(self, event):
        ball = event['ball']
        await self.send(text_data=json.dumps({
            'type': 'update_ball',
            'ball': ball,
        }))
        
    async def update_score(self, event):
        scores = event['scores']
        await self.send(text_data=json.dumps({
            'type': 'update_score',
            'scores': scores,
        }))
        
    async def update_bar(self, event):
        left_bar = event['player_bar']['left']
        right_bar = event['player_bar']['right']
        await self.send(text_data=json.dumps({
            'type': 'update_bar',
            'left_bar': left_bar,
            'right_bar': right_bar,
        }))
        
    async def user_out(self, event):
        message = event['message']
        out_user = event['out_user']
        await self.send(text_data=json.dumps({
            'type': 'user_out',
            'message': message,
            'out_user': out_user,
        }))
        
    async def game_end(self, event):
        message = event['message']
        winner_user = event['winner_user']
        await self.send(text_data=json.dumps({
            'type': 'game_end',
            'message': message,
            'winner_user': winner_user,
        }))