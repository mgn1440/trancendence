from rest_framework import serializers
from .models import CustomUser, FollowList, SingleGameRecord, MultiGameRecord

class CustomUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['uid', 'username', 'win', 'lose', 'otp_enabled', 'multi_nickname']

class OtherUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['uid', 'username', 'win', 'lose', 'multi_nickname']

class FollowListSerializer(serializers.ModelSerializer):
	class Meta:
		model = FollowList
		fields = ['following_uid']

	def validate(self, data):
		user = self.context['request'].user
		following_uid = data['following_uid']

		if user.uid == following_uid:
			raise serializers.ValidationError('자기 자신을 친구로 추가할 수 없습니다.')
		if FollowList.objects.filter(user=user, following_uid=following_uid).exists():
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
