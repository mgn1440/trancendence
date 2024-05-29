from django.contrib import admin
from . import models

admin.site.register(models.CustomUser)
admin.site.register(models.Friendship)
admin.site.register(models.FriendRequest)
# Register your models here.
