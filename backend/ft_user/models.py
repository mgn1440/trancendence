from django.db import models
from django.contrib.auth.models import AbstractUser
import pyotp
from django_otp.models import Device

class CustomUser(AbstractUser):
	uid = models.IntegerField(unique=True, null=True)
	two_factor_enabled = models.BooleanField(default=False, null=True)
	password = models.CharField(max_length=128, null=True, blank=True)

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

class EmailTOTPDevice(Device):
	user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
	key = models.CharField(max_length=80, unique=True)
	step = models.PositiveIntegerField(default=30)
	t0 = models.BigIntegerField(default=0)
	digits = models.PositiveSmallIntegerField(default=6)
	tolerance = models.PositiveSmallIntegerField(default=1)
	drift = models.SmallIntegerField(default=0)

	def create(self, user, key):
		device = EmailTOTPDevice(user = user, key = key)
		device.save()
		return device

	def generate_token(self):
		totp = pyotp.TOTP(self.key, digits=self.digits, interval=self.step)
		return totp.now()

	def verify_token(self, token):
		totp = pyotp.TOTP(self.key, digits=self.digits, interval=self.step)
		return totp.verify(token, valid_window=self.tolerance)

	# @classmethod
	# def create(cls, user, key):
	# 	device = cls(user=user, key=key)
	# 	device.save()
	# 	return device

# Create your models here.
