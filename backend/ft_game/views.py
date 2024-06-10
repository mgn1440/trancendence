from django.shortcuts import render

def game_room(request, room_number):
    return render(request, 'game_room.html', {"room_number": room_number})


def game(request, host_username):
	return render(request, 'game.html', {"host_username": host_username})

def tournament_game(request, host_username):
	return render(request, 'tournament_game.html', {"host_username": host_username})