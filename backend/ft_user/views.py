from django.shortcuts import render
from django.views import View
from .models import CustomUser, SingleGameRecord
from django.http import JsonResponse
from rest_framework.views import APIView
import jwt
from backend.settings import JWT_SECRET_KEY
from .serializers import CustomUserSerializer, SingleGameRecordSerializer
from rest_framework import generics
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.exceptions import NotFound, AuthenticationFailed
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
import json

class OtpUpdateView(View):
	# permission_classes = [IsAuthenticated]
	def post(self, request):
		otp_status = request.data.get('otp_status') #TODO: 이것도 아마 json loads를 써야할거같은데 테스트해야함.
		if otp_status is None:
			return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
		else:
			access_token = request.token
			try:
				payload = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=['HS256']) #이거는 try except으로 해야함. 사이닝 키로 유효성검사와 동시에 성공시 페이로드 리턴받아옴.
				user = CustomUser.objects.get(uid=payload['uid'])
				user.update_two_factor(otp_status)
				return JsonResponse({'status': 'success'}, status=201)
			except jwt.ExpiredSignatureError:
				return JsonResponse({'status': 'error', 'message': 'Token expired'}, status=401)
			except jwt.InvalidTokenError:
				return JsonResponse({'status': 'error', 'message': 'Invalid token'}, status=401)
			except CustomUser.DoesNotExist:
				return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

class UserDetailView(generics.RetrieveAPIView):
	serializer_class = CustomUserSerializer
	def get_object(self):
		try:
			return CustomUser.objects.get(uid=self.request.user.uid)
		except CustomUser.DoesNotExist:
			return None
	def get(self, request, *args, **kwargs):
		user = self.get_object()
		if user is None:
			return JsonResponse({'status_code': '400', 'message': 'User not found'}, status=400)
		serializer = self.get_serializer(user)
		dict_data = dict(serializer.data)
		dict_data['status_code'] = 200
		return JsonResponse(dict_data, status=200)

class UserMeView(generics.RetrieveAPIView):
	serializer_class = CustomUserSerializer
	def get_object(self):
		access_token = self.request.token
		try:
			payload = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=['HS256'])
			user = CustomUser.objects.get(uid=payload['uid'])
		except jwt.ExpiredSignatureError:
			raise AuthenticationFailed('Token expired')
		except jwt.InvalidTokenError:
			raise AuthenticationFailed('Invalid token')
		except CustomUser.DoesNotExist:
			raise AuthenticationFailed('User not found')
		return user
	def get(self, request, *args, **kwargs):
		try:
			user = self.get_object()
			serializer = self.get_serializer(user)
			return JsonResponse({'status_code': '200', 'message': serializer.data}, status=200)
		except AuthenticationFailed as e:
			return JsonResponse({'status_code': '401', 'message': str(e)}, status=401)


class UserWinUpdateView(View):
	# permission_classes = [IsAuthenticated]

	# @method_decorator(csrf_exempt, name='dispatch')
	def post(self, request):
		access_token = request.token
		try:
			payload = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=['HS256'])
			user = CustomUser.objects.get(uid=payload['uid'])
			user.win += 1
			user.save()
			return JsonResponse({'status': 'success', 'win': user.win}, status=200)
		except jwt.ExpiredSignatureError:
			return JsonResponse({'status': 'error', 'message': 'Token expired'}, status=401)
		except jwt.InvalidTokenError:
			return JsonResponse({'status': 'error', 'message': 'Invalid token'}, status=401)
		except CustomUser.DoesNotExist:
			return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

class UserLoseUpdateView(View):
	# permission_classes = [IsAuthenticated]
	def post(self, request):
		access_token = request.token
		try:
			payload = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=['HS256'])
			user = CustomUser.objects.get(uid=payload['uid'])
			user.lose += 1
			user.save()
			return JsonResponse({'status': 'success', 'lose': user.lose}, status=200)
		except jwt.ExpiredSignatureError:
			return JsonResponse({'status': 'error', 'message': 'Token expired'}, status=401)
		except jwt.InvalidTokenError:
			return JsonResponse({'status': 'error', 'message': 'Invalid token'}, status=401)
		except CustomUser.DoesNotExist:
			return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

class SingleGameRecordListView(ListAPIView):
	serializer_class = SingleGameRecordSerializer

	def get_queryset(self):
		user_id = self.kwargs['user_id']
		try:
			user = CustomUser.objects.get(uid=user_id)
			return SingleGameRecord.objects.filter(user=user)
		except CustomUser.DoesNotExist:
			raise NotFound("User does not exist")

class FriendView(View):
	def get(self, request):
		access_token = request.token
		try:
			payload = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=['HS256'])
			user = CustomUser.objects.get(uid=payload['uid'])
			friends = user.friend.all()
		except Exception as e:
			print(e)
			return JsonResponse({'statusCode': '400', 'message': '친구리스트 에러'}, status=400)
		friend_list = []
		for friend in friends:
			friend_list.append({'uid': friend.uid, 'username': friend.username})
		return JsonResponse({"friend_list": friend_list}, status=200)
	def post(self, request):
		access_token = request.token
		try:
			payload = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=['HS256'])
			user = CustomUser.objects.get(uid=payload['uid'])
			jsondata = json.loads(request.body)
			type = jsondata.get('type')
			username = jsondata.get('username')
			friend = CustomUser.objects.get(username=username)
			if user.username == username:
				return JsonResponse({'statusCode': '400', 'message': '자기 자신은 친구로 추가할 수 없습니다.'}, status=400)
			if type == 'add':
				if friend in user.friend.all():
					return JsonResponse({'statusCode': '400', 'message': '이미 친구입니다.'}, status=400)
				user.friend.add(friend)
				return JsonResponse({'statusCode': 'success'}, status=201)
			elif type == 'delete':
				if friend not in user.friend.all():
					return JsonResponse({'statusCode': '400', 'message': '친구가 아닙니다.'}, status=400)
				user.friend.remove(friend)
				return JsonResponse({'statusCode': 'success', 'message': '친구추가를 완료했습니다.'}, status=201)
		except Exception as e:
			if e.__class__.__name__ == 'DoesNotExist':
				return JsonResponse({'statusCode': '400', 'message': '존재하지 않는 유저입니다.'}, status=400)
			print(e)
			return JsonResponse({'statusCode': '400', 'message': '친구추가 에러'}, status=400)

def logout(request):
	response = JsonResponse({'status': 'success'}, status=200)
	response.delete_cookie('access_token')
	response.delete_cookie('refresh_token')
	response.delete_cookie('sessionid')
	return response

