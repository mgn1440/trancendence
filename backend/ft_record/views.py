from rest_framework.exceptions import NotFound
from rest_framework.generics import ListAPIView
from .models import GameRecord
from .serializers import GameRecordSerializer
from ft_user.models import CustomUser
# Create your views here.

class GameRecordList(ListAPIView):
	serializer_class = GameRecordSerializer

	# method overriding
	def get_queryset(self):
		user_id = self.kwargs['user_id']
		try:
			user = CustomUser.objects.get(uid=user_id)
			return GameRecord.objects.filter(user=user)
		except CustomUser.DoesNotExist:
				raise NotFound("User does not exist")


