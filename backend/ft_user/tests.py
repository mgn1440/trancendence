from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from .models import CustomUser
from django.urls import reverse
from .serializers import CustomUserSerializer

# Create your tests here.

class UserDetailViewTest(APITestCase):
	def setUp(self):
		self.client = APIClient()
		self.user = CustomUser.objects.create_user(username='test', password='test', uid=1)
		self.url = reverse('user_detail', kwargs={'uid': self.user.uid})

	def test_user_detail_view(self):
		self.client.force_authenticate(user=self.user)
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, 200)

		response_data = response.json()
		user = CustomUser.objects.get(uid=self.user.uid)
		serializer = CustomUserSerializer(user)
		self.assertEqual(response_data['uid'], serializer.data['uid'])
		self.assertEqual(response_data['username'], serializer.data['username'])
		self.assertEqual(response_data['win'], serializer.data['win'])
		self.assertEqual(response_data['lose'], serializer.data['lose'])
		self.assertFalse(response_data['otp_enabled'])

	def test_user_detail_view_empty_uid(self):
		response = self.client.get('/api/user/2')
		self.assertEqual(response.status_code, 301) # permission denied and redirect

