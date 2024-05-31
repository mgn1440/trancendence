from rest_framework import serializers
from .models import CustomUser
from .models import SingleGameRecord

class CustomUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['uid', 'username', 'win', 'lose', 'otp_enabled']


class SingleGameRecordSerializer(serializers.ModelSerializer):
	class Meta:
		model = SingleGameRecord
		fields = ['user_id', 'user_score', 'opponent_id', 'opponent_score', 'created_at']
