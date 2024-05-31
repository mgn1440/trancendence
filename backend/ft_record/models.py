from django.db import models
from ft_user.models import CustomUser

# Create your models here.
class GameRecord(models.Model):
	user = models.ForeignKey(CustomUser, on_delete=models.CASCADE) # 유저는 여러개의 전적을 가질 수 있다.
	user_score = models.IntegerField()
	opponent_id = models.IntegerField()
	opponent_score = models.IntegerField()
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.username} vs {self.opponent_id} at {self.created_at}"
