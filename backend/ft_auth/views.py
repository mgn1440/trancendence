from django.shortcuts import render, redirect
from backend.settings import API_AUTH_URI, API_CLIENT_ID, API_REDIRECT_URI, API_CLIENT_SECRET, SENDER_EMAIL, APP_PASSWORD, JWT_SECRET_KEY
from django.http import HttpResponse
from ft_user.models import CustomUser
from django.contrib.auth import login
from django.views import View
from ft_auth.utils import send_email
from .serializers import MyTokenObtainPairSerializer
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
import requests
import base64
import pyotp
import jwt
from django_otp.plugins.otp_email.models import EmailDevice
from django.urls import reverse

def oauth(request):
	return redirect(API_AUTH_URI)

class Callback(View): # TODO: POST otp check function
	def get(self, request):
		code = request.GET.get('code')
		if code is None:
			return JsonResponse({'error': 'No code'}, status=400)
		data = {
			'grant_type': 'authorization_code',
			'client_id': API_CLIENT_ID,
			'client_secret': API_CLIENT_SECRET,
			'code': code,
			'redirect_uri': API_REDIRECT_URI,
		}
		response = requests.post('https://api.intra.42.fr/oauth/token', data=data)
		if response.status_code != 200:
			return JsonResponse({'error': '42 API Access Token Error'}, status=400)
		access_token = response.json()['access_token']
		if access_token is None:
			return JsonResponse({'error': 'Empty Access Token Error'}, status=400)
		user_info = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': 'Bearer ' + access_token})
		if user_info.status_code != 200:
			return JsonResponse({'error': '42 API /v2/me Error'}, status=400)
		user_data = user_info.json()
		id = user_data['id']
		username = user_data['login']
		email = user_data['email']

		user, created = CustomUser.objects.get_or_create(uid=id, defaults={'username': username, 'email': email})

		if created:
			device = EmailDevice.objects.create(user=user, email=user.email)
		login(request, user)

		if user.otp_enabled:
			device = EmailDevice.objects.filter(user=user).first()
			device.generate_token(length=6, valid_secs=300)
			otp_code = device.token
			html = f'<html><body><p>Your OTP is {otp_code}</p></body></html>'
			try:
				send_email(SENDER_EMAIL, user.email, APP_PASSWORD, "Your OTP Code for 2FA", "dfasd", html)
			except Exception as e:
				return JsonResponse({'error': f'Email Error: {e}'}, status=400)
			return redirect('otp')	
			# return JsonResponse({'otp': 'true'}, status=200)
		else:
			return redirect_main_page(user)
			# response = JsonResponse({'otp', 'false'}, status=200)
			# tokens = generate_jwt(user)
			# response.set_cookie('access_token', tokens['access_token'])
			# response.set_cookie('refresh_token', tokens['refresh_token'])
			# return response
def check(request):
	if request.user.is_authenticated:    #이부분이 이미 장고에의해 리퀘스트의 바디?에 user가 들어와있는지 확인하는부분. 따라서 user가 있는지도 확인해야함
		otp_code = request.GET.get('otp_code')
		user = request.user
		if user.otp_enabled:
			device = EmailDevice.objects.filter(user=user).first()
			if device.verify_token(otp_code):

				token = request.COOKIES.get('access_token') #이부분은 이후 Header에서 Authorization으로 받아오는 방식으로 바꿔야함
				try:
					payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256']) #이거는 try except으로 해야함. 사이닝 키로 유효성검사와 동시에 성공시 페이로드 리턴받아옴.
					token_user = CustomUser.objects.get(uid=payload['uid'])
					if token_user == user:
						return HttpResponse('Fully 2FA and JWT Authenticated')
					else:
						return HttpResponse('Not Same User')
				except:
					return HttpResponse('Invalid Token')
			else:
				return HttpResponse('Invalid OTP')
		else:
			token = request.COOKIES.get('access_token')
			payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256']) #이거는 try except으로 해야함. 사이닝 키로 유효성검사와 동시에 성공시 페이로드 리턴받아옴.
			token_user = CustomUser.objects.get(uid=payload['uid'])
			if token_user == user:
				return HttpResponse('JWT Authenticated')
			else:
				return HttpResponse('Invalid JWT')
	else:
		return HttpResponse('Not Authenticated')
	
def number_input_view(request):
	if not request.user or request.user.is_anonymous:
		return redirect('test')
	if not request.user.otp_enabled:
		return redirect('test')
	if request.method == 'POST':
		data = json.loads(request.body)
		combined_number = data.get('combined_number', '')
		device = EmailDevice.objects.filter(user=request.user).first()
		if device.verify_token(combined_number):
			response = JsonResponse({'status': 'success', 'redirect_url': reverse('test_home')}, status=200)
			tokens = generate_jwt(request.user)
			response.set_cookie('access_token', tokens['access_token'])
			response.set_cookie('refresh_token', tokens['refresh_token'])
			return response
		else:
			return JsonResponse({'error': 'Invalid OTP'}, status=400)
	if request.method == 'GET':
		return render(request, 'twoFA.html')
	return JsonResponse({'error': 'Invalid request'}, status=400)

	
def redirect_main_page(user):
	response = redirect('test_home') # TODO: change main page
	tokens = generate_jwt(user)
	response.set_cookie('access_token', tokens['access_token'])
	response.set_cookie('refresh_token', tokens['refresh_token'])
	return response
	
def generate_jwt(user):
	serializer = MyTokenObtainPairSerializer()
	token = serializer.get_token(user)
	access_token = str(token.access_token)
	refresh_token = str(token)
	user.update_refresh_token(refresh_token)
	tokens = {
		'access_token': access_token,
		'refresh_token': refresh_token,
	}
	return tokens

def test(request):
	return render(request, 'test.html')

def test_home(request):
	return render(request, 'test_home.html')


def refresh(request):
	# if request.method != 'POST':
		# return JsonResponse({'error': 'Invalid request'}, status=400)
	refresh_token = request.COOKIES.get('refresh_token')
	if not refresh_token:
		return JsonResponse({'error': 'No refresh token'}, status=400)
	user = request.user
	if not user or user.is_anonymous:
		return JsonResponse({'error': 'No user'}, status=400)
	real_user = CustomUser.objects.get(uid=user.uid)
	if real_user.refresh_token != refresh_token:
		return JsonResponse({'error': 'Invalid refresh token' , 'user_refresh_token': real_user.refresh_token, 
					   'cookie_refresh_token': refresh_token}, status=400)
	tokens = generate_jwt(user)
	response = JsonResponse({'status': 'success'}, status=200)
	response.set_cookie('access_token', tokens['access_token'])
	response.set_cookie('refresh_token', tokens['refresh_token'])
	return response
