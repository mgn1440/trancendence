from rest_framework import serializers
from .models import CustomUser, FollowList, SingleGameRecord, MultiGameRecord

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
	class Meta:
		model = SingleGameRecord
		fields = ['user_score', 'opponent_name', 'opponent_profile', 'opponent_score', 'created_at']


class MultiGameRecordSerializer(serializers.ModelSerializer):
	class Meta:
		model = MultiGameRecord
		fields = ['user_win', 'opponent1_name', 'opponent1_profile', 'opponent2_name', 'opponent2_profile', 'opponent3_name', 'opponent3_profile', 'created_at']
