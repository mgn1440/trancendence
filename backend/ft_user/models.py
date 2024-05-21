from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
	uid = models.IntegerField(unique=True, null=True)
	two_factor_enabled = models.BooleanField(default=False, null=True)

	def __str__(self):
		return self.username
	def create_user(self, uid, username, email):
		user = self.model(
			uid=uid,
			username=username,
			email=email,
		)
		user.save(using=self._db)
		return user
	def update_two_factor(self, user, two_factor_enabled):
		user.two_factor_enabled = two_factor_enabled
		user.save(using=self._db)
		return user


# Create your models here.
