import json
from channels.generic.websocket import AsyncWebsocketConsumer

class LobbyConsumer(AsyncWebsocketConsumer):
    rooms = {}
    matchmaking_queue = []
    match_user_host = {}

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
        elif data['type'] == 'matchmaking':
            await self.matchmaking()
        elif data['type'] == 'cancel_matchmaking':
            username = self.scope['user'].username
            if username in LobbyConsumer.matchmaking_queue:
                LobbyConsumer.matchmaking_queue.remove(username)
                await self.send(text_data=json.dumps({
                    'type': 'matchmaking_cancelled',
                }))
            
    async def matchmaking(self):
        username = self.scope['user'].username
        if username in LobbyConsumer.matchmaking_queue:
            await self.send(text_data=json.dumps({
                'type': 'matchmaking_waiting',
            }))
            return
        LobbyConsumer.matchmaking_queue.append(username)
        await self.send(text_data=json.dumps({
            'type': 'matchmaking_waiting',
        }))
        await self.check_matchmaking()

    async def check_matchmaking(self):
        while len(LobbyConsumer.matchmaking_queue) >= 2:
            player1 = LobbyConsumer.matchmaking_queue.pop(0)
            player2 = LobbyConsumer.matchmaking_queue.pop(0)
            room_info = {
                'room_name': 'Matchmaking Room',
                'host': player1,
                'mode': 'matchmaking',
                'is_secret': False,
                'players': [],
                'in_game_players': [player1, player2],
                'status': 'game',
            }
            LobbyConsumer.match_user_host[player1] = player1
            LobbyConsumer.match_user_host[player2] = player1
            LobbyConsumer.rooms[player1] = room_info
            await self.channel_layer.group_send(
                "lobby",
                {
                    'type': 'goto_matchmaking_game',
                }
            )
   
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

    async def goto_matchmaking_game(self, event):
        current_user = self.scope['user'].username
        if current_user in LobbyConsumer.match_user_host:
            await self.send(text_data=json.dumps({
                'type': 'goto_matchmaking_game',
                'host': LobbyConsumer.match_user_host[current_user],
            }))
            del LobbyConsumer.match_user_host[current_user]