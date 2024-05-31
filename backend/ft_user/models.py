from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
	uid = models.IntegerField(unique=True, null=True)
	otp_enabled = models.BooleanField(default=False, null=True)
	password = models.CharField(max_length=128, null=True, blank=True)
	refresh_token = models.CharField(max_length=1024, null=True, blank=True)
	win = models.IntegerField(default=0)
	lose = models.IntegerField(default=0)
	# friends = models.ManyToManyField("self", blank=True)
	friends = models.ForeignKey("self", on_delete=models.CASCADE, related_name='friend', blank=True, null=True)

	def __str__(self):
		return self.username
	def update_two_factor(self,otp_enabled):
		self.otp_enabled = otp_enabled
		self.save()
	def update_refresh_token(self, refresh_token):
		self.refresh_token = refresh_token
		self.save()

class SingleGameRecord(models.Model):
	user = models.ForeignKey(CustomUser, on_delete=models.CASCADE) # 유저는 여러개의 전적을 가질 수 있다.
	user_score = models.IntegerField()
	opponent_id = models.IntegerField()
	opponent_score = models.IntegerField()
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.username}'s record at {self.created_at}"
