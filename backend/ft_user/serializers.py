from rest_framework import serializers
from .models import CustomUser, FollowList, SingleGameRecord, MultiGameRecord, SingleGameDetail

class CustomUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['uid', 'username', 'win', 'lose', 'otp_enabled', 'multi_nickname', 'profile_image']

class OtherUserSerializer(serializers.ModelSerializer):
	is_following = serializers.SerializerMethodField()
	class Meta:
		model = CustomUser
		fields = ['uid', 'username', 'win', 'lose', 'multi_nickname', 'is_following', 'profile_image']
	def get_is_following(self, obj):
		request = self.context.get('request', None)
		if request is None:
			return False
		request_user = request.user
		return FollowList.objects.filter(user=request_user, following_username=obj.username).exists()

class ProfileImageSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['profile_image']

class FollowListSerializer(serializers.ModelSerializer):
	class Meta:
		model = FollowList
		fields = ['following_username']

	def validate(self, data):
		user = self.context['request'].user
		print(data)
		follow_username = data['following_username']

		if user.username == follow_username:
			raise serializers.ValidationError('자기 자신을 친구로 추가할 수 없습니다.')
		if FollowList.objects.filter(user=user, following_username=follow_username).exists():
			raise serializers.ValidationError('이미 친구로 추가된 사용자입니다.')
		return data

class SingleGameRecordSerializer(serializers.ModelSerializer):
	player1 = serializers.SerializerMethodField()
	player2 = serializers.SerializerMethodField()

	class Meta:
		model = SingleGameRecord
		fields = ['id', 'player1', 'player1_score', 'player2', 'player2_score', 'created_at']

	def get_player1(self, obj):
		return obj.player1.username

	def get_player2(self, obj):
		return obj.player2.username

	def to_representation(self, instance):
		data = super().to_representation(instance)
		username = self.context.get('username')
		if instance.player1.username == username:
			data = parse_single_game_record_data(data, 'player1', 'player2', instance.player2)
		elif instance.player2.username == username:
			data = parse_single_game_record_data(data, 'player2', 'player1', instance.player1)
		return data

def parse_single_game_record_data(data, user, opponent, opponent_instance):
	data.pop(user)
	data.pop(opponent)
	data['user_score'] = data.pop(user + '_score')
	data['opponent_name'] = opponent_instance.username
	data['opponent_profile'] = opponent_instance.profile_image.url if opponent_instance.profile_image else None
	data['opponent_score'] = data.pop(opponent + '_score')
	data['created_at'] = data.pop('created_at')
	return data



class MultiGameRecordSerializer(serializers.ModelSerializer):
	class Meta:
		model = MultiGameRecord
		fields = ['id', 'user_win', 'opponent1_name', 'opponent1_profile', 'opponent2_name', 'opponent2_profile', 'opponent3_name', 'opponent3_profile', 'created_at']

class SingleGameDetailSerializer(serializers.ModelSerializer):
	class Meta:
		model = SingleGameDetail
		fields = ['goal_user_name' ,'goal_user_position', 'ball_start_position', 'ball_end_position', 'timestamp']
