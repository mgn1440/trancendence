from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
	uid = models.IntegerField(primary_key=True)
	username = models.CharField(max_length=128, unique=True)
	otp_enabled = models.BooleanField(default=False, null=True)
	password = models.CharField(max_length=128, null=True, blank=True)
	refresh_token = models.CharField(max_length=1024, null=True, blank=True)
	win = models.IntegerField(default=0)
	lose = models.IntegerField(default=0)
	multi_nickname = models.CharField(max_length=128, null=True, blank=True)

	def __str__(self):
		return self.username
	def update_two_factor(self,otp_enabled):
		self.otp_enabled = otp_enabled
		self.save()
	def update_refresh_token(self, refresh_token):
		self.refresh_token = refresh_token
		self.save()

class FollowList(models.Model):
	user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
	following_username = models.CharField(max_length=128, null=True, blank=True)

	def __str__(self):
		return f'{self.user} follows {self.following_username}'

	def save(self, *args, **kwargs):
		if self.user.username == self.following_username:
			raise Exception('자기 자신을 친구로 추가할 수 없습니다.')
		if FollowList.objects.filter(user=self.user, following_username=self.following_username).exists():
			raise Exception('이미 친구로 추가된 사용자입니다.')
		super().save(*args, **kwargs)

class SingleGameRecord(models.Model):
	user = models.ForeignKey(CustomUser, on_delete=models.CASCADE) # 유저는 여러개의 전적을 가질 수 있다.
	user_score = models.IntegerField()
	opponent_id = models.IntegerField()
	opponent_name = models.CharField(max_length=128, null=True, blank=True)
	opponent_profile = models.CharField(max_length=1024, null=True, blank=True)
	opponent_score = models.IntegerField()
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.username}'s single-game-record at {self.created_at}"

class MultiGameRecord(models.Model):
	user = models.ForeignKey(CustomUser, on_delete=models.CASCADE) # 유저는 여러개의 전적을 가질 수 있다.
	user_win = models.BooleanField(default=False)
	opponent1_id = models.IntegerField()
	opponent1_name = models.CharField(max_length=128, null=True, blank=True)
	opponent1_profile = models.CharField(max_length=1024, null=True, blank=True)
	opponent2_id = models.IntegerField()
	opponent2_name = models.CharField(max_length=128, null=True, blank=True)
	opponent2_profile = models.CharField(max_length=1024, null=True, blank=True)
	opponent3_id = models.IntegerField()
	opponent3_name = models.CharField(max_length=128, null=True, blank=True)
	opponent3_profile = models.CharField(max_length=1024, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.username}'s multi-game-record at {self.created_at}"

