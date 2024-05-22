import rest_framework_simplejwt
from ft_user.models import CustomUser
from django.shortcuts import render, redirect
import jwt
import re
from django.http import HttpResponse
from backend.settings import JWT_SECRET_KEY

class CustomAuthentication:
	def __init__(self, get_response):
		self.get_response = get_response
		self.API_URLS = [
			re.compile(r'^(.*)test_home/'),
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
				return HttpResponse('no user or anonymous')
			if request_user.is_authenticated:
				try:
					token = request.COOKIES.get('access_token') #이부분은 이후 Header에서 Authorization으로 받아오는 방식으로 바꿔야함
					payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256']) #이거는 try except으로 해야함. 사이닝 키로 유효성검사와 동시에 성공시 페이로드 리턴받아옴.
					user = CustomUser.objects.get(uid=payload['uid'])
					if user == request_user:
						return HttpResponse('Authenticated')
					else:
						return HttpResponse('Not Same User')
				except:
					if not token:
						return HttpResponse('not token')
					if Exception:
						return HttpResponse('token error')
			else:
				return HttpResponse('not user authenticated')
		return self.get_response(request)