from rest_framework import serializers
from .models import CustomUser
from .models import SingleGameRecord, MultiGameRecord

class CustomUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['uid', 'username', 'win', 'lose', 'otp_enabled']


class SingleGameRecordSerializer(serializers.ModelSerializer):
	class Meta:
		model = SingleGameRecord
		fields = ['user_id', 'user_score', 'opponent_id', 'opponent_score', 'created_at']


class MultiGameRecordSerializer(serializers.ModelSerializer):
	class Meta:
		model = MultiGameRecord
		fields = ['user_id', 'user_win', 'opponent1_id', 'opponent2_id', 'opponent3_id', 'created_at']
