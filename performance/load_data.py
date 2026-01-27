import pandas as pd
import os
from django.conf import settings
from performance.models import StudentPerformance


def run():
    # Get the dataset path
    dataset_path = os.path.join(settings.BASE_DIR, 'dataset.csv')
    
    if not os.path.exists(dataset_path):
        print(f"Error: dataset.csv not found at {dataset_path}")
        return
    
    df = pd.read_csv(dataset_path)
    
    # Clear existing data (optional - comment out if you want to keep existing data)
    # StudentPerformance.objects.all().delete()
    
    count = 0
    for _, row in df.iterrows():
        StudentPerformance.objects.create(
            hours_studied=row['Hours Studied'],
            previous_scores=row['Previous Scores'],
            extracurricular=row['Extracurricular Activities'] == 'Yes',
            sleep_hours=row['Sleep Hours'],
            sample_papers=row['Sample Question Papers Practiced'],
            performance_index=row['Performance Index'],
        )
        count += 1
    
    print(f"Loaded {count} records into the database")
