from django.urls import path
from .views import predict_performance, get_students

urlpatterns = [
    path('predict/', predict_performance, name='predict_performance'),
    path('students/', get_students, name='api_students'),
]
