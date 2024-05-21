from django.shortcuts import render, redirect
from backend.settings import API_AUTH_URI, API_CLIENT_ID, API_REDIRECT_URI, API_CLIENT_SECRET
from django.http import HttpResponse
from ft_user.models import CustomUser
import requests
from django.contrib.auth import login
from django.views import View

def oauth(request):
	return redirect(API_AUTH_URI)


class Callback(View):
	def get(self, request):
		code = request.GET.get('code')
		data = {
			'grant_type': 'authorization_code',
			'client_id': API_CLIENT_ID,
			'client_secret': API_CLIENT_SECRET,
			'code': code,
			'redirect_uri': API_REDIRECT_URI,
		}
		response = requests.post('https://api.intra.42.fr/oauth/token', data=data)
		access_token = response.json()['access_token']
		user_info = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': 'Bearer ' + access_token})
		user_data = user_info.json()
		# return HttpResponse(user_data['id'])
		id = user_data['id']
		username = user_data['login']
		email = user_data['email']

		user, created = CustomUser.objects.get_or_create(uid=id, defaults={'username': username, 'email': email})

		if not created:
			user = CustomUser.create_user(CustomUser, id, username, email)
		login(request, user)
		return redirect('check')
		
# Create your views here.


def check(request):
	if request.user.is_authenticated:
		return HttpResponse('Authenticated')
	else:
		return HttpResponse('Not Authenticated')