from django.shortcuts import render

# Create your views here.
def room(request, host_username):
	return render(request, 'room.html', {"host_username": host_username})