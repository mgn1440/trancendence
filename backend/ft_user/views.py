from django.shortcuts import render
from django.views import View
from .models import CustomUser, Friendship, FriendRequest
from django.http import JsonResponse
from rest_framework.views import APIView
import json
import jwt
from backend.settings import JWT_SECRET_KEY
from .serializers import CustomUserSerializer
from rest_framework import generics

# Create your views here.
# class Otp(View):
# 	def post(self, request):
# 		try:
# 			data = json.loads(request.body)
# 			otp_status = data.get('otp_status')
# 		except (json.JSONDecodeError, KeyError):
# 			return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
# 		if otp_status is None:
# 			return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
# 		else:
# 			user = CustomUser.objects.get(uid=request.user.uid)
# 			user.update_two_factor(otp_status)
# 			return JsonResponse({'status': 'success'}, status=201)

class OtpUpdateView(APIView): #TODO: 미들웨어에서는 request.user가 잘 로그인 되어있다가 여기서는 AnonymousUser로 나옴. 이유를 찾아야함.
	# permission_classes = [IsAuthenticated]
	def post(self, request):
		otp_status = request.data.get('otp_status')
		if otp_status is None:
			return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
		else:
			access_token = request.COOKIES.get('access_token')
			payload = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=['HS256']) #이거는 try except으로 해야함. 사이닝 키로 유효성검사와 동시에 성공시 페이로드 리턴받아옴.
			user = CustomUser.objects.get(uid=payload['uid'])
			user.update_two_factor(otp_status)
			data = request.user
			return JsonResponse({'status': 'success'}, status=201)
		
class UserDetailView(generics.RetrieveAPIView):
	serializer_class = CustomUserSerializer
	def get_object(self):
		return CustomUser.objects.get(uid=self.request.user.uid)
	def get(self, request, *args, **kwargs):
		user = self.get_object()
		serializer = self.get_serializer(user)
		return JsonResponse(serializer.data, status=200)
	
class FriendView(APIView):
	def get(self, request):
		user = request.user
		friend = user.friend.all()
		friend_list = []
		for f in friend:
			friend_list.append(f.friend.username)
		return JsonResponse({'friend': friend_list}, status=200)
	def post(self, request):
		try:
			data = request.data
			friend = data.get('friend')
		except (json.JSONDecodeError, KeyError):
			return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
		if friend is None:
			return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
		else:
			user = request.user
			try:
				friend = CustomUser.objects.get(username=friend)
			except CustomUser.DoesNotExist:
				return JsonResponse({'status': 'error', 'message': 'Invalid friend'}, status=400)
			if user.uid == friend.uid:
				return JsonResponse({'status': 'error', 'message': 'Cant Add Yourself'}, status=400)
			if user.friend.filter(friend=friend).exists():
				return JsonResponse({'status': 'error', 'message': 'Already friend'}, status=400)
			if FriendRequest.objects.filter(from_user=user, to_user=friend).exists():
				return JsonResponse({'status': 'error', 'message': 'Already requested'}, status=400)
			if FriendRequest.objects.filter(from_user=friend, to_user=user).exists():
				return JsonResponse({'status': 'error', 'message': f'{friend} Already requested to you'}, status=400)
			FriendRequest.objects.create(from_user=user, to_user=friend)
			return JsonResponse({'status': 'success'}, status=201)

def FriendPage(request):
	print(request.user)
	return render(request, 'test_friend.html')

class FriendRequestView(APIView):
	def get(self, request):
		headers = request.headers
		print(headers)
		user = request.user
		user = FriendRequest.objects.filter(to_user=user)
		request = []
		for f in user:
			request.append(f.from_user.username)
		return JsonResponse({'requests': request}, status=200)
	def post(self, request):
		try:
			data = request.data
			friend = data.get('nickname')
		except (json.JSONDecodeError, KeyError):
			return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
		if friend is None:
			return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
		else:
			user = request.user
			try:
				from_user = CustomUser.objects.get(username=friend)
			except CustomUser.DoesNotExist:
				return JsonResponse({'status': 'error', 'message': 'Invalid friend'}, status=400)
			try:
				relationship = FriendRequest.objects.get(from_user=from_user, to_user=user)
			except FriendRequest.DoesNotExist:
				return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
			from_user.friends.add(user)
			relationship.delete()
			return JsonResponse({'status': 'success'}, status=201)
