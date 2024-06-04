from rest_framework import serializers
from .models import CustomUser, FollowList, SingleGameRecord, MultiGameRecord

class CustomUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['uid', 'username', 'win', 'lose', 'otp_enabled', 'multi_nickname']

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
		fields = ['user_id', 'user_score', 'opponent_id', 'opponent_score', 'created_at']


class MultiGameRecordSerializer(serializers.ModelSerializer):
	class Meta:
		model = MultiGameRecord
		fields = ['user_id', 'user_win', 'opponent1_id', 'opponent2_id', 'opponent3_id', 'created_at']
