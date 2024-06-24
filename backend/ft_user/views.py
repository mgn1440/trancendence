from django.shortcuts import get_object_or_404
from django.views import View
from .models import CustomUser, FollowList, SingleGameRecord, MultiGameRecord, SingleGameDetail
from django.http import JsonResponse
from rest_framework.views import APIView
import jwt
from backend.settings import JWT_SECRET_KEY
from .serializers import CustomUserSerializer, FollowListSerializer, SingleGameRecordSerializer, MultiGameRecordSerializer, OtherUserSerializer, ProfileImageSerializer, SingleGameDetailSerializer, DayStatSerializer, UserUpdateSerializer
from rest_framework.generics import ListCreateAPIView, DestroyAPIView, RetrieveUpdateDestroyAPIView, RetrieveAPIView, RetrieveUpdateAPIView
from rest_framework.exceptions import NotFound, ValidationError
import json
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, Count, Case, When, IntegerField
from datetime import datetime
from django.core.files.storage import default_storage


class OtpUpdateView(View):
	def post(self, request):
		otp_status = request.data.get('otp_status') #TODO: 이것도 아마 json loads를 써야할거같은데 테스트해야함.
		if otp_status is None:
			return JsonResponse({'status_code': '400', 'message': 'Invalid request'}, status=400)
		else:
			try:
				user = get_jwt_user(request)
				user.update_two_factor(otp_status)
				return JsonResponse({'status_code': '201'}, status=201)
			except jwt.ExpiredSignatureError:
				return JsonResponse({'status_code': '401', 'message': 'Token expired'}, status=401)
			except jwt.InvalidTokenError:
				return JsonResponse({'status_code': '401', 'message': 'Invalid token'}, status=401)
			except CustomUser.DoesNotExist:
				return JsonResponse({'status_code': '401', 'message': 'User not found'}, status=404)

class UserNameDetailView(RetrieveAPIView):
	serializer_class = OtherUserSerializer
	def get_object(self):
		try:
			return CustomUser.objects.get(username=self.kwargs['username'])
		except CustomUser.DoesNotExist:
			return None
	def get(self, request, *args, **kwargs):
		user = self.get_object()
		if user is None:
			return JsonResponse({'status_code': '400', 'message': 'User not found'}, status=400)
		serializer = self.get_serializer(user)
		return JsonResponse({'status_code': '200', 'user_info': serializer.data}, status=200)

class UserMeView(RetrieveUpdateAPIView):
	serializer_class = CustomUserSerializer
	def get(self, request, *args, **kwargs):
		user = get_jwt_user(self.request)
		serializer = self.get_serializer(user)
		return JsonResponse({'status_code': '200', 'user_info': serializer.data}, status=200)
	def update(self, request, *args, **kwargs):
		user = get_jwt_user(self.request)
		partial = kwargs.pop('partial', False)
		serializer = UserUpdateSerializer(user, data=request.data, partial=partial)
		if serializer.is_valid(raise_exception=True):
			serializer.save()
			profile_image = request.FILES.get('profile_image')
			if profile_image:
				try:
					user.profile_image = profile_image
					user.save()
				except Exception as e:
					return JsonResponse({'status_code': '400', 'message': str(e)}, status=400)
			elif profile_image is None:
				user.profile_image = None
				user.save()
			return JsonResponse({'status_code': '200', 'user_info': serializer.data}, status=200)
		return JsonResponse({'status_code': '400', 'message': serializer.error}, status=400)

class ProfileImageView(RetrieveUpdateDestroyAPIView):
	serializer_class = ProfileImageSerializer
	parser_classes = [MultiPartParser, FormParser]
	def get_object(self):
		username = self.kwargs['username']
		user = get_object_or_404(CustomUser, username=username)
		return user
	def get(self, request, *args, **kwargs):
		user = self.get_object()
		serializer = self.get_serializer(user)
		return JsonResponse({'status_code': '200', 'profile_image': serializer.data}, status=200)
	def destroy(self, request, *args, **kwargs):
		user = self.get_object()
		if user.profile_image:
			user.profile_image.delete(save=False)
		user.profile_image = None
		user.save()
		return JsonResponse({'status_code': '204', 'message': 'Profile image deleted'}, status=204)


class SingleGameRecordListView(APIView):
	def get(self, request, username):
		try:
			user = CustomUser.objects.get(username=username)
			record_list = SingleGameRecord.objects.filter((Q(player1=user) | Q(player2=user)) & Q(is_tournament=False))
			serializer = SingleGameRecordSerializer(record_list, many=True, context={'username': username})
			return JsonResponse({'statusCode': '200', 'record_list': serializer.data}, status=200)
		except CustomUser.DoesNotExist:
			return JsonResponse({'statusCode': '404', 'message': 'User does not exist'}, status=404)

class MultiGameRecordListView(APIView):
	def get(self, request, username):
		try:
			user = CustomUser.objects.get(username=username)
			record_list = MultiGameRecord.objects.filter(Q(player1=user) | Q(player2=user) | Q(player3=user) | Q(player4=user))
			serializer = MultiGameRecordSerializer(record_list, many=True, context={'username': username})
			return JsonResponse({'statusCode': '200', 'record_list': serializer.data}, status=200)
		except CustomUser.DoesNotExist:
			return JsonResponse({'statusCode': '404', 'message': 'User does not exist'}, status=404)

