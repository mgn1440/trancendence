from rest_framework import serializers
from .models import CustomUser
from .models import GameRecord

class CustomUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['uid', 'username', 'win', 'lose', 'otp_enabled']


class GameRecordSerializer(serializers.ModelSerializer):
	class Meta:
		model = GameRecord
		fields = ['user_id', 'user_score', 'opponent_id', 'opponent_score', 'created_at']
