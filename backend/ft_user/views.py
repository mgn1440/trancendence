from django.shortcuts import render
from django.views import View
from .models import CustomUser, FollowList, SingleGameRecord
from django.http import JsonResponse
from rest_framework.views import APIView
import jwt
from backend.settings import JWT_SECRET_KEY
from .serializers import CustomUserSerializer, FollowListSerializer, SingleGameRecordSerializer
from rest_framework import generics
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.generics import ListCreateAPIView, DestroyAPIView
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import NotFound, ValidationError

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
			user = get_jwt_user(request)
			user.lose += 1
			user.save()
			return JsonResponse({'status': 'success', 'lose': user.lose}, status=200)

class SingleGameRecordListView(ListAPIView):
	serializer_class = SingleGameRecordSerializer

	def get_queryset(self):
		user_id = self.kwargs['user_id']
		try:
			user = CustomUser.objects.get(uid=user_id)
			return SingleGameRecord.objects.filter(user=user)
		except CustomUser.DoesNotExist:
			raise NotFound("User does not exist")

class FriendView(ListCreateAPIView):
	queryset = FollowList.objects.all()
	serializer_class = FollowListSerializer

	def get_queryset(self):
		return FollowList.objects.filter(user=self.request.user)

	def perform_create(self, serializer):
		try:
			serializer.save(user=self.request.user)
		except Exception as e:
			raise ValidationError({'message': str(e)})

class FriendDetailView(DestroyAPIView):
	queryset = FollowList.objects.all()
	serializer_class = FollowListSerializer

	def get_object(self):
		friend_id = self.kwargs['friend_id']
		print("get_object", friend_id)
		try:
			return FollowList.objects.get(user=self.request.user, following_uid=friend_id)
		except FollowList.DoesNotExist:
			raise NotFound("Friend does not exist")

	def perform_destroy(self, instance):
		instance.delete()

def logout(request):
	response = JsonResponse({'status': 'success'}, status=200)
	response.delete_cookie('access_token')
	response.delete_cookie('refresh_token')
	response.delete_cookie('sessionid')
	return response

def test_friend(request):
	return render(request, 'online_test.html')

def get_jwt_user(request):
	access_token = request.token
	payload = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=['HS256'])
	return CustomUser.objects.get(uid=payload['uid'])
