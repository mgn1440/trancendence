from django.shortcuts import render

def game_room(request, room_number):
    return render(request, 'game_room.html', {"room_number": room_number})