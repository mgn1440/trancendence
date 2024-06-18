from rest_framework import serializers
from .models import CustomUser, FollowList, SingleGameRecord, MultiGameRecord, SingleGameDetail
from rest_framework.validators import UniqueValidator

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
		follow_username = data['following_username']

		if user.username == follow_username:
			raise serializers.ValidationError('자기 자신을 친구로 추가할 수 없습니다.')
		if FollowList.objects.filter(user=user, following_username=follow_username).exists():
			raise serializers.ValidationError('이미 친구로 추가된 사용자입니다.')
		return data

class SingleGameRecordSerializer(serializers.ModelSerializer):
	class Meta:
		model = SingleGameRecord
		fields = ['id', 'player1', 'player1_score', 'player2', 'player2_score', 'created_at']

	def to_representation(self, instance):
		data = super().to_representation(instance)
		username = self.context.get('username')
		if instance.player1.username == username:
			data = self._parse_single_game_record_data(data, 'player1', 'player2', instance.player2)
		elif instance.player2.username == username:
			data = self._parse_single_game_record_data(data, 'player2', 'player1', instance.player1)
		return data

	def _parse_single_game_record_data(self, data, user, opponent, opponent_instance):
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
		fields = ['game1', 'game2', 'game3', 'player1', 'player2', 'player3', 'player4', 'created_at']

	def to_representation(self, instance):
		username = self.context.get('username')
		user = self._get_user_player(instance, username)
		opponents = self._get_opponents(instance, username)
		return {
			"id": instance.id,
			"game1_id": instance.game1.id,
			"game2_id": instance.game2.id,
			"game3_id": instance.game3.id,
			"user_name": user.username,
			"user_win": self._calculate_user_win(instance, user),
			"opponent1_name": opponents[0].username,
			"opponent1_profile": opponents[0].profile_image.url if opponents[0].profile_image else None,
			"opponent2_name": opponents[1].username,
			"opponent2_profile": opponents[1].profile_image.url if opponents[1].profile_image else None,
			"opponent3_name": opponents[2].username,
			"opponent3_profile": opponents[2].profile_image.url if opponents[2].profile_image else None,
			"created_at": instance.created_at
		}

	def _get_user_player(self, instance, username):
		if instance.player1.username == username:
			return instance.player1
		elif instance.player2.username == username:
			return instance.player2
		elif instance.player3.username == username:
			return instance.player3
		elif instance.player4.username == username:
			return instance.player4
		return None

	def _get_opponents(self, instance, username):
		opponents = []
		if instance.player1 and instance.player1.username != username:
			opponents.append(instance.player1)
		if instance.player2 and instance.player2.username != username:
			opponents.append(instance.player2)
		if instance.player3 and instance.player3.username != username:
			opponents.append(instance.player3)
		if instance.player4 and instance.player4.username != username:
			opponents.append(instance.player4)
		return opponents

	def _calculate_user_win(self, instance, user_player):
		return instance.game3.winner == user_player



class SingleGameDetailSerializer(serializers.ModelSerializer):
	class Meta:
		model = SingleGameDetail
		fields = ['goal_user_name' ,'goal_user_position', 'ball_start_position', 'ball_end_position', 'timestamp']

class DayStatSerializer(serializers.Serializer):
	day = serializers.CharField()
	count = serializers.IntegerField()
	wins = serializers.IntegerField()


class UserUpdateSerializer(serializers.ModelSerializer):
	username = serializers.CharField(
		validators=[UniqueValidator(queryset=CustomUser.objects.all(), message="This username is already used.")]
	)
	class Meta:
		model = CustomUser
		fields = ['username', 'otp_enabled','profile_image', 'multi_nickname']
