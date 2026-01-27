from django.contrib import admin
from .models import StudentPerformance


@admin.register(StudentPerformance)
class StudentPerformanceAdmin(admin.ModelAdmin):
    list_display = ['hours_studied', 'previous_scores', 'extracurricular', 
                    'sleep_hours', 'sample_papers', 'performance_index']
    list_filter = ['extracurricular']
    search_fields = ['hours_studied', 'previous_scores']
