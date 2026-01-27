import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from django.conf import settings


def train():
    # Get the dataset path
    dataset_path = os.path.join(settings.BASE_DIR, 'dataset.csv')
    
    if not os.path.exists(dataset_path):
        print(f"Error: dataset.csv not found at {dataset_path}")
        return
    
    df = pd.read_csv(dataset_path)
    
    # Encode the 'Extracurricular Activities' column
    df['Extracurricular Activities'] = LabelEncoder().fit_transform(
        df['Extracurricular Activities']
    )
    
    # Prepare features and target
    X = df.drop('Performance Index', axis=1)
    y = df['Performance Index']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train the model
    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)
    
    # Save the model
    model_path = os.path.join(settings.BASE_DIR, 'performance', 'model.pkl')
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(model, model_path)
    
    # Print some metrics
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    print(f"Model trained and saved to {model_path}")
    print(f"Training R² score: {train_score:.4f}")
    print(f"Test R² score: {test_score:.4f}")
