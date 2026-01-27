import joblib
import numpy as np
import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from django.shortcuts import render
from .models import StudentPerformance


def frontend(request):
    """Serve the frontend HTML page"""
    return render(request, 'frontend/index.html')


def students_view(request):
    """Serve the students list page"""
    students = StudentPerformance.objects.all()[:100]  # limit to 100 for performance
    return render(request, 'frontend/students.html', {'students': students})


# Load the model
model_path = os.path.join(settings.BASE_DIR, 'performance', 'model.pkl')
model = None

try:
    if os.path.exists(model_path):
        model = joblib.load(model_path)
except Exception as e:
    print(f"Warning: Could not load model: {e}")


@api_view(['GET'])
def get_students(request):
    """API to get all students"""
    students = StudentPerformance.objects.all()[:100]
    data = [{
        'id': s.id,
        'hours_studied': s.hours_studied,
        'previous_scores': s.previous_scores,
        'extracurricular': s.extracurricular,
        'sleep_hours': s.sleep_hours,
        'sample_papers': s.sample_papers,
        'performance_index': s.performance_index,
    } for s in students]
    return Response(data)


@api_view(['POST'])
def predict_performance(request):
    if model is None:
        return Response({
            'error': 'Model not loaded. Please train the model first.'
        }, status=500)
    
    data = request.data
    
    # Validation: hours_studied + sleep_hours should not exceed 24
    hours_studied = data.get('hours_studied', 0)
    sleep_hours = data.get('sleep_hours', 0)
    
    if hours_studied + sleep_hours > 24:
        return Response({
            'error': f'Invalid input: Hours studied ({hours_studied}) + Sleep hours ({sleep_hours}) = {hours_studied + sleep_hours} hours, which exceeds 24 hours in a day.'
        }, status=400)
    
    features = np.array([[
        hours_studied,
        data['previous_scores'],
        1 if data['extracurricular'] else 0,
        sleep_hours,
        data['sample_papers'],
    ]])
    prediction = model.predict(features)[0]
    return Response({
        'predicted_performance_index': round(float(prediction), 2)
    })
