"""
URL configuration for student_ml project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from performance.views import frontend, students_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('performance.urls')),
    path('', frontend, name='frontend'),
    path('students/', students_view, name='students'),
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
