from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
	uid = models.IntegerField(unique=True, null=True)
	two_factor_enabled = models.BooleanField(default=False, null=True)
	password = models.CharField(max_length=128, null=True, blank=True)
	refresh_token = models.CharField(max_length=1024, null=True, blank=True)

	def __str__(self):
		return self.username
	def update_two_factor(self,two_factor_enabled):
		self.two_factor_enabled = two_factor_enabled
		self.save()
	def update_refresh_token(self, refresh_token):
		self.refresh_token = refresh_token
		self.save()