class FollowView(ListCreateAPIView):
	queryset = FollowList.objects.all()
	serializer_class = FollowListSerializer
	def get_queryset(self):
		return FollowList.objects.filter(user=self.request.user)
	def perform_create(self, serializer):
		try:
			serializer.save(user=self.request.user)
		except Exception as e:
			raise ValidationError({'message': str(e)})
	def list(self, request, *args, **kwargs):
		serializer = self.get_serializer(self.get_queryset(), many=True)
		return JsonResponse({'status_code': '200', 'following_list': serializer.data}, status=200)
	def create(self, request, *args, **kwargs):
		json_data = json.loads(request.body)
		serializer = self.get_serializer(data=json_data)
		serializer.is_valid(raise_exception=True)
		self.perform_create(serializer)
		return JsonResponse({'status_code': '201', 'message': 'Friend added'}, status=201)

class FollowDetailView(DestroyAPIView):
	queryset = FollowList.objects.all()
	serializer_class = FollowListSerializer
	def get_object(self):
		follow_username = self.kwargs['username']
		try:
			return FollowList.objects.get(user=self.request.user, following_username=follow_username)
		except FollowList.DoesNotExist:
			raise NotFound("follow user does not exist")
	def perform_destroy(self, instance):
		instance.delete()

class SingleGameDetailListView(APIView):
	def get(self, request, game_id):
		try:
			game = SingleGameRecord.objects.get(id=game_id)
			goal_list = SingleGameDetail.objects.filter(game=game)
			serializer = SingleGameDetailSerializer(goal_list, many=True)
			return JsonResponse({'statusCode': '200', 'goal_list': serializer.data}, status=200)
		except SingleGameRecord.DoesNotExist:
			return JsonResponse({'statusCode': '404', 'message': 'Game record dose not exist'}, status=404)

class DayStatAPIView(APIView):
	def get(self, request, username):
		if not CustomUser.objects.filter(username=username).exists():
			return JsonResponse({'status_code': '404', 'message': 'User not found'}, status=404)
		records = SingleGameRecord.objects.filter(
			Q(player1__username=username) | Q(player2__username=username)
		)
		stats = records.extra(select={'day': 'DATE(created_at)'}).values('day').annotate(
			count=Count('id'),
			wins=Count(Case(When(winner=username, then=1), output_field=IntegerField()))
		)

		all_days = {day: {'count': 0, 'wins': 0} for day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
		for record in stats:
			day_date = record['day']
			if isinstance(day_date, str):
					day_date = datetime.strptime(day_date, '%Y-%m-%d')
			day_abbr = day_date.strftime('%a') # Get 3-letter abbreviation for the day
			all_days[day_abbr] = {
				'count': record['count'],
				'wins': record['wins'],
			}
		# Convert the dictionary to a list of dictionaries for serialization
		day_count_stats = [{'day': day, 'count': data['count'], 'wins': data['wins']} for day, data in all_days.items()]

		# Sort the list by day order (Mon-Sun)
		day_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
		day_count_stats = sorted(day_count_stats, key=lambda x: day_order.index(x['day']))
		serializer = DayStatSerializer(day_count_stats, many=True)
		return JsonResponse({'status_code': '200', 'day_count_stats': serializer.data}, status=200)

class RecentOpponentsAPIView(APIView):
	def get(self, request, username):
		if not CustomUser.objects.filter(username=username).exists():
			return JsonResponse({'status_code': '404', 'message': 'User not found'}, status=404)
		user = CustomUser.objects.get(username=username)
		recent_games = SingleGameRecord.objects.filter(
			Q(player1=user) | Q(player2=user)
		).order_by('-created_at')[:20] # 최근 20개의 게임을 조회
		opponent_records = {}
		for game in recent_games:
			opponent = game.player2 if game.player1 == user else game.player1
			if opponent.username not in opponent_records:
				opponent_records[opponent.username] = {
					'profile_image': opponent.profile_image.url if opponent.profile_image else None,
					'total': 0,
					'wins': 0,
					'loses': 0,
				}
			if game.winner == user.username:
				opponent_records[opponent.username]['wins'] += 1
			else:
				opponent_records[opponent.username]['loses'] += 1
			opponent_records[opponent.username]['total'] += 1
		return JsonResponse({'status_code': '200', 'opponent_records': opponent_records}, status=200)

class AverageLineAPIView(APIView):
	def get(self, request, username):
		if not CustomUser.objects.filter(username=username).exists():
			return JsonResponse({'status_code': '404', 'message': 'User not found'}, status=404)
		user = CustomUser.objects.get(username=username)
		records = SingleGameRecord.objects.filter(
			Q(player1=user) | Q(player2=user)
		).order_by('created_at')

		win_rates = [1 if record.winner == username else 0 for record in records]
		overall_win_rate = self.calculate_win_rate(win_rates)
		moving_average_3 = self.moving_average(win_rates, 3)
		moving_average_5 = self.moving_average(win_rates, 5)

		response_data = {
			'status_code': '200',
			'index': list(range(len(win_rates), 0, -1)),
			'rates_total': overall_win_rate,
			'rates_3play': moving_average_3,
			'rates_5play': moving_average_5,
		}

		return JsonResponse(response_data, status=200)

	def calculate_win_rate(self, win_rates):
		cumulative_wins = 0
		cumulative_win_rates = []
		for i, win in enumerate(win_rates):
			cumulative_wins += win
			cumulative_win_rates.append(round(cumulative_wins / (i + 1) * 100, 2))
		return cumulative_win_rates

	def moving_average(self, data, window_size):
		moving_averages = []
		for i in range(len(data)):
			if i < window_size - 1:
				moving_averages.append(0.0)
			else:
				window_avg = sum(data[i-window_size+1:i+1]) / window_size
				moving_averages.append(round(window_avg * 100, 2))
		return moving_averages


def logout(request):
	response = JsonResponse({'status': 'success'}, status=200)
	response.delete_cookie('access_token')
	response.delete_cookie('refresh_token')
	response.delete_cookie('sessionid')
	return response

def get_jwt_user(request):
	access_token = request.token
	payload = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=['HS256'])
	return CustomUser.objects.get(uid=payload['uid'])
