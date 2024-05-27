from django.shortcuts import render
from django.views import View
from .models import CustomUser
from django.http import JsonResponse
from rest_framework.views import APIView
import jwt
from backend.settings import JWT_SECRET_KEY
from .serializers import CustomUserSerializer
from rest_framework import generics
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

class OtpUpdateView(APIView): #TODO: 미들웨어에서는 request.user가 잘 로그인 되어있다가 여기서는 AnonymousUser로 나옴. 이유를 찾아야함.
    # permission_classes = [IsAuthenticated]
    def post(self, request):
        otp_status = request.data.get('otp_status')
        if otp_status is None:
            return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
        else:
            access_token = request.COOKIES.get('access_token')
            payload = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=['HS256']) #이거는 try except으로 해야함. 사이닝 키로 유효성검사와 동시에 성공시 페이로드 리턴받아옴.
            user = CustomUser.objects.get(uid=payload['uid'])
            user.update_two_factor(otp_status)
            data = request.user
            return JsonResponse({'status': 'success'}, status=201)

class UserDetailView(generics.RetrieveAPIView):
    serializer_class = CustomUserSerializer
    def get_object(self):
        return CustomUser.objects.get(uid=self.request.user.uid)
    def get(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user)
        return JsonResponse(serializer.data, status=200)

class UserWinUpdateView(APIView):
    # permission_classes = [IsAuthenticated]
    
    @method_decorator(csrf_exempt, name='dispatch')
    def post(self, request):
        access_token = request.COOKIES.get('access_token')
        try:
            payload = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=['HS256'])
            user = CustomUser.objects.get(uid=payload['uid'])
            user.win += 1
            user.save()
            return JsonResponse({'status': 'success', 'win': user.win}, status=200)
        except jwt.ExpiredSignatureError:
            return JsonResponse({'status': 'error', 'message': 'Token expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'status': 'error', 'message': 'Invalid token'}, status=401)
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

class UserLoseUpdateView(APIView):
    # permission_classes = [IsAuthenticated]
    
    @method_decorator(csrf_exempt, name='dispatch')
    def post(self, request):
        access_token = request.COOKIES.get('access_token')
        try:
            payload = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=['HS256'])
            user = CustomUser.objects.get(uid=payload['uid'])
            user.lose += 1
            user.save()
            return JsonResponse({'status': 'success', 'lose': user.lose}, status=200)
        except jwt.ExpiredSignatureError:
            return JsonResponse({'status': 'error', 'message': 'Token expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'status': 'error', 'message': 'Invalid token'}, status=401)
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
