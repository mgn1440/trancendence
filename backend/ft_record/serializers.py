from rest_framework import serializers
from .models import GameRecord

class GameRecordSerializer(serializers.ModelSerializer):
	class Meta:
		model = GameRecord
		fields = ['user_id', 'user_score', 'opponent_id', 'opponent_score', 'created_at']
