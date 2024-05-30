import rest_framework_simplejwt
from ft_user.models import CustomUser
from django.shortcuts import render, redirect
import jwt
import re
from django.http import HttpResponse
from backend.settings import JWT_SECRET_KEY
from django.http import JsonResponse

class CustomAuthentication:
	def __init__(self, get_response):
		self.get_response = get_response
		self.API_URLS = [
			re.compile(r'^(.*)test_home/'),
			re.compile(r'^(.*)user/otp/'),
		]
		self.PUBLIC_URLS = [
			re.compile(r'^(.*)login/'),
			re.compile(r'^(.*)callback/'),
			re.compile(r'^(.*)test/'),
		]
	def __call__(self, request):
		path = request.path_info.lstrip('/')
		valid_urls = (url.match(path) for url in self.API_URLS)
		public = (url.match(path) for url in self.PUBLIC_URLS)
		request_user = request.user
		if any(public):
			return self.get_response(request)
		if any(valid_urls):
			if request_user == None or request_user.is_anonymous:
				return JsonResponse({'error': 'Anonymous User'}, status=400)
			if request_user.is_authenticated:
				try:
					token = request.COOKIES.get('access_token') #이부분은 이후 Header에서 Authorization으로 받아오는 방식으로 바꿔야함
					payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256']) #이거는 try except으로 해야함. 사이닝 키로 유효성검사와 동시에 성공시 페이로드 리턴받아옴.
					user = CustomUser.objects.get(uid=payload['uid'])
					if user == request_user:
						return self.get_response(request)
					else:
						return JsonResponse({'error': 'Not Same User'}, status=400)
				except:
					if not token:
						return JsonResponse({'error': 'Empty Token'}, status=400)
					if jwt.exceptions.ExpiredSignatureError:
						return JsonResponse({'error': 'Expired Token'}, status=401)
					else:
						return JsonResponse({'error': 'Invalid Token'}, status=400)
			else:
				return JsonResponse({'error': 'not user authenticated'}, status=400)
		return self.get_response(request)