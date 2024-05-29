from django.test import TestCase
from .views import FriendView, FriendPage, FriendRequestView
from .models import CustomUser, Friendship, FriendRequest
from rest_framework.test import APITestCase 

class TestFriendView(APITestCase):
	def setUp(self):
		CustomUser.objects.create(uid=1, username='test1', email='dasf@adsf.com')
		CustomUser.objects.create(uid=2, username='test2', email='dsaf@asdf.com')
	
	def tearDown(self):
		CustomUser.objects.all().delete()

	def test_AddRequest(self):
		self.client.force_authenticate(user=CustomUser.objects.get(uid=1))
		response = self.client.post('http://localhost:8000/api/user/friend/', {'friend': 'test2'})
		self.assertEqual(response.status_code, 201)
		self.client.force_authenticate(user=CustomUser.objects.get(uid=2))
		response = self.client.get('http://localhost:8000/api/user/friend-request/', format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['requests'], ['test1'])

	def test_checkBadRequest(self):
		self.client.force_authenticate(user=CustomUser.objects.get(uid=1))
		response = self.client.post('http://localhost:8000/api/user/friend/', {'friend': 'test1'})
		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.json()['message'], 'Cant Add Yourself')
		response = self.client.post('http://localhost:8000/api/user/friend/', {'friend': 'test3'})
		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.json()['message'], 'Invalid friend')

	def test_AlreadyRequested(self):
		self.client.force_authenticate(user=CustomUser.objects.get(uid=1))
		response = self.client.post('http://localhost:8000/api/user/friend/', {'friend': 'test2'})
		response = self.client.post('http://localhost:8000/api/user/friend/', {'friend': 'test2'})
		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.json()['message'], 'Already requested')
		self.client.force_authenticate(user=CustomUser.objects.get(uid=2))
		response = self.client.post('http://localhost:8000/api/user/friend/', {'friend': 'test1'})
		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.json()['message'], 'test1 Already requested to you')

	def test_checkAddedFriend(self):
		self.client.force_authenticate(user=CustomUser.objects.get(uid=1))
		response = self.client.post('http://localhost:8000/api/user/friend/', {'friend': 'test2'})
		self.client.force_authenticate(user=CustomUser.objects.get(uid=2))
		response = self.client.post('http://localhost:8000/api/user/friend-request/', {'nickname': 'test1'})
		self.assertEqual(response.status_code, 201)
		self.assertEqual(response.json()['status'], 'success')
		response = self.client.get('http://localhost:8000/api/user/friend/')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['friend'], ['test1'])
		self.client.force_authenticate(user=CustomUser.objects.get(uid=1))
		response = self.client.get('http://localhost:8000/api/user/friend/')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['friend'], ['test2'])

	def test_delete_oppenent_user_while_reqeusted(self):
		self.client.force_authenticate(user=CustomUser.objects.get(uid=1))
		response = self.client.post('http://localhost:8000/api/user/friend/', {'friend': 'test2'})
		CustomUser.objects.get(uid=2).delete()
		self.client.force_authenticate(user=CustomUser.objects.get(uid=1))
		response = self.client.get('http://localhost:8000/api/user/friend/')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['friend'], [])

	def test_delete_userself_while_requesting(self):
		self.client.force_authenticate(user=CustomUser.objects.get(uid=1))
		response = self.client.post('http://localhost:8000/api/user/friend/', {'friend': 'test2'})
		CustomUser.objects.get(uid=1).delete()
		self.client.force_authenticate(user=CustomUser.objects.get(uid=2))
		response = self.client.get('http://localhost:8000/api/user/friend-request/')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['requests'], [])

	def test_delete_oppenent_user_after_friend(self):
		self.client.force_authenticate(user=CustomUser.objects.get(uid=1))
		response = self.client.post('http://localhost:8000/api/user/friend/', {'friend': 'test2'})
		self.client.force_authenticate(user=CustomUser.objects.get(uid=2))
		response = self.client.post('http://localhost:8000/api/user/friend-request/', {'nickname': 'test1'})
		CustomUser.objects.get(uid=2).delete()
		self.client.force_authenticate(user=CustomUser.objects.get(uid=1))
		response = self.client.get('http://localhost:8000/api/user/friend/')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['friend'], [])

	def test_delete_userself_after_friend(self):
		self.client.force_authenticate(user=CustomUser.objects.get(uid=1))
		response = self.client.post('http://localhost:8000/api/user/friend/', {'friend': 'test2'})
		self.client.force_authenticate(user=CustomUser.objects.get(uid=2))
		response = self.client.post('http://localhost:8000/api/user/friend-request/', {'nickname': 'test1'})
		CustomUser.objects.get(uid=1).delete()
		response = self.client.get('http://localhost:8000/api/user/friend/')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['friend'], [])