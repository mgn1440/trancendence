from rest_framework import serializers
from .models import CustomUser, FollowList

class CustomUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['username', 'win', 'lose', 'otp_enabled']

class FollowListSerializer(serializers.ModelSerializer):
	class Meta:
		model = FollowList
		fields = ['following_username']

	def validate(self, data):
		user = self.context['request'].user
		following_username = data['following_username']
		
		if user.username == following_username:
			raise serializers.ValidationError('자기 자신을 친구로 추가할 수 없습니다.')
		if FollowList.objects.filter(user=user, following_username=following_username).exists():
			raise serializers.ValidationError('이미 친구로 추가된 사용자입니다.')
		return data